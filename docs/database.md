# Database Architecture (PostgreSQL / Supabase)

Status: **PROPOSED — awaiting review**. Migrations are written in Session 3.

Conventions: UUID v4 primary keys (`gen_random_uuid()`), `created_at`/`updated_at`
`timestamptz` defaults, `school_id` on every school-owned table, FK with
`on delete restrict` unless noted, `check` constraints for enums (or Postgres
enums where the set is stable), RLS enabled on **every** table in `public`.

## 1. Entity overview

```
schools ─┬─ memberships ─── auth.users (profiles)
         ├─ classes ─── enrollments ─── learners ─── consent_records
         │      └─ class_devices (CLASSROOM_DEVICE ↔ class)
         ├─ activities ─── activity_versions ─── activity_skills
         ├─ stories ─── story_versions
         ├─ media_assets (images/audio; locale)
         ├─ translations
         ├─ content_pack_versions
         ├─ assignments
         ├─ attempts ─── responses
         ├─ skill_mastery
         ├─ learner_badges ─── badges (global)
         ├─ teacher_observations
         └─ audit_logs
curriculum_areas ─ curriculum_topics ─ curriculum_objectives ─ skills   (global, read-only to tenants)
```

Spec entities intentionally **merged or dropped** (avoid unnecessary tables):
`users/profiles/roles/teachers` → `profiles` + `memberships` (role is a column);
`activity_items`/`activity_assets` → inside the versioned JSON + `activity_skills`
and `media_assets` links; `progress` → derived from `attempts` + `skill_mastery`;
`audio_assets` → `media_assets.kind = 'audio'`; `sync_queue` → **client-side
only** (IndexedDB) — the server keeps `sync_batches` for idempotency auditing;
`learning_domains` → `curriculum_areas`.

## 2. Tables

### 2.1 Identity & tenancy
| Table | Key columns | Notes |
| --- | --- | --- |
| `schools` | id, name, slug unique, locale_default, timezone, settings jsonb, is_active | Nenyere seeded |
| `profiles` | id = auth.users.id, display_name, locale, created_at | No email duplication; read from auth |
| `memberships` | id, user_id → profiles, school_id, role `app_role`, class_ids uuid[] (for CLASSROOM_DEVICE / TEACHER scoping), is_active; unique(user_id, school_id) | Source of truth for JWT claims |
| `app_role` enum | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, CONTENT_EDITOR, CLASSROOM_DEVICE | LEARNER is not an auth role (ADR-007) |

### 2.2 Roster
| Table | Key columns | Notes |
| --- | --- | --- |
| `classes` | id, school_id, name, ecd_level `ecd_level`, academic_year, is_active | |
| `learners` | id, school_id, first_name, preferred_name, birth_month date (day fixed = 1), ecd_level, avatar_key, picture_pin text[] null, status (active/inactive/withdrawn), consent_status (pending/granted/withdrawn), deleted_at | **No** surname required, photo, address, phone. `avatar_key` references illustrated avatar set |
| `enrollments` | id, school_id, learner_id, class_id, start_date, end_date null; unique(learner_id, class_id, start_date) | |
| `consent_records` | id, school_id, learner_id, guardian_name, relationship, method (paper_on_file/digital), granted_at, withdrawn_at, recorded_by → profiles, notes | Stores *that* consent exists, not the guardian's contact details (see privacy.md) |
| `teacher_classes` | membership_id, class_id | Alternative to `class_ids[]`; **decision pending**: array in memberships is simpler for claims; table is cleaner relationally. Proposal: table is source of truth; array is denormalised into claims by the token hook. |

### 2.3 Curriculum (global)
| Table | Key columns |
| --- | --- |
| `curriculum_areas` | id, key, name_en, name_sn, sort |
| `curriculum_topics` | id, area_id, key, name, source_ref |
| `curriculum_objectives` | id, topic_id, ecd_level, text, validation_status (verified/validation_required), source_ref |
| `skills` | id, key unique, area_id, development_areas text[], name jsonb, mastery_window int default 5 |
| `objective_skills` | objective_id, skill_id |

### 2.4 Content
| Table | Key columns | Notes |
| --- | --- | --- |
| `activities` | id, school_id null (null = global), type, current_version_id, status `content_status`, created_by, archived_at | Identity record |
| `activity_versions` | id, activity_id, version int, schema_version int, definition jsonb (Zod-validated), ecd_level, learning_area, status, review_notes, reviewed_by, approved_by, published_by, published_at; unique(activity_id, version) | Immutable once published |
| `activity_skills` | activity_version_id, skill_id | Denormalised from definition for querying |
| `stories`, `story_versions` | same pattern; `definition jsonb` holds pages | |
| `media_assets` | id, school_id null, kind (image/audio/svg), bucket, path, mime, bytes, sha256, width, height, duration_ms, locale null, alt jsonb, source, license, attribution, status | Licence provenance mandatory |
| `translations` | id, school_id null, namespace, key, locale, value, status, approved_by; unique(namespace,key,locale) | Content strings only; UI strings live in code |
| `content_pack_versions` | id, school_id, ecd_level, version int, manifest jsonb, published_at; unique(school_id, ecd_level, version) | Immutable manifest (ADR-017) |
| `content_status` enum | draft, review, approved, published, archived | |

### 2.5 Learning
| Table | Key columns | Notes |
| --- | --- | --- |
| `assignments` | id, school_id, activity_id, class_id null, learner_id null, assigned_by, due_at null, config_overrides jsonb (e.g. trace tolerance), created_at; check(class_id is not null or learner_id is not null) | |
| `attempts` | id, school_id, learner_id, activity_version_id, assignment_id null, **client_attempt_id uuid unique**, device_id, actor_user_id, started_at, completed_at null, status (completed/abandoned), accuracy numeric(5,4), stars smallint, duration_ms, hints_used, items_total, items_correct, client_meta jsonb | Idempotency key = client_attempt_id |
| `responses` | id, attempt_id, item_id, **client_response_id uuid unique**, value jsonb, is_correct bool null, elapsed_ms, hint_level, seq | Bulk insert per attempt |
| `skill_mastery` | school_id, learner_id, skill_id, stage `mastery_stage`, evidence jsonb (last N results), last_evidence_at, overridden_by, override_reason; PK(learner_id, skill_id) | Updated by `apply_attempt` |
| `mastery_stage` enum | not_started, introduced, practising, developing, secure | |
| `badges` | id, key, name jsonb, rule jsonb, icon_key | Global catalogue |
| `learner_badges` | school_id, learner_id, badge_id, earned_at, attempt_id; PK(learner_id, badge_id) | |
| `teacher_observations` | id, school_id, learner_id, author_id, skill_id null, development_area null, text, recommended_activity_id null, observed_at | |
| `sync_batches` | id, school_id, actor_user_id, device_id, received_at, item_count, applied, duplicates, rejected, error_summary jsonb | Server-side audit of sync |

### 2.6 Governance
| Table | Key columns |
| --- | --- |
| `audit_logs` | id, school_id null, actor_id, actor_role, action, entity, entity_id, before jsonb null, after jsonb null, ip_hash, created_at |
| `data_requests` | id, school_id, learner_id, kind (export/delete), requested_by, status, completed_at, artifact_path |

## 3. Row Level Security model

Claims available via `auth.jwt()`: `app_role`, `school_id`, `class_ids`
(set by custom access token hook from `memberships`). Helper SQL functions
(`stable`, `security definer` limited to reading claims):
`app.role()`, `app.school_id()`, `app.class_ids()`, `app.is_super()`.

| Table group | SELECT | INSERT/UPDATE/DELETE |
| --- | --- | --- |
| `schools` | own school or super | SCHOOL_ADMIN (settings), super |
| `memberships` | own row; SCHOOL_ADMIN all in school | SCHOOL_ADMIN within school (cannot grant SUPER_ADMIN); super |
| `classes`, `enrollments` | same school; CLASSROOM_DEVICE only its `class_ids` | SCHOOL_ADMIN, TEACHER (own classes) |
| `learners` | SCHOOL_ADMIN/TEACHER: same school (TEACHER limited to enrolled in own classes via view); CLASSROOM_DEVICE: **column-restricted view** `learner_picker` (id, preferred_name, avatar_key, ecd_level, picture_pin) for its classes and consent_status = granted | SCHOOL_ADMIN insert/update; delete = soft via `deleted_at` by SCHOOL_ADMIN; hard delete by `data_requests` job |
| `consent_records` | SCHOOL_ADMIN | SCHOOL_ADMIN |
| curriculum tables | all authenticated | super only |
| `activities/*_versions/stories/media_assets/translations` | published+global: all roles in school incl. CLASSROOM_DEVICE; draft/review: CONTENT_EDITOR, reviewer TEACHER, SCHOOL_ADMIN of owning school | CONTENT_EDITOR create/update draft; TEACHER set review→approved; SCHOOL_ADMIN publish/archive |
| `content_pack_versions` | same school (all roles) | system (publish function) |
| `assignments` | TEACHER own classes; CLASSROOM_DEVICE its classes | TEACHER, SCHOOL_ADMIN |
| `attempts`, `responses` | TEACHER (own classes), SCHOOL_ADMIN; CLASSROOM_DEVICE **none** | INSERT only via `apply_attempt` by TEACHER/CLASSROOM_DEVICE for learners in their classes; no UPDATE/DELETE (immutable) |
| `skill_mastery`, `learner_badges` | TEACHER (own classes), SCHOOL_ADMIN | function-only writes; TEACHER override via function with reason |
| `teacher_observations` | TEACHER (own classes), SCHOOL_ADMIN | author TEACHER; edit own within 24 h; soft delete |
| `audit_logs` | SCHOOL_ADMIN own school; super | insert via trigger/function only |

Rules:
- No table is readable by `anon`. Public policy pages are static.
- `service_role`/secret key is never used by the app runtime.
- Every policy has a pgTAP test: positive (allowed) and negative (cross-school,
  wrong role, CLASSROOM_DEVICE reading progress).
- Policies use claims, not per-row subqueries, for hot tables (`attempts`).

## 4. Key functions

| Function | Purpose |
| --- | --- |
| `app.custom_access_token_hook(event jsonb)` | Adds `app_role`, `school_id`, `class_ids` from `memberships` |
| `public.apply_attempt(p jsonb) returns jsonb` | Idempotent insert of attempt + responses; recompute accuracy; update `skill_mastery`; award badges; returns status |
| `public.update_mastery(learner, skill, result)` | Rolling-window stage transition (ADR-016) |
| `public.publish_activity_version(id)` | Status transition checks, copies assets to `media-published`, bumps content pack, writes audit |
| `public.build_content_pack(school, level)` | Manifest assembly |
| `public.log_audit()` trigger | On sensitive tables (learners, memberships, consent_records, publish) |
| `public.learner_export(learner_id)` / `learner_erase(learner_id)` | DSAR workflows (privacy.md) |

## 5. Indexes (from query patterns)

| Query | Index |
| --- | --- |
| Teacher dashboard: recent attempts per class | `attempts(school_id, learner_id, completed_at desc)`; `enrollments(class_id, learner_id)` |
| Learner progress page | `skill_mastery(learner_id)` (PK), `attempts(learner_id, activity_version_id, completed_at desc)` |
| Support flags | partial index `skill_mastery(school_id, stage) where stage in ('practising')` + `last_evidence_at` |
| Sync idempotency | unique `attempts(client_attempt_id)`, unique `responses(client_response_id)` |
| Content picker | `activity_versions(status, ecd_level, learning_area) where status='published'` |
| Content pack | `content_pack_versions(school_id, ecd_level, version desc)` |
| Audit | `audit_logs(school_id, created_at desc)`, `audit_logs(entity, entity_id)` |
| Memberships lookup (token hook) | `memberships(user_id) where is_active` |

## 6. Data retention (defaults; confirm in privacy review)
- `attempts.client_meta` (device model, viewport) purged after 90 days.
- Pointer samples in `responses.value` downsampled at write; purged after 12 months.
- Learner hard-erase job removes attempts/responses/mastery/observations/badges;
  aggregates for school reporting keep only counts (no learner id).
- `audit_logs` retained 2 years.

## 7. Seed plan
1. Nenyere school, one SCHOOL_ADMIN, two TEACHERs, two classes (ECD A, ECD B), one CLASSROOM_DEVICE per class.
2. Curriculum areas/topics/objectives from `curriculum-map.md` with `validation_status`.
3. Skills taxonomy.
4. ~60 activities + 5 stories authored as JSON in `/content`, validated by Zod in CI, imported as published versions with a v1 content pack.
5. Demo learners **only** in development/preview seeds (fictional names); production starts empty.
