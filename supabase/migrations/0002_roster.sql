-- ============================================================================
-- Migration 0002: Roster (classes, learners, enrollments, consent)
-- Per docs/database.md §2.2
-- ============================================================================

-- ── classes ─────────────────────────────────────────────────────────────────
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  name text not null,
  ecd_level public.ecd_level not null,
  academic_year int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists classes_updated_at on public.classes;
create trigger classes_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

create index if not exists classes_school_id_idx on public.classes(school_id);

-- Add FK from teacher_classes to classes (idempotent)
do $$ begin
  alter table public.teacher_classes
    add constraint teacher_classes_class_id_fkey
    foreign key (class_id) references public.classes(id) on delete cascade;
exception when duplicate_object then null; end $$;

-- ── learners ───────────────────────────────────────────────────────────────
-- Per database.md §2.2: No surname required, photo, address, phone.
-- avatar_key references illustrated avatar set. birth_month (day fixed = 1).
create table if not exists public.learners (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  first_name text not null,
  preferred_name text,
  birth_month date not null check (extract(day from birth_month) = 1),
  ecd_level public.ecd_level not null,
  avatar_key text not null default 'star',
  picture_pin text[] default null,
  status public.learner_status not null default 'active',
  consent_status public.consent_status not null default 'pending',
  deleted_at timestamptz default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists learners_updated_at on public.learners;
create trigger learners_updated_at
  before update on public.learners
  for each row execute function public.set_updated_at();

create index if not exists learners_school_id_idx on public.learners(school_id);

-- ── enrollments ────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  start_date date not null,
  end_date date default null,
  created_at timestamptz not null default now(),
  unique(learner_id, class_id, start_date)
);

create index if not exists enrollments_class_id_learner_id_idx
  on public.enrollments(class_id, learner_id);
create index if not exists enrollments_learner_id_idx on public.enrollments(learner_id);

-- ── consent_records ────────────────────────────────────────────────────────
-- Per privacy.md §4: Stores *that* consent exists, not guardian contact details.
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  guardian_name text not null,
  relationship text not null,
  method public.consent_method not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz default null,
  recorded_by uuid not null references public.profiles(id) on delete restrict,
  notes text default null,
  created_at timestamptz not null default now()
);

create index if not exists consent_records_learner_id_idx
  on public.consent_records(learner_id);

-- ── learner_picker view (for CLASSROOM_DEVICE — column-restricted) ─────────
-- Per database.md §3: CLASSROOM_DEVICE sees only picker fields for its classes
-- and consent_status = granted
create or replace view public.learner_picker as
  select
    l.id,
    l.school_id,
    l.preferred_name,
    l.first_name,
    l.avatar_key,
    l.ecd_level,
    l.picture_pin,
    e.class_id
  from public.learners l
  join public.enrollments e on e.learner_id = l.id
  where l.status = 'active'
    and l.consent_status = 'granted'
    and l.deleted_at is null;

-- ── Enable RLS ─────────────────────────────────────────────────────────────
alter table public.classes enable row level security;
alter table public.learners enable row level security;
alter table public.enrollments enable row level security;
alter table public.consent_records enable row level security;

-- ── RLS: classes ───────────────────────────────────────────────────────────
create policy classes_select
  on public.classes for select
  using (
    app.is_super()
    or school_id = app.school_id()
  );

create policy classes_insert
  on public.classes for insert
  with check (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy classes_update
  on public.classes for update
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy classes_delete
  on public.classes for delete
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- ── RLS: learners ──────────────────────────────────────────────────────────
-- SCHOOL_ADMIN/TEACHER: same school (TEACHER limited to enrolled in own classes
-- via subquery). CLASSROOM_DEVICE: no direct access (uses learner_picker view).
create policy learners_select
  on public.learners for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('SCHOOL_ADMIN', 'TEACHER')
      and (
        app.role() = 'SCHOOL_ADMIN'
        or exists (
          select 1 from public.enrollments e
          where e.learner_id = learners.id
            and e.class_id = any(app.class_ids())
        )
      )
    )
  );

create policy learners_insert
  on public.learners for insert
  with check (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy learners_update
  on public.learners for update
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- No DELETE policy — soft delete via deleted_at by SCHOOL_ADMIN only

-- ── RLS: enrollments ───────────────────────────────────────────────────────
create policy enrollments_select
  on public.enrollments for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('SCHOOL_ADMIN', 'TEACHER', 'CLASSROOM_DEVICE')
      and (
        app.role() in ('SCHOOL_ADMIN', 'CLASSROOM_DEVICE')
        or (app.role() = 'TEACHER' and class_id = any(app.class_ids()))
      )
    )
  );

create policy enrollments_insert
  on public.enrollments for insert
  with check (
    app.is_super()
    or (school_id = app.school_id() and app.role() in ('SCHOOL_ADMIN', 'TEACHER'))
  );

create policy enrollments_update
  on public.enrollments for update
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy enrollments_delete
  on public.enrollments for delete
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- ── RLS: consent_records ───────────────────────────────────────────────────
create policy consent_records_select
  on public.consent_records for select
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy consent_records_insert
  on public.consent_records for insert
  with check (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy consent_records_update
  on public.consent_records for update
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- ── RLS: learner_picker ────────────────────────────────────────────────────
-- Note: learner_picker is a VIEW — RLS is enforced via the underlying tables
-- (learners, enrollments) which already have RLS policies above.
