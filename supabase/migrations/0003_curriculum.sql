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
