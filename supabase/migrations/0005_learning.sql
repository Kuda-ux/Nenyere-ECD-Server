-- ============================================================================
-- Migration 0005: Learning (attempts, responses, mastery, badges, observations)
-- Per docs/database.md §2.5
-- ============================================================================

-- ── assignments ────────────────────────────────────────────────────────────
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  activity_id uuid not null references public.activities(id) on delete restrict,
  class_id uuid default null references public.classes(id) on delete cascade,
  learner_id uuid default null references public.learners(id) on delete restrict,
  assigned_by uuid not null references public.profiles(id) on delete restrict,
  due_at timestamptz default null,
  config_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (class_id is not null or learner_id is not null)
);

create index assignments_school_id_idx on public.assignments(school_id);
create index assignments_class_id_idx on public.assignments(class_id);

-- ── attempts ───────────────────────────────────────────────────────────────
-- Per database.md §2.5: idempotency key = client_attempt_id
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  activity_version_id uuid not null references public.activity_versions(id) on delete restrict,
  assignment_id uuid default null references public.assignments(id) on delete set null,
  client_attempt_id uuid not null unique,
  device_id uuid not null,
  actor_user_id uuid not null references public.profiles(id) on delete restrict,
  started_at timestamptz not null,
  completed_at timestamptz default null,
  status public.attempt_status not null,
  accuracy numeric(5,4) not null default 0,
  stars smallint not null default 0,
  duration_ms bigint not null default 0,
  hints_used int not null default 0,
  items_total int not null default 0,
  items_correct int not null default 0,
  client_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index attempts_school_learner_completed_idx
  on public.attempts(school_id, learner_id, completed_at desc);
create index attempts_learner_activity_idx
  on public.attempts(learner_id, activity_version_id, completed_at desc);

-- ── responses ──────────────────────────────────────────────────────────────
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  item_id text not null,
  client_response_id uuid not null unique,
  value jsonb not null,
  is_correct boolean default null,
  elapsed_ms bigint not null default 0,
  hint_level smallint not null default 0,
  seq int not null
);

create index responses_attempt_id_idx on public.responses(attempt_id);

-- ── skill_mastery ──────────────────────────────────────────────────────────
create table public.skill_mastery (
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  skill_id uuid not null references public.skills(id) on delete restrict,
  stage public.mastery_stage not null default 'not_started',
  evidence jsonb not null default '[]'::jsonb,
  last_evidence_at timestamptz default null,
  overridden_by uuid default null references public.profiles(id) on delete set null,
  override_reason text default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (learner_id, skill_id)
);

create trigger skill_mastery_updated_at
  before update on public.skill_mastery
  for each row execute function public.set_updated_at();

-- Partial index for support flags
create index skill_mastery_practising_idx
  on public.skill_mastery(school_id, stage)
  where stage = 'practising';

-- ── badges (global catalogue) ──────────────────────────────────────────────
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name jsonb not null,
  rule jsonb not null,
  icon_key text not null
);

-- ── learner_badges ─────────────────────────────────────────────────────────
create table public.learner_badges (
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  badge_id uuid not null references public.badges(id) on delete restrict,
  earned_at timestamptz not null default now(),
  attempt_id uuid default null references public.attempts(id) on delete set null,
  primary key (learner_id, badge_id)
);

-- ── teacher_observations ───────────────────────────────────────────────────
create table public.teacher_observations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete restrict,
  skill_id uuid default null references public.skills(id) on delete set null,
  development_area text default null,
  text text not null,
  recommended_activity_id uuid default null references public.activities(id) on delete set null,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index teacher_observations_learner_id_idx
  on public.teacher_observations(learner_id);

-- ── sync_batches (server-side audit of sync) ───────────────────────────────
create table public.sync_batches (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  actor_user_id uuid not null references public.profiles(id) on delete restrict,
  device_id uuid not null,
  received_at timestamptz not null default now(),
  item_count int not null,
  applied int not null default 0,
  duplicates int not null default 0,
  rejected int not null default 0,
  error_summary jsonb default null
);

-- ── Enable RLS on all tables ───────────────────────────────────────────────
alter table public.assignments enable row level security;
alter table public.attempts enable row level security;
alter table public.responses enable row level security;
alter table public.skill_mastery enable row level security;
alter table public.badges enable row level security;
alter table public.learner_badges enable row level security;
alter table public.teacher_observations enable row level security;
alter table public.sync_batches enable row level security;

-- ── RLS: assignments ───────────────────────────────────────────────────────
-- TEACHER: own classes. CLASSROOM_DEVICE: its classes. SCHOOL_ADMIN: all in school.
create policy assignments_select
  on public.assignments for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and (
        app.role() = 'SCHOOL_ADMIN'
        or (app.role() = 'TEACHER' and class_id = any(app.class_ids()))
        or (app.role() = 'CLASSROOM_DEVICE' and class_id = any(app.class_ids()))
      )
    )
  );

create policy assignments_insert
  on public.assignments for insert
  with check (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('TEACHER', 'SCHOOL_ADMIN')
    )
  );

create policy assignments_update
  on public.assignments for update
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('TEACHER', 'SCHOOL_ADMIN')
    )
  );

create policy assignments_delete
  on public.assignments for delete
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('TEACHER', 'SCHOOL_ADMIN')
    )
  );

-- ── RLS: attempts ──────────────────────────────────────────────────────────
-- Per database.md §3: TEACHER (own classes), SCHOOL_ADMIN; CLASSROOM_DEVICE none.
-- INSERT only via apply_attempt. No UPDATE/DELETE (immutable).
create policy attempts_select
  on public.attempts for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() = 'SCHOOL_ADMIN'
    )
    or (
      school_id = app.school_id()
      and app.role() = 'TEACHER'
      and exists (
        select 1 from public.enrollments e
        where e.learner_id = attempts.learner_id
          and e.class_id = any(app.class_ids())
      )
    )
  );

create policy attempts_insert
  on public.attempts for insert
  with check (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('TEACHER', 'CLASSROOM_DEVICE')
      and exists (
        select 1 from public.enrollments e
        where e.learner_id = attempts.learner_id
          and e.class_id = any(app.class_ids())
      )
    )
  );

-- ── RLS: responses (follows attempt access) ───────────────────────────────
create policy responses_select
  on public.responses for select
  using (
    exists (
      select 1 from public.attempts a
      where a.id = responses.attempt_id
        and (
          app.is_super()
          or (
            a.school_id = app.school_id()
            and app.role() = 'SCHOOL_ADMIN'
          )
          or (
            a.school_id = app.school_id()
            and app.role() = 'TEACHER'
            and exists (
              select 1 from public.enrollments e
              where e.learner_id = a.learner_id
                and e.class_id = any(app.class_ids())
            )
          )
        )
    )
  );

create policy responses_insert
  on public.responses for insert
  with check (
    exists (
      select 1 from public.attempts a
      where a.id = responses.attempt_id
        and app.role() in ('TEACHER', 'CLASSROOM_DEVICE')
        and a.school_id = app.school_id()
    )
  );

-- ── RLS: skill_mastery ────────────────────────────────────────────────────
-- Function-only writes; TEACHER override via function with reason.
create policy skill_mastery_select
  on public.skill_mastery for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() = 'SCHOOL_ADMIN'
    )
    or (
      school_id = app.school_id()
      and app.role() = 'TEACHER'
      and exists (
        select 1 from public.enrollments e
        where e.learner_id = skill_mastery.learner_id
          and e.class_id = any(app.class_ids())
      )
    )
  );

-- ── RLS: badges (global, read-only) ───────────────────────────────────────
create policy badges_select
  on public.badges for select
  using (auth.role() = 'authenticated');

create policy badges_write
  on public.badges for all
  using (app.is_super())
  with check (app.is_super());

-- ── RLS: learner_badges ───────────────────────────────────────────────────
create policy learner_badges_select
  on public.learner_badges for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() = 'SCHOOL_ADMIN'
    )
    or (
      school_id = app.school_id()
      and app.role() = 'TEACHER'
      and exists (
        select 1 from public.enrollments e
        where e.learner_id = learner_badges.learner_id
          and e.class_id = any(app.class_ids())
      )
    )
  );

-- ── RLS: teacher_observations ─────────────────────────────────────────────
-- Author TEACHER; edit own within 24h; soft delete.
create policy teacher_observations_select
  on public.teacher_observations for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() = 'SCHOOL_ADMIN'
    )
    or (
      school_id = app.school_id()
      and app.role() = 'TEACHER'
      and exists (
        select 1 from public.enrollments e
        where e.learner_id = teacher_observations.learner_id
          and e.class_id = any(app.class_ids())
      )
    )
  );

create policy teacher_observations_insert
  on public.teacher_observations for insert
  with check (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() = 'TEACHER'
    )
  );

create policy teacher_observations_update
  on public.teacher_observations for update
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and author_id = auth.uid()
      and app.role() = 'TEACHER'
      and created_at > now() - interval '24 hours'
    )
  );

-- ── RLS: sync_batches ──────────────────────────────────────────────────────
create policy sync_batches_select
  on public.sync_batches for select
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy sync_batches_insert
  on public.sync_batches for insert
  with check (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('TEACHER', 'CLASSROOM_DEVICE')
    )
  );
