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
