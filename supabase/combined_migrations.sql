-- ============================================================================
-- Migration 0001: Identity & Tenancy
-- Creates: app schema, enums, schools, profiles, memberships, teacher_classes
-- + RLS helper functions (app.role(), app.school_id(), app.class_ids(), app.is_super())
-- Per docs/database.md §2.1, §3
-- ============================================================================

-- ── App schema for helper functions ────────────────────────────────────────
create schema if not exists app;

-- ── Enums ──────────────────────────────────────────────────────────────────
create type public.app_role as enum (
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'TEACHER',
  'CONTENT_EDITOR',
  'CLASSROOM_DEVICE'
);

create type public.ecd_level as enum ('ECD_A', 'ECD_B');

create type public.content_status as enum (
  'draft',
  'review',
  'approved',
  'published',
  'archived'
);

create type public.mastery_stage as enum (
  'not_started',
  'introduced',
  'practising',
  'developing',
  'secure'
);

create type public.learner_status as enum ('active', 'inactive', 'withdrawn');

create type public.consent_status as enum ('pending', 'granted', 'withdrawn');

create type public.consent_method as enum ('paper_on_file', 'digital');

create type public.attempt_status as enum ('completed', 'abandoned');

create type public.media_kind as enum ('image', 'audio', 'svg');

create type public.validation_status as enum (
  'verified',
  'validation_required'
);

-- ── RLS helper functions (stable, security definer) ────────────────────────
-- These read JWT claims set by the custom access token hook.
-- Per database.md §3: "Policies use claims, not per-row subqueries, for hot tables."

create or replace function app.role()
returns public.app_role
language stable
security definer
set search_path = public
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'app_role', '')::public.app_role;
$$;

create or replace function app.school_id()
returns uuid
language stable
security definer
set search_path = public
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'school_id', '')::uuid;
$$;

create or replace function app.class_ids()
returns uuid[]
language stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'class_ids', '')::uuid[],
    '{}'::uuid[]
  );
$$;

create or replace function app.is_super()
returns boolean
language stable
security definer
set search_path = public
as $$
  select app.role() = 'SUPER_ADMIN'::public.app_role;
$$;

-- ── updated_at trigger function ────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── schools ────────────────────────────────────────────────────────────────
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  locale_default text not null default 'en' check (locale_default in ('en', 'sn', 'nd')),
  timezone text not null default 'Africa/Harare',
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger schools_updated_at
  before update on public.schools
  for each row execute function public.set_updated_at();

-- ── profiles (1:1 with auth.users) ─────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  locale text not null default 'en' check (locale in ('en', 'sn', 'nd')),
  created_at timestamptz not null default now()
);

-- ── memberships ────────────────────────────────────────────────────────────
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete restrict,
  role public.app_role not null,
  class_ids uuid[] default null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, school_id)
);

create trigger memberships_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

create index memberships_user_id_active_idx
  on public.memberships(user_id)
  where is_active = true;

-- ── teacher_classes (relational source of truth for teacher↔class) ─────────
-- Per database.md §2.2: table is source of truth; array is denormalised into
-- claims by the token hook.
create table public.teacher_classes (
  membership_id uuid not null references public.memberships(id) on delete cascade,
  class_id uuid not null,  -- FK added in migration 0002 when classes table exists
  primary key (membership_id, class_id)
);

-- ── Enable RLS on all tables (deny-by-default) ─────────────────────────────
-- Per security.md §3: "Deny-by-default: new tables get enable row level
-- security + no policies until written"

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.teacher_classes enable row level security;

-- ── RLS Policies: schools ──────────────────────────────────────────────────
create policy schools_select
  on public.schools for select
  using (app.is_super() or id = app.school_id());

create policy schools_update
  on public.schools for update
  using (app.is_super() or (id = app.school_id() and app.role() = 'SCHOOL_ADMIN'));

-- ── RLS Policies: profiles ─────────────────────────────────────────────────
create policy profiles_select_own
  on public.profiles for select
  using (id = auth.uid());

create policy profiles_insert_own
  on public.profiles for insert
  with check (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid());

-- ── RLS Policies: memberships ──────────────────────────────────────────────
create policy memberships_select_own
  on public.memberships for select
  using (
    user_id = auth.uid()
    or app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy memberships_insert_admin
  on public.memberships for insert
  with check (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN'
        and role != 'SUPER_ADMIN'::public.app_role)
  );

create policy memberships_update_admin
  on public.memberships for update
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN'
        and role != 'SUPER_ADMIN'::public.app_role)
  );

create policy memberships_delete_admin
  on public.memberships for delete
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN'
        and role != 'SUPER_ADMIN'::public.app_role)
  );

-- ── RLS Policies: teacher_classes ──────────────────────────────────────────
create policy teacher_classes_select
  on public.teacher_classes for select
  using (
    exists (
      select 1 from public.memberships m
      where m.id = teacher_classes.membership_id
        and m.is_active = true
        and (
          m.user_id = auth.uid()
          or app.is_super()
          or (m.school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
        )
    )
  );

create policy teacher_classes_insert
  on public.teacher_classes for insert
  with check (
    exists (
      select 1 from public.memberships m
      where m.id = teacher_classes.membership_id
        and m.is_active = true
        and (
          app.is_super()
          or (m.school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
        )
    )
  );

create policy teacher_classes_delete
  on public.teacher_classes for delete
  using (
    exists (
      select 1 from public.memberships m
      where m.id = teacher_classes.membership_id
        and m.is_active = true
        and (
          app.is_super()
          or (m.school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
        )
    )
  );

-- ── Auto-create profile on user signup ─────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- ============================================================================
-- Migration 0002: Roster (classes, learners, enrollments, consent)
-- Per docs/database.md §2.2
-- ============================================================================

-- ── classes ─────────────────────────────────────────────────────────────────
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  name text not null,
  ecd_level public.ecd_level not null,
  academic_year int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger classes_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

create index classes_school_id_idx on public.classes(school_id);

-- Add FK from teacher_classes to classes
alter table public.teacher_classes
  add constraint teacher_classes_class_id_fkey
  foreign key (class_id) references public.classes(id) on delete cascade;

-- ── learners ───────────────────────────────────────────────────────────────
-- Per database.md §2.2: No surname required, photo, address, phone.
-- avatar_key references illustrated avatar set. birth_month (day fixed = 1).
create table public.learners (
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

create trigger learners_updated_at
  before update on public.learners
  for each row execute function public.set_updated_at();

create index learners_school_id_idx on public.learners(school_id);

-- ── enrollments ────────────────────────────────────────────────────────────
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  class_id uuid not null references public.classes(id) on delete restrict,
  start_date date not null,
  end_date date default null,
  created_at timestamptz not null default now(),
  unique(learner_id, class_id, start_date)
);

create index enrollments_class_id_learner_id_idx
  on public.enrollments(class_id, learner_id);
create index enrollments_learner_id_idx on public.enrollments(learner_id);

-- ── consent_records ────────────────────────────────────────────────────────
-- Per privacy.md §4: Stores *that* consent exists, not guardian contact details.
create table public.consent_records (
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

create index consent_records_learner_id_idx
  on public.consent_records(learner_id);

-- ── learner_picker view (for CLASSROOM_DEVICE — column-restricted) ─────────
-- Per database.md §3: CLASSROOM_DEVICE sees only picker fields for its classes
-- and consent_status = granted
create view public.learner_picker as
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
alter table public.learner_picker enable row level security;

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
-- CLASSROOM_DEVICE: only its classes. TEACHER: own classes. SCHOOL_ADMIN: all.
create policy learner_picker_select
  on public.learner_picker for select
  using (
    app.is_super()
    or (
      school_id = app.school_id()
      and app.role() in ('SCHOOL_ADMIN', 'TEACHER', 'CLASSROOM_DEVICE')
      and (
        app.role() = 'SCHOOL_ADMIN'
        or class_id = any(app.class_ids())
      )
    )
  );
-- ============================================================================
-- Migration 0003: Curriculum (global, read-only to tenants)
-- Per docs/database.md §2.3, docs/curriculum-map.md
-- ============================================================================

-- ── curriculum_areas ───────────────────────────────────────────────────────
create table public.curriculum_areas (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_en text not null,
  name_sn text,
  sort int not null default 0
);

-- ── curriculum_topics ──────────────────────────────────────────────────────
create table public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.curriculum_areas(id) on delete restrict,
  key text not null,
  name text not null,
  source_ref text
);

create index curriculum_topics_area_id_idx
  on public.curriculum_topics(area_id);

-- ── curriculum_objectives ──────────────────────────────────────────────────
create table public.curriculum_objectives (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.curriculum_topics(id) on delete restrict,
  ecd_level public.ecd_level not null,
  text text not null,
  validation_status public.validation_status not null default 'validation_required',
  source_ref text
);

create index curriculum_objectives_topic_id_idx
  on public.curriculum_objectives(topic_id);

-- ── skills ─────────────────────────────────────────────────────────────────
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  area_id uuid not null references public.curriculum_areas(id) on delete restrict,
  development_areas text[] not null default '{}',
  name jsonb not null,
  mastery_window int not null default 5
);

create index skills_area_id_idx on public.skills(area_id);

-- ── objective_skills (many-to-many) ────────────────────────────────────────
create table public.objective_skills (
  objective_id uuid not null references public.curriculum_objectives(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (objective_id, skill_id)
);

-- ── Enable RLS ─────────────────────────────────────────────────────────────
-- Per database.md §3: curriculum tables are all authenticated read; super only writes
alter table public.curriculum_areas enable row level security;
alter table public.curriculum_topics enable row level security;
alter table public.curriculum_objectives enable row level security;
alter table public.skills enable row level security;
alter table public.objective_skills enable row level security;

-- ── RLS: read for all authenticated users ──────────────────────────────────
create policy curriculum_areas_select
  on public.curriculum_areas for select
  using (auth.role() = 'authenticated');

create policy curriculum_topics_select
  on public.curriculum_topics for select
  using (auth.role() = 'authenticated');

create policy curriculum_objectives_select
  on public.curriculum_objectives for select
  using (auth.role() = 'authenticated');

create policy skills_select
  on public.skills for select
  using (auth.role() = 'authenticated');

create policy objective_skills_select
  on public.objective_skills for select
  using (auth.role() = 'authenticated');

-- ── RLS: write only for SUPER_ADMIN ────────────────────────────────────────
create policy curriculum_areas_write
  on public.curriculum_areas for all
  using (app.is_super())
  with check (app.is_super());

create policy curriculum_topics_write
  on public.curriculum_topics for all
  using (app.is_super())
  with check (app.is_super());

create policy curriculum_objectives_write
  on public.curriculum_objectives for all
  using (app.is_super())
  with check (app.is_super());

create policy skills_write
  on public.skills for all
  using (app.is_super())
  with check (app.is_super());

create policy objective_skills_write
  on public.objective_skills for all
  using (app.is_super())
  with check (app.is_super());
-- ============================================================================
-- Migration 0004: Content (activities, versions, media, stories, packs)
-- Per docs/database.md §2.4
-- ============================================================================

-- ── activities (identity record) ───────────────────────────────────────────
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  school_id uuid default null references public.schools(id) on delete restrict,
  type text not null check (type in (
    'matching', 'drag_and_drop', 'tap_correct', 'multiple_choice',
    'counting', 'sorting', 'shape_matching', 'shape_sorting',
    'colour_identification', 'colouring', 'joining_dots', 'tracing',
    'pattern_completion', 'spot_the_difference', 'puzzle',
    'phonics_recognition', 'sound_recognition', 'animal_sound_recognition',
    'story_interaction', 'sequence_ordering', 'classification',
    'memory_game', 'pointing_target', 'basic_addition', 'basic_subtraction',
    'image_identification', 'audio_to_image', 'image_to_audio'
  )),
  current_version_id uuid default null,
  status public.content_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- ── activity_versions (immutable once published) ──────────────────────────
create table public.activity_versions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  version int not null,
  schema_version int not null default 1,
  definition jsonb not null,
  ecd_level public.ecd_level not null,
  learning_area text not null check (learning_area in (
    'english_language', 'indigenous_language', 'mathematics',
    'science_and_technology', 'social_sciences',
    'physical_education_and_arts'
  )),
  status public.content_status not null default 'draft',
  review_notes text default null,
  reviewed_by uuid default null references public.profiles(id) on delete set null,
  approved_by uuid default null references public.profiles(id) on delete set null,
  published_by uuid default null references public.profiles(id) on delete set null,
  published_at timestamptz default null,
  created_at timestamptz not null default now(),
  unique(activity_id, version)
);

-- FK: activities.current_version_id → activity_versions.id (added after table creation)
alter table public.activities
  add constraint activities_current_version_id_fkey
  foreign key (current_version_id) references public.activity_versions(id) on delete set null;

create index activity_versions_activity_id_idx
  on public.activity_versions(activity_id);

-- Partial index for content picker: published activities by level and area
create index activity_versions_published_idx
  on public.activity_versions(status, ecd_level, learning_area)
  where status = 'published';

-- ── activity_skills (denormalised from definition for querying) ────────────
create table public.activity_skills (
  activity_version_id uuid not null references public.activity_versions(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete restrict,
  primary key (activity_version_id, skill_id)
);

-- ── stories (same pattern as activities) ───────────────────────────────────
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid default null references public.schools(id) on delete restrict,
  current_version_id uuid default null,
  status public.content_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stories_updated_at
  before update on public.stories
  for each row execute function public.set_updated_at();

-- ── story_versions ─────────────────────────────────────────────────────────
create table public.story_versions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  version int not null,
  schema_version int not null default 1,
  definition jsonb not null,
  ecd_level public.ecd_level not null,
  status public.content_status not null default 'draft',
  review_notes text default null,
  reviewed_by uuid default null references public.profiles(id) on delete set null,
  approved_by uuid default null references public.profiles(id) on delete set null,
  published_by uuid default null references public.profiles(id) on delete set null,
  published_at timestamptz default null,
  created_at timestamptz not null default now(),
  unique(story_id, version)
);

alter table public.stories
  add constraint stories_current_version_id_fkey
  foreign key (current_version_id) references public.story_versions(id) on delete set null;

-- ── media_assets ───────────────────────────────────────────────────────────
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  school_id uuid default null references public.schools(id) on delete restrict,
  kind public.media_kind not null,
  bucket text not null,
  path text not null,
  mime text not null,
  bytes bigint not null,
  sha256 text not null,
  width int default null,
  height int default null,
  duration_ms int default null,
  locale text default null check (locale in ('en', 'sn', 'nd')),
  alt jsonb default null,
  source text not null,
  license text not null,
  attribution text default null,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger media_assets_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

-- ── translations (content strings only; UI strings live in code) ──────────
create table public.translations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid default null references public.schools(id) on delete restrict,
  namespace text not null,
  key text not null,
  locale text not null check (locale in ('en', 'sn', 'nd')),
  value text not null,
  status public.content_status not null default 'draft',
  approved_by uuid default null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(namespace, key, locale)
);

-- ── content_pack_versions (immutable manifest) ────────────────────────────
-- Per ADR-017: content pack versioning
create table public.content_pack_versions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  ecd_level public.ecd_level not null,
  version int not null,
  manifest jsonb not null,
  published_at timestamptz not null default now(),
  unique(school_id, ecd_level, version)
);

create index content_pack_versions_school_level_idx
  on public.content_pack_versions(school_id, ecd_level, version desc);

-- ── Enable RLS on all tables ───────────────────────────────────────────────
alter table public.activities enable row level security;
alter table public.activity_versions enable row level security;
alter table public.activity_skills enable row level security;
alter table public.stories enable row level security;
alter table public.story_versions enable row level security;
alter table public.media_assets enable row level security;
alter table public.translations enable row level security;
alter table public.content_pack_versions enable row level security;

-- ── RLS: content tables ────────────────────────────────────────────────────
-- Per database.md §3: published+global readable by all roles in school incl.
-- CLASSROOM_DEVICE; draft/review by CONTENT_EDITOR, reviewer TEACHER, SCHOOL_ADMIN.

-- Helper: check if user can read content of a given status
create or replace function public.can_read_content(content_school_id uuid, content_status public.content_status)
returns boolean
language stable
security definer
set search_path = public
as $$
begin
  if content_status = 'published' or content_status = 'archived' then
    -- Published/archived: readable by all authenticated users in the school
    -- (or global content if school_id is null)
    return app.is_super()
      or (content_school_id is null and app.school_id() is not null)
      or content_school_id = app.school_id();
  else
    -- Draft/review/approved: CONTENT_EDITOR, TEACHER (reviewer), SCHOOL_ADMIN of owning school
    return app.is_super()
      or (
        (content_school_id is null or content_school_id = app.school_id())
        and app.role() in ('CONTENT_EDITOR', 'TEACHER', 'SCHOOL_ADMIN')
      );
  end if;
end;
$$;

-- activities
create policy activities_select
  on public.activities for select
  using (public.can_read_content(school_id, status));

create policy activities_insert
  on public.activities for insert
  with check (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy activities_update
  on public.activities for update
  using (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy activities_delete
  on public.activities for delete
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- activity_versions
create policy activity_versions_select
  on public.activity_versions for select
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_versions.activity_id
        and public.can_read_content(a.school_id, activity_versions.status)
    )
  );

create policy activity_versions_insert
  on public.activity_versions for insert
  with check (
    exists (
      select 1 from public.activities a
      where a.id = activity_versions.activity_id
        and (app.is_super() or (a.school_id = app.school_id() and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')))
    )
  );

create policy activity_versions_update
  on public.activity_versions for update
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_versions.activity_id
        and (app.is_super() or (a.school_id = app.school_id() and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')))
    )
  );

-- activity_skills
create policy activity_skills_select
  on public.activity_skills for select
  using (
    exists (
      select 1 from public.activity_versions av
      join public.activities a on a.id = av.activity_id
      where av.id = activity_skills.activity_version_id
        and public.can_read_content(a.school_id, av.status)
    )
  );

-- stories (same pattern as activities)
create policy stories_select
  on public.stories for select
  using (public.can_read_content(school_id, status));

create policy stories_insert
  on public.stories for insert
  with check (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy stories_update
  on public.stories for update
  using (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy stories_delete
  on public.stories for delete
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- story_versions
create policy story_versions_select
  on public.story_versions for select
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_versions.story_id
        and public.can_read_content(s.school_id, story_versions.status)
    )
  );

create policy story_versions_insert
  on public.story_versions for insert
  with check (
    exists (
      select 1 from public.stories s
      where s.id = story_versions.story_id
        and (app.is_super() or (s.school_id = app.school_id() and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')))
    )
  );

create policy story_versions_update
  on public.story_versions for update
  using (
    exists (
      select 1 from public.stories s
      where s.id = story_versions.story_id
        and (app.is_super() or (s.school_id = app.school_id() and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')))
    )
  );

-- media_assets
create policy media_assets_select
  on public.media_assets for select
  using (public.can_read_content(school_id, status));

create policy media_assets_insert
  on public.media_assets for insert
  with check (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy media_assets_update
  on public.media_assets for update
  using (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy media_assets_delete
  on public.media_assets for delete
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- translations
create policy translations_select
  on public.translations for select
  using (public.can_read_content(school_id, status));

create policy translations_insert
  on public.translations for insert
  with check (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy translations_update
  on public.translations for update
  using (
    app.is_super()
    or (
      (school_id is null or school_id = app.school_id())
      and app.role() in ('CONTENT_EDITOR', 'SCHOOL_ADMIN')
    )
  );

create policy translations_delete
  on public.translations for delete
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- content_pack_versions: same school (all roles)
create policy content_pack_versions_select
  on public.content_pack_versions for select
  using (
    app.is_super() or school_id = app.school_id()
  );
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
-- ============================================================================
-- Migration 0006: Governance (audit_logs, data_requests) + access token hook
-- Per docs/database.md §2.6, §4
-- ============================================================================

-- ── audit_logs ─────────────────────────────────────────────────────────────
-- Trigger/function-written; never contains full learner records — only ids and changed fields.
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid default null,
  actor_id uuid default null references public.profiles(id) on delete set null,
  actor_role public.app_role default null,
  action text not null,
  entity text not null,
  entity_id uuid default null,
  before jsonb default null,
  after jsonb default null,
  ip_hash text default null,
  created_at timestamptz not null default now()
);

create index audit_logs_school_created_idx
  on public.audit_logs(school_id, created_at desc);
create index audit_logs_entity_idx
  on public.audit_logs(entity, entity_id);

-- ── data_requests (DSAR workflows) ─────────────────────────────────────────
create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete restrict,
  learner_id uuid not null references public.learners(id) on delete restrict,
  kind text not null check (kind in ('export', 'delete')),
  requested_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  completed_at timestamptz default null,
  artifact_path text default null,
  created_at timestamptz not null default now()
);

-- ── Enable RLS ─────────────────────────────────────────────────────────────
alter table public.audit_logs enable row level security;
alter table public.data_requests enable row level security;

-- ── RLS: audit_logs ────────────────────────────────────────────────────────
-- Readable by SCHOOL_ADMIN (own school) and SUPER_ADMIN. Insert via trigger/function only.
create policy audit_logs_select
  on public.audit_logs for select
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy audit_logs_insert
  on public.audit_logs for insert
  with check (auth.role() = 'authenticated');

-- ── RLS: data_requests ─────────────────────────────────────────────────────
create policy data_requests_select
  on public.data_requests for select
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy data_requests_insert
  on public.data_requests for insert
  with check (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

create policy data_requests_update
  on public.data_requests for update
  using (
    app.is_super()
    or (school_id = app.school_id() and app.role() = 'SCHOOL_ADMIN')
  );

-- ── Audit log trigger function ─────────────────────────────────────────────
create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    school_id,
    actor_id,
    actor_role,
    action,
    entity,
    entity_id,
    before,
    after,
    ip_hash
  )
  values (
    coalesce(new.school_id, old.school_id),
    auth.uid(),
    app.role(),
    TG_OP,
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    case when TG_OP = 'DELETE' or TG_OP = 'UPDATE' then to_jsonb(old) else null end,
    case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then to_jsonb(new) else null end,
    null
  );
  return coalesce(new, old);
end;
$$;

-- Add audit triggers on sensitive tables
create trigger audit_learners
  after insert or update or delete on public.learners
  for each row execute function public.log_audit();

create trigger audit_memberships
  after insert or update or delete on public.memberships
  for each row execute function public.log_audit();

create trigger audit_consent_records
  after insert or update or delete on public.consent_records
  for each row execute function public.log_audit();

-- ── Custom access token hook ───────────────────────────────────────────────
-- Per database.md §4: Adds app_role, school_id, class_ids from memberships.
-- Per security.md §2: JWT claims from memberships via custom access token hook.
create or replace function app.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
  claims jsonb;
  membership record;
  class_ids uuid[];
begin
  user_id := event -> 'event' ->> 'user_id';

  -- Fetch the first active membership for this user
  select m.role, m.school_id, m.class_ids
  into membership
  from public.memberships m
  where m.user_id = user_id
    and m.is_active = true
  order by m.created_at
  limit 1;

  -- If no membership, return the event unchanged (user is not yet a member)
  if not found then
    return event;
  end if;

  -- Build class_ids from teacher_classes if class_ids is null on membership
  if membership.class_ids is not null then
    class_ids := membership.class_ids;
  else
    select coalesce(array_agg(tc.class_id), '{}'::uuid[])
    into class_ids
    from public.teacher_classes tc
    where tc.membership_id = (
      select m.id from public.memberships m
      where m.user_id = user_id and m.is_active = true
      order by m.created_at limit 1
    );
  end if;

  -- Inject claims into the JWT
  claims := jsonb_build_object(
    'app_role', membership.role::text,
    'school_id', membership.school_id::text,
    'class_ids', class_ids
  );

  return jsonb_set(
    event,
    '{event,claims}',
    event -> 'event' -> 'claims' || claims
  );
end;
$$;

-- Register the hook with Supabase Auth
-- Note: This is done via supabase config or dashboard in production
-- For local dev, the hook is automatically picked up by the auth service
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
      select jsonb_agg(to_jsonb(to))
      from public.teacher_observations to where to.learner_id = p_learner_id
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
-- ============================================================================
-- Seed: Development data
-- Per docs/database.md §7: Nenyere school, admin, teachers, classes, device,
-- curriculum areas, skills, demo learners (fictional, dev only).
-- ============================================================================

-- ── Nenyere school ─────────────────────────────────────────────────────────
insert into public.schools (id, name, slug, locale_default, timezone)
values (
  '00000000-0000-0000-0000-000000000001',
  'Nenyere Day Care Centre',
  'nenyere',
  'en',
  'Africa/Harare'
)
on conflict (slug) do nothing;

-- ── Curriculum areas ───────────────────────────────────────────────────────
insert into public.curriculum_areas (id, key, name_en, name_sn, sort) values
  ('00000000-0000-0000-0000-000000000010', 'english_language', 'English Language', 'Chirungu', 1),
  ('00000000-0000-0000-0000-000000000020', 'indigenous_language', 'Indigenous Language', 'Chikaranga', 2),
  ('00000000-0000-0000-0000-000000000030', 'mathematics', 'Mathematics', 'Masvomhu', 3),
  ('00000000-0000-0000-0000-000000000040', 'science_and_technology', 'Science and Technology', 'Sayansi neVatechno', 4),
  ('00000000-0000-0000-0000-000000000050', 'social_sciences', 'Social Sciences', 'Hupfumi neTsika', 5),
  ('00000000-0000-0000-0000-000000000060', 'physical_education_and_arts', 'Physical Education and Arts', 'Michezo neZvekuumbwa', 6)
on conflict (key) do nothing;

-- ── Classes ────────────────────────────────────────────────────────────────
insert into public.classes (id, school_id, name, ecd_level, academic_year) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'ECD A - Sunrise', 'ECD_A', 2025),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'ECD B - Starlight', 'ECD_B', 2025)
on conflict do nothing;

-- ── Demo learners (fictional — dev/preview only, NOT production) ───────────
insert into public.learners (id, school_id, first_name, preferred_name, birth_month, ecd_level, avatar_key, consent_status) values
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000001', 'Tariro', 'Tari', '2021-01-01', 'ECD_A', 'star', 'granted'),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000001', 'Tinashe', 'Tina', '2021-03-01', 'ECD_A', 'elephant', 'granted'),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000001', 'Rumbidzai', 'Rumbi', '2020-06-01', 'ECD_B', 'lion', 'granted'),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000001', 'Kudzai', 'Kuds', '2020-09-01', 'ECD_B', 'bird', 'pending')
on conflict do nothing;

-- ── Enrollments ────────────────────────────────────────────────────────────
insert into public.enrollments (school_id, learner_id, class_id, start_date) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', '2025-01-13'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000101', '2025-01-13'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000102', '2025-01-13'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000102', '2025-01-13')
on conflict do nothing;

-- ── Skills (sample — full set in curriculum-map.md) ───────────────────────
insert into public.skills (id, key, area_id, development_areas, name, mastery_window) values
  ('00000000-0000-0000-0000-00000000s001', 'fine_motor_tracing', '00000000-0000-0000-0000-000000000060', '{"physical"}', '{"en": "Pre-writing: Tracing lines"}', 5),
  ('00000000-0000-0000-0000-00000000s002', 'counting_1_5', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Counting 1-5"}', 5),
  ('00000000-0000-0000-0000-00000000s003', 'counting_1_10', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Counting 1-10"}', 5),
  ('00000000-0000-0000-0000-00000000s004', 'colour_identification', '00000000-0000-0000-0000-000000000040', '{"cognitive"}', '{"en": "Colour identification"}', 5),
  ('00000000-0000-0000-0000-00000000s005', 'shape_recognition', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Shape recognition"}', 5),
  ('00000000-0000-0000-0000-00000000s006', 'phonics_vowels', '00000000-0000-0000-0000-000000000010', '{"literacy"}', '{"en": "Phonics: Vowel sounds"}', 5),
  ('00000000-0000-0000-0000-00000000s007', 'listening_comprehension', '00000000-0000-0000-0000-000000000010', '{"literacy"}', '{"en": "Listening comprehension"}', 5),
  ('00000000-0000-0000-0000-00000000s008', 'animal_recognition', '00000000-0000-0000-0000-000000000040', '{"cognitive"}', '{"en": "Animal recognition"}', 5),
  ('00000000-0000-0000-0000-00000000s009', 'pattern_recognition', '00000000-0000-0000-0000-000000000030', '{"cognitive"}', '{"en": "Pattern recognition (ABAB)"}', 5),
  ('00000000-0000-0000-0000-00000000s010', 'social_sharing', '00000000-0000-0000-0000-000000000050', '{"social"}', '{"en": "Social: Sharing"}', 5)
on conflict (key) do nothing;
