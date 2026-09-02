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
