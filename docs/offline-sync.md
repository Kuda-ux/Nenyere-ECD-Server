# Offline-First and Synchronisation Architecture

Status: **PROPOSED — awaiting review**.

## 1. Principles
- The app assumes it is offline. Connectivity is opportunistic.
- No learner response is ever held only in memory.
- Sync is **one-way per record type**: content flows down, evidence flows up.
  No two-way merge is required (removes the hardest class of conflicts).
- Idempotency is guaranteed by **client-generated UUIDs** on attempts and
  responses; the server treats duplicates as success.

## 2. Client storage layout (Dexie / IndexedDB)

| Store | Key | Contents | Lifetime |
| --- | --- | --- | --- |
| `meta` | key | installed pack versions, last sync, device_id (uuid, generated once), settings (mute, locale) | persistent |
| `learners` | id | picker view only (id, preferred_name, avatar_key, ecd_level, picture_pin) | refreshed each sync |
| `assignments` | id | active assignments for cached classes | refreshed each sync |
| `activities` | activity_version_id | validated definitions | until pack superseded + grace |
| `stories` | story_version_id | definitions | same |
| `pack_manifests` | school+level | manifest incl. asset URLs + hashes | same |
| `attempts` | client_attempt_id | full attempt incl. status, learner_id, started/completed | until acked + 7 days |
| `responses` | client_response_id | responses (index on client_attempt_id) | same |
| `sync_queue` | client_attempt_id | `{ state: pending|in_flight|acked|dead, tries, next_at, last_error }` | until acked/dead |
| `runner_state` | client_attempt_id | serialised runner state for resume after crash/power loss | until attempt completes |

Media (images/audio) is cached by the **service worker Cache Storage**, not in
IndexedDB, keyed by the versioned Storage URL (`/media-published/<sha256>.<ext>`);
content-addressed names make caches trivially immutable.

## 3. Service worker (Serwist)

| Route pattern | Strategy |
| --- | --- |
| App shell (`/_next/static/**`, route HTML for `(kids)`) | Precache at install (build manifest) |
| `/media-published/**` | Cache-first, immutable (content-addressed) |
| `/api/packs/**` | Network-first with cached fallback |
| `/api/sync` | Network-only + Background Sync queue (`workbox-background-sync` via Serwist) |
| Adult portal pages | Network-first, offline fallback page ("You're offline — Child Mode still works") |

Storage persistence: request `navigator.storage.persist()` after install; show
an install prompt for the PWA (Safari evicts non-installed storage after 7 days
of non-use). Quota check before downloading a pack; packs ≤ 40 MB per level.

## 4. Content download flow

```
app start / online event / teacher taps "Update content"
  → GET /api/packs/{level}?since={installed_version}
  → server returns latest manifest (id, version, items[], assets[{url, sha256, bytes}])
  → client diffs assets against Cache Storage; fetches missing with concurrency 3
  → validates each activity definition with Zod (defence in depth); stores
  → atomically switches `meta.installed_pack[level]` to new version
  → old version retained until no in-progress attempt references it (grace 7 days)
```

A pack is only "installed" when 100% of required assets are cached; partial
downloads resume. The UI shows a single unobtrusive progress bar in the
teacher/device home, never in Child Mode.

## 5. Evidence upload flow

```
Runner completes/abandons attempt
  → attempt + responses already in IndexedDB (written per interaction)
  → sync_queue[client_attempt_id] = pending
  → flush(): batches up to 25 attempts, POST /api/sync { device_id, items[] }
      Auth: current Supabase session (TEACHER or CLASSROOM_DEVICE)
  → server response per item:
      applied   → mark acked, delete runner_state
      duplicate → mark acked (already applied — idempotent success)
      rejected  → { code, message }; e.g. LEARNER_NOT_ACCESSIBLE, VERSION_UNKNOWN, INVALID
                  → retry only for transient codes; permanent → state dead, surfaced to teacher
  → backoff: 30 s, 2 min, 10 min, 1 h, then hourly; max age 30 days before "dead" (still kept, surfaced)
```

Triggers for `flush()`: `online` event, app start, Background Sync tag, every 5
minutes while online, and completion of an attempt while online.

## 6. Server-side `/api/sync` contract

Request (Zod): `{ device_id: uuid, items: Array<{ attempt: AttemptPayload, responses: ResponsePayload[] }> }`, max 25 items / 1 MB.

Per-item processing (single transaction each): `select public.apply_attempt(item)`:
1. Verify `activity_version_id` exists and was published (or was published at `started_at`).
2. RLS enforces the actor may act for `learner_id` (class membership).
3. `insert into attempts ... on conflict (client_attempt_id) do nothing`; if 0 rows → `duplicate`.
4. Insert responses with `on conflict do nothing`.
5. Recompute accuracy server-side from responses; clamp client `accuracy`/`stars`.
6. `update_mastery` for each skill on the activity version.
7. Award badges.
8. Record in `sync_batches`.

Response: `{ results: Array<{ client_attempt_id, status: 'applied'|'duplicate'|'rejected', code?, message? }>, server_time }`.

## 7. Conflict handling

| Scenario | Handling |
| --- | --- |
| Same attempt uploaded twice (retry after timeout) | `duplicate` → success; no double-count |
| Attempt for a learner later withdrawn/deleted | `rejected: LEARNER_NOT_ACCESSIBLE` → dead-letter; teacher sees "1 item could not be saved" with reason; no data leaks about why beyond code |
| Activity version superseded while offline | Accepted — attempts always reference the exact version played |
| Clock skew on device | Server stores `received_at`; `started_at/completed_at` kept as client time; teacher UI shows server time when skew > 10 min |
| Two devices submit for the same learner concurrently | Independent attempts; mastery update is serialised per (learner, skill) via row lock in `update_mastery` |
| Device switches teacher account | Queue items carry `actor_user_id` at creation; upload uses current session; server records both; if the new session lacks access → rejected (permanent), original teacher is prompted to sign in to flush |

## 8. Runner crash / power-loss recovery
`runner_state` is saved on every transition. On next open of Child Mode, if an
in-progress attempt exists for the selected learner (< 2 hours old), the child
sees "Continue?" with a large resume tile; otherwise it is finalised as
`abandoned` and synced (abandoned attempts count as *introduced* evidence only).

## 9. Observability
- Client logs sync outcomes to Sentry breadcrumbs (counts only, no learner ids).
- Server `sync_batches` gives per-device health; admin portal shows "devices not
  synced in > 48 h".

## 10. Test plan (see testing.md)
- Playwright: complete 3 activities with `context.setOffline(true)`, reload, go
  online, assert exactly 3 attempts in DB; repeat flush → still 3.
- Unit: queue state machine, backoff, batch splitting, manifest diff.
- pgTAP: `apply_attempt` idempotency and RLS rejection paths.
