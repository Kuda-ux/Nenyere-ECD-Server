-- ============================================================================
-- Migration 0008: Sync helpers
-- make apply_attempt resilient to seed/offline content by auto-provisioning
-- the activity + published version + skills from the client payload, and add
-- sync_learner for roster push/pull of locally-created learners.
-- ============================================================================

-- ── apply_attempt (resilient version) ────────────────────────────────────────
-- Same contract as 0007, but if the referenced activity_version is missing,
-- it provisions it from p->'activity' / p->'activity_skills' so attempts made
-- against seed-packaged content still land in the database.
create or replace function public.apply_attempt(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_attempt_id uuid := p ->> 'client_attempt_id';
  v_school_id uuid := coalesce(
    nullif(p ->> 'school_id', '')::uuid,
    app.school_id()
  );
  v_learner_id uuid := p ->> 'learner_id';
  v_activity_id uuid := p ->> 'activity_id';
  v_activity_version_id uuid := coalesce(
    nullif(p ->> 'activity_version_id', '')::uuid,
    v_activity_id
  );
  v_assignment_id uuid := nullif(p ->> 'assignment_id', '')::uuid;
  v_device_id uuid := p ->> 'device_id';
  v_actor_user_id uuid := coalesce(
    nullif(p ->> 'actor_user_id', '')::uuid,
    auth.uid()
  );
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
  v_activity jsonb := p -> 'activity';
  v_activity_skills jsonb := p -> 'activity_skills';
  v_area_id uuid;
  v_skill jsonb;

  v_existing record;
  v_attempt_id uuid;
  v_response jsonb;
  v_skill_id uuid;
begin
  -- Idempotency: already applied
  select id, accuracy, stars into v_existing
  from public.attempts
  where client_attempt_id = v_client_attempt_id;

  if found then
    return jsonb_build_object(
      'status', 'duplicate',
      'client_attempt_id', v_client_attempt_id
    );
  end if;

  -- Auto-provision the activity/version when the client ran seed content that
  -- is not yet in the database. Version id convention: same uuid as activity.
  perform 1 from public.activity_versions av where av.id = v_activity_version_id;

  if not found and v_activity is not null and v_activity_id is not null then
    insert into public.activities (id, school_id, type, status, created_by)
    values (
      v_activity_id,
      v_school_id,
      coalesce(v_activity ->> 'type', 'multiple_choice'),
      'published',
      v_actor_user_id
    )
    on conflict (id) do nothing;

    insert into public.activity_versions (
      id, activity_id, version, schema_version, definition,
      ecd_level, learning_area, status, published_by, published_at
    )
    values (
      v_activity_version_id,
      v_activity_id,
      1,
      coalesce((v_activity ->> 'schema_version')::int, 1),
      v_activity,
      coalesce(v_activity ->> 'ecd_level', 'ECD_A')::public.ecd_level,
      coalesce(v_activity ->> 'learning_area', 'mathematics'),
      'published',
      v_actor_user_id,
      now()
    )
    on conflict (id) do nothing;

    update public.activities
    set current_version_id = v_activity_version_id
    where id = v_activity_id and current_version_id is null;

    -- Provision skills referenced by the activity, then link them.
    if v_activity_skills is not null then
      select id into v_area_id
      from public.curriculum_areas
      where key = coalesce(v_activity ->> 'learning_area', 'mathematics');

      for v_skill in select * from jsonb_array_elements(v_activity_skills)
      loop
        insert into public.skills (id, key, area_id, development_areas, name)
        values (
          (v_skill ->> 'id')::uuid,
          coalesce(v_skill ->> 'key', v_skill ->> 'id'),
          v_area_id,
          '{}',
          jsonb_build_object('en', coalesce(v_skill ->> 'name', v_skill ->> 'key', v_skill ->> 'id'))
        )
        on conflict (id) do nothing;

        insert into public.activity_skills (activity_version_id, skill_id)
        values (v_activity_version_id, (v_skill ->> 'id')::uuid)
        on conflict do nothing;
      end loop;
    end if;
  end if;

  -- Still missing → reject
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

-- ── sync_learner ─────────────────────────────────────────────────────────────
-- Upsert a learner + enrollment from an on-device roster write.
-- birth_month defaults to a level-appropriate placeholder when the client
-- does not track it; staff can correct it later.
create or replace function public.sync_learner(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := p ->> 'id';
  v_school_id uuid := app.school_id();
  v_class_id uuid := nullif(p ->> 'class_id', '')::uuid;
  v_level public.ecd_level := coalesce(p ->> 'ecd_level', 'ECD_A')::public.ecd_level;
  v_birth_month date := coalesce(
    nullif(p ->> 'birth_month', '')::date,
    case when v_level = 'ECD_B' then date '2020-01-01' else date '2021-01-01' end
  );
begin
  if v_school_id is null then
    return jsonb_build_object('status', 'rejected', 'code', 'NO_SCHOOL');
  end if;

  -- Roster writes are a staff action; classroom devices read the picker only
  if app.role() not in ('SCHOOL_ADMIN', 'TEACHER') and not app.is_super() then
    return jsonb_build_object('status', 'rejected', 'code', 'FORBIDDEN');
  end if;

  insert into public.learners (
    id, school_id, first_name, preferred_name, birth_month,
    ecd_level, avatar_key, status, consent_status
  )
  values (
    v_id,
    v_school_id,
    coalesce(p ->> 'first_name', p ->> 'preferred_name', 'Learner'),
    p ->> 'preferred_name',
    v_birth_month,
    v_level,
    coalesce(p ->> 'avatar_key', 'star'),
    'active',
    coalesce(p ->> 'consent_status', 'granted')::public.consent_status
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    preferred_name = excluded.preferred_name,
    ecd_level = excluded.ecd_level,
    avatar_key = excluded.avatar_key;

  -- Pick a class: explicit, else first active class of matching level in school
  if v_class_id is null then
    select c.id into v_class_id
    from public.classes c
    where c.school_id = v_school_id and c.ecd_level = v_level and c.is_active
    order by c.created_at
    limit 1;
  end if;

  if v_class_id is not null then
    insert into public.enrollments (school_id, learner_id, class_id, start_date)
    values (v_school_id, v_id, v_class_id, current_date)
    on conflict (learner_id, class_id, start_date) do nothing;
  end if;

  return jsonb_build_object('status', 'applied', 'learner_id', v_id);
end;
$$;

-- ── remove_learner (soft delete) ─────────────────────────────────────────────
create or replace function public.remove_learner(p_learner_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if app.role() not in ('SCHOOL_ADMIN', 'TEACHER') and not app.is_super() then
    return jsonb_build_object('status', 'rejected', 'code', 'FORBIDDEN');
  end if;

  update public.learners
  set deleted_at = now(), status = 'withdrawn'
  where id = p_learner_id and school_id = app.school_id();

  if not found then
    return jsonb_build_object('status', 'rejected', 'code', 'NOT_FOUND');
  end if;

  return jsonb_build_object('status', 'applied', 'learner_id', p_learner_id);
end;
$$;
