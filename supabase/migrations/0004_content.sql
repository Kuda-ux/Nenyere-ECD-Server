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
