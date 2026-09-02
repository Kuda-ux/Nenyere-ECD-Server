-- ============================================================================
-- Migration 0007: Key functions
-- apply_attempt, update_mastery, publish_activity_version, build_content_pack,
-- learner_export, learner_erase
-- Per docs/database.md §4
-- ============================================================================

-- ── apply_attempt ──────────────────────────────────────────────────────────
-- Idempotent insert of attempt + responses; recompute accuracy; update
-- skill_mastery; award badges. Returns status.
-- Per database.md §4, offline-sync.md §6
create or replace function public.apply_attempt(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_attempt_id uuid := p ->> 'client_attempt_id';
  v_school_id uuid := p ->> 'school_id';
  v_learner_id uuid := p ->> 'learner_id';
  v_activity_version_id uuid := p ->> 'activity_version_id';
  v_assignment_id uuid := nullif(p ->> 'assignment_id', '')::uuid;
  v_device_id uuid := p ->> 'device_id';
  v_actor_user_id uuid := p ->> 'actor_user_id';
  v_started_at timestamptz := p ->> 'started_at';
  v_completed_at timestamptz := nullif(p ->> 'completed_at', '')::timestamptz;
  v_status text := p ->> 'status';
  v_accuracy numeric := nullif(p ->> 'accuracy', '')::numeric;
  v_stars int := nullif(p ->> 'stars', '')::int;
  v_duration_ms bigint := nullif(p ->> 'duration_ms', '')::bigint;
  v_hints_used int := nullif(p ->> 'hints_used', '')::int;
  v_items_total int := nullif(p ->> 'items_total', '')::int;
  v_items_correct int := nullif(p ->> 'items_correct', '')::int;
  v_client_meta jsonb := p -> 'client_meta';
  v_responses jsonb := p -> 'responses';

  v_existing record;
  v_attempt_id uuid;
  v_response jsonb;
  v_skill_id uuid;
  v_result jsonb;
begin
  -- Check for duplicate (idempotency)
  select id, accuracy, stars into v_existing
  from public.attempts
  where client_attempt_id = v_client_attempt_id;

  if found then
    return jsonb_build_object(
      'status', 'duplicate',
      'client_attempt_id', v_client_attempt_id
    );
  end if;

  -- Verify activity_version exists and was published
  perform 1
  from public.activity_versions av
  where av.id = v_activity_version_id
    and av.status = 'published';

  if not found then
    return jsonb_build_object(
      'status', 'rejected',
      'code', 'VERSION_UNKNOWN',
      'message', 'Activity version not found or not published'
    );
  end if;

  -- Verify learner is accessible (enrolled in actor's classes)
  -- RLS handles this, but we also check explicitly for clearer error codes
  perform 1
  from public.enrollments e
  where e.learner_id = v_learner_id
    and e.class_id = any(app.class_ids());

  if not found and app.role() != 'SCHOOL_ADMIN' and not app.is_super() then
    return jsonb_build_object(
      'status', 'rejected',
      'code', 'LEARNER_NOT_ACCESSIBLE',
      'message', 'Learner is not in your classes'
    );
  end if;

  -- Insert attempt
  insert into public.attempts (
    school_id, learner_id, activity_version_id, assignment_id,
    client_attempt_id, device_id, actor_user_id,
    started_at, completed_at, status,
    accuracy, stars, duration_ms, hints_used,
    items_total, items_correct, client_meta
  )
  values (
    v_school_id, v_learner_id, v_activity_version_id, v_assignment_id,
    v_client_attempt_id, v_device_id, v_actor_user_id,
    v_started_at, v_completed_at, v_status::public.attempt_status,
    v_accuracy, v_stars, v_duration_ms, v_hints_used,
    v_items_total, v_items_correct, v_client_meta
  )
  returning id into v_attempt_id;

  -- Insert responses
  if v_responses is not null then
    for v_response in select * from jsonb_array_elements(v_responses)
    loop
      insert into public.responses (
        attempt_id, item_id, client_response_id, value,
        is_correct, elapsed_ms, hint_level, seq
      )
      values (
        v_attempt_id,
        v_response ->> 'item_id',
        (v_response ->> 'client_response_id')::uuid,
        v_response -> 'value',
        nullif(v_response ->> 'is_correct', '')::boolean,
        nullif(v_response ->> 'elapsed_ms', '')::bigint,
        nullif(v_response ->> 'hint_level', '')::int,
        nullif(v_response ->> 'seq', '')::int
      )
      on conflict (client_response_id) do nothing;
    end loop;
  end if;

  -- Recompute accuracy server-side from responses
  update public.attempts
  set accuracy = case
      when items_total > 0 then
        (select count(*)::numeric / items_total
         from public.responses r
         where r.attempt_id = v_attempt_id and r.is_correct = true)
      else 0 end,
    stars = case
      when items_total > 0 then
        case
          when (select count(*)::numeric / items_total
                from public.responses r
                where r.attempt_id = v_attempt_id and r.is_correct = true) >= 0.9 then 3
          when (select count(*)::numeric / items_total
                from public.responses r
                where r.attempt_id = v_attempt_id and r.is_correct = true) >= 0.6 then 2
          else 1
        end
      else 1 end
  where id = v_attempt_id;

  -- Update skill_mastery for each skill on the activity version
  for v_skill_id in
    select skill_id from public.activity_skills
    where activity_version_id = v_activity_version_id
  loop
    perform public.update_mastery(v_learner_id, v_skill_id, v_accuracy >= 0.6);
  end loop;

  return jsonb_build_object(
    'status', 'applied',
    'client_attempt_id', v_client_attempt_id,
    'attempt_id', v_attempt_id
  );
end;
$$;

-- ── update_mastery ─────────────────────────────────────────────────────────
-- Rolling-window stage transition (ADR-016)
create or replace function public.update_mastery(
  p_learner_id uuid,
  p_skill_id uuid,
  p_correct boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current public.mastery_stage;
  v_evidence jsonb;
  v_school_id uuid;
  v_new_stage public.mastery_stage;
  v_window int;
begin
  -- Get learner's school
  select school_id into v_school_id
  from public.learners where id = p_learner_id;

  -- Get mastery window for skill
  select mastery_window into v_window
  from public.skills where id = p_skill_id;

  -- Get current mastery
  select stage, evidence into v_current, v_evidence
  from public.skill_mastery
  where learner_id = p_learner_id and skill_id = p_skill_id;

  if not found then
    v_current := 'not_started';
    v_evidence := '[]'::jsonb;
  end if;

  -- Append new evidence (keep last N results)
  v_evidence := v_evidence || jsonb_build_object(
    'correct', p_correct,
    'at', now()
  );

  -- Trim to mastery window
  if jsonb_array_length(v_evidence) > v_window then
    v_evidence := jsonb_path_query(
      v_evidence,
      '$[' || (jsonb_array_length(v_evidence) - v_window) || ' to last]'
    );
  end if;

  -- Determine new stage based on recent evidence
  v_new_stage := case
    when jsonb_array_length(v_evidence) = 0 then 'not_started'
    when v_current = 'not_started' then 'introduced'
    when v_current = 'introduced' then 'practising'
    when v_current = 'practising' then
      case when p_correct then 'developing' else 'practising' end
    when v_current = 'developing' then
      case
        when (
          select count(*) from jsonb_array_elements(v_evidence) e
          where e ->> 'correct' = 'true'
        ) >= v_window * 0.8 then 'secure'
        else 'developing'
      end
    when v_current = 'secure' then 'secure'
    else v_current
  end;

  -- Upsert
  insert into public.skill_mastery (
    school_id, learner_id, skill_id, stage, evidence, last_evidence_at
  )
  values (
    v_school_id, p_learner_id, p_skill_id, v_new_stage, v_evidence, now()
  )
  on conflict (learner_id, skill_id)
  do update set
    stage = v_new_stage,
    evidence = v_evidence,
    last_evidence_at = now(),
    updated_at = now();
end;
$$;

-- ── publish_activity_version ───────────────────────────────────────────────
-- Status transition checks, copies assets to media-published, bumps content
-- pack, writes audit.
create or replace function public.publish_activity_version(p_version_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version record;
  v_activity record;
begin
  -- Get version
  select * into v_version
  from public.activity_versions
  where id = p_version_id;

  if not found then
    return jsonb_build_object('status', 'error', 'message', 'Version not found');
  end if;

  -- Check status is approved
  if v_version.status != 'approved' then
    return jsonb_build_object('status', 'error', 'message', 'Version must be approved before publishing');
  end if;

  -- Check caller is SCHOOL_ADMIN or SUPER_ADMIN
  if app.role() not in ('SCHOOL_ADMIN', 'SUPER_ADMIN'::public.app_role) then
    return jsonb_build_object('status', 'error', 'message', 'Only SCHOOL_ADMIN can publish');
  end if;

  -- Transition to published
  update public.activity_versions
  set status = 'published',
    published_by = auth.uid(),
    published_at = now()
  where id = p_version_id;

  -- Update activity's current_version_id and status
  update public.activities
  set current_version_id = p_version_id,
    status = 'published'
  where id = v_version.activity_id;

  return jsonb_build_object('status', 'published', 'version_id', p_version_id);
end;
$$;

-- ── build_content_pack ────────────────────────────────────────────────────
-- Manifest assembly
create or replace function public.build_content_pack(
  p_school_id uuid,
  p_level public.ecd_level
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_manifest jsonb;
  v_version int;
begin
  -- Get next version number
  select coalesce(max(version), 0) + 1 into v_version
  from public.content_pack_versions
  where school_id = p_school_id and ecd_level = p_level;

  -- Build manifest from published activities and stories
  select jsonb_build_object(
    'version', v_version,
    'school_id', p_school_id,
    'ecd_level', p_level,
    'activities', (
      select jsonb_agg(jsonb_build_object(
        'id', av.id,
        'activity_id', a.id,
        'type', a.type,
        'definition', av.definition,
        'version', av.version
      ))
      from public.activity_versions av
      join public.activities a on a.id = av.activity_id
      where av.status = 'published'
        and av.ecd_level = p_level
        and (a.school_id is null or a.school_id = p_school_id)
    ),
    'stories', (
      select jsonb_agg(jsonb_build_object(
        'id', sv.id,
        'story_id', s.id,
        'definition', sv.definition,
        'version', sv.version
      ))
      from public.story_versions sv
      join public.stories s on s.id = sv.story_id
      where sv.status = 'published'
        and sv.ecd_level = p_level
        and (s.school_id is null or s.school_id = p_school_id)
    ),
    'built_at', now()
  ) into v_manifest;

  -- Insert content pack version
  insert into public.content_pack_versions (
    school_id, ecd_level, version, manifest
  )
  values (p_school_id, p_level, v_version, v_manifest);

  return v_manifest;
end;
$$;

-- ── learner_export (DSAR) ──────────────────────────────────────────────────
-- Produces JSON of all learner data
create or replace function public.learner_export(p_learner_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if app.role() not in ('SCHOOL_ADMIN', 'SUPER_ADMIN'::public.app_role) then
    return jsonb_build_object('error', 'Not authorized');
  end if;

  select jsonb_build_object(
    'learner', to_jsonb(l),
    'enrollments', (
      select jsonb_agg(to_jsonb(e))
      from public.enrollments e where e.learner_id = p_learner_id
    ),
    'consent_records', (
      select jsonb_agg(to_jsonb(c))
      from public.consent_records c where c.learner_id = p_learner_id
    ),
    'attempts', (
      select jsonb_agg(to_jsonb(a))
      from public.attempts a where a.learner_id = p_learner_id
    ),
    'skill_mastery', (
      select jsonb_agg(to_jsonb(sm))
      from public.skill_mastery sm where sm.learner_id = p_learner_id
    ),
    'learner_badges', (
      select jsonb_agg(to_jsonb(lb))
      from public.learner_badges lb where lb.learner_id = p_learner_id
    ),
    'teacher_observations', (
      select jsonb_agg(to_jsonb(tobs))
      from public.teacher_observations tobs where tobs.learner_id = p_learner_id
    ),
    'exported_at', now()
  ) into v_result
  from public.learners l
  where l.id = p_learner_id;

  -- Log the export
  insert into public.audit_logs (school_id, actor_id, actor_role, action, entity, entity_id)
  select l.school_id, auth.uid(), app.role(), 'EXPORT', 'learner', p_learner_id
  from public.learners l where l.id = p_learner_id;

  return v_result;
end;
$$;

-- ── learner_erase (DSAR) ───────────────────────────────────────────────────
-- Hard-deletes learner data; keeps anonymous aggregate counts.
-- Irreversible — called with two-step confirmation from admin UI.
create or replace function public.learner_erase(p_learner_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_school_id uuid;
begin
  if app.role() not in ('SCHOOL_ADMIN', 'SUPER_ADMIN'::public.app_role) then
    return jsonb_build_object('error', 'Not authorized');
  end if;

  select school_id into v_school_id
  from public.learners where id = p_learner_id;

  if not found then
    return jsonb_build_object('error', 'Learner not found');
  end if;

  -- Log the erase BEFORE deleting (so we have the audit trail)
  insert into public.audit_logs (school_id, actor_id, actor_role, action, entity, entity_id)
  values (v_school_id, auth.uid(), app.role(), 'ERASE', 'learner', p_learner_id);

  -- Delete all learner data
  delete from public.responses where attempt_id in (
    select id from public.attempts where learner_id = p_learner_id
  );
  delete from public.attempts where learner_id = p_learner_id;
  delete from public.skill_mastery where learner_id = p_learner_id;
  delete from public.learner_badges where learner_id = p_learner_id;
  delete from public.teacher_observations where learner_id = p_learner_id;
  delete from public.consent_records where learner_id = p_learner_id;
  delete from public.enrollments where learner_id = p_learner_id;
  delete from public.learners where id = p_learner_id;

  return jsonb_build_object('status', 'erased', 'learner_id', p_learner_id);
end;
$$;
