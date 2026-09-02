# System Architecture — Nenyere ECD Digital Learning Platform

Status: **PROPOSED — awaiting review**. See `architecture-decisions.md` for the
reasoning behind each choice and where this deviates from the master specification.

---

## 1. Architecture at a glance

```
+------------------------------ Client (PWA) ------------------------------------+
|  Next.js 16 App Router . React 19 . TypeScript strict . Tailwind CSS v4        |
|                                                                                |
|  +-- Child Mode -------------+   +-- Adult Portals --------------------------+ |
|  | Activity Runner           |   | Teacher . Admin . CMS . Platform          | |
|  | 10 interaction engines    |   | Server Components + Server Actions        | |
|  | Story Player              |   | shadcn/ui primitives on shared tokens     | |
|  | AudioManager              |   +-------------------------------------------+ |
|  +------------+--------------+                                                 |
|               |                                                                |
|  +-- Local Data Layer (Dexie / IndexedDB) ------------------------------------+|
|  | content cache . attempts . responses . sync_queue . learner session        ||
|  +------------+---------------------------------------------------------------+|
|  +-- Service Worker (Serwist) ------------------------------------------------+|
|  | app shell precache . content pack cache . background sync                  ||
|  +------------+---------------------------------------------------------------+|
+---------------+----------------------------------------------------------------+
                | HTTPS (Server Actions / Route Handlers / Supabase PostgREST)
+---------------v------------------ Vercel --------------------------------------+
|  Next.js server: SSR, Server Actions, Route Handlers (/api/sync, /api/packs)   |
|  proxy.ts: session refresh + coarse route guards (never the only authz layer)  |
+---------------+----------------------------------------------------------------+
                |
+---------------v------------------ Supabase ------------------------------------+
|  Postgres 15+ (RLS on every tenant table, SQL functions for scoring/mastery)   |
|  Auth (email/password, magic link; custom access-token hook -> role/school)    |
|  Storage (public bucket: published educational media; private: everything else)|
+--------------------------------------------------------------------------------+
                |
        GitHub Actions (CI)  .  Sentry (errors, PII-scrubbed)  .  Figma (design source)
```

No Redis, no separate API server, no queue service, no object storage outside
Supabase. Everything that needs a queue is a Postgres table or the client's
IndexedDB sync queue.

## 2. Technology decisions (summary — reasoning in ADRs)

| Concern | Choice | ADR |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, React 19, TS strict) | ADR-001 |
| Hosting | Vercel (preview + production) | ADR-001 |
| Database / Auth / Storage | Supabase (Postgres, Auth, Storage, RLS) | ADR-002 |
| Styling | Tailwind CSS v4 with CSS design tokens; shadcn/ui **only** in adult portals | ADR-003 |
| Validation | Zod (activity schema, all server boundaries) | ADR-004 |
| Local persistence | Dexie (IndexedDB) | ADR-005 |
| Service worker | Serwist | ADR-005 |
| i18n | next-intl for UI strings; DB `translations` table for content | ADR-006 |
| Learner identity | Learners are **not** auth users; a `CLASSROOM_DEVICE` or `TEACHER` session acts on behalf of a learner | ADR-007 |
| Authorization | Postgres RLS + JWT custom claims (`role`, `school_id`) via Auth Hook + server-side checks in Server Actions | ADR-008 |
| Published media | Public-read Storage bucket for non-personal educational assets (cacheable offline) | ADR-009 |
| Scoring & mastery | Computed in Postgres functions inside the sync transaction (idempotent) | ADR-010 |
| Animation | CSS transitions/keyframes + Web Animations API; no animation library in the child bundle | ADR-011 |
| Drawing (tracing, colouring, join dots) | Native Canvas 2D + SVG + Pointer Events; no drawing library | ADR-011 |
| Audio | HTMLAudioElement pool managed by a single `AudioManager`; Opus + AAC fallback | ADR-012 |
| Error monitoring | Sentry (browser + server) with `beforeSend` PII scrubber | ADR-013 |
| Testing | Vitest, Playwright, pgTAP (`supabase test db`), @axe-core/playwright | ADR-014 |
| Package manager | pnpm | ADR-001 |
| Charts (teacher analytics) | Small hand-built SVG bars/sparklines; no chart library in MVP | ADR-011 |

## 3. Runtime topology and request paths

### 3.1 Adult portals (teacher / admin / CMS)
- Server Components read via a **server Supabase client** (`@supabase/ssr`) with the user's session, so RLS applies automatically.
- Mutations go through **Server Actions** that: (1) `getUser()`; (2) parse input with Zod; (3) re-derive `school_id` and role from the session claims — never from the client; (4) call Postgres (RLS enforced); (5) write an `audit_logs` row where required.
- Route Handlers only exist for non-form endpoints: `/api/sync` (batch attempt upload), `/api/packs/[level]` (content pack manifest), `/api/health`.

### 3.2 Child Mode
- Child Mode is a **client-heavy island** inside the same Next.js app. Its route group `(kids)` has its own root layout and imports nothing from adult portals.
- Content (published activities, stories, media manifest) is fetched once per content-pack version and stored in IndexedDB. The runner **never** fetches per activity.
- Every learner response is written to IndexedDB synchronously with the interaction; an `attempts` record is finalised on activity completion and pushed onto `sync_queue`.
- The service worker flushes `sync_queue` via Background Sync when online, with exponential backoff; the app also flushes on `online` events and app start (Background Sync is unavailable on iOS Safari and some WebViews).

### 3.3 Sync path
```
Client sync_queue  --POST /api/sync (batch, JWT)-->  Route Handler
   -> Zod validate batch
   -> derive actor + school from JWT
   -> for each attempt: SELECT public.apply_attempt(payload)   -- SECURITY INVOKER, RLS applies
        - INSERT attempts ON CONFLICT (client_attempt_id) DO NOTHING
        - INSERT responses (idempotent by client_response_id)
        - UPDATE skill_mastery via mastery rule set
        - INSERT learner_badges where rules fire
   -> return per-item {client_attempt_id, status: applied|duplicate|rejected, reason}
Client marks queue items complete or moves to dead-letter with reason
```

## 4. Domain model (bounded contexts)

| Context | Responsibility | Lives in |
| --- | --- | --- |
| **Identity & Tenancy** | schools, users, memberships, roles, classroom devices | `src/modules/identity` |
| **Roster** | classes, learners, enrolments, consent records | `src/modules/roster` |
| **Curriculum** | learning areas, topics, objectives (HBC), platform skills taxonomy | `src/modules/curriculum` |
| **Content** | activities (+versions), stories (+pages), media/audio assets, translations, publishing workflow | `src/modules/content` |
| **Activity Engine** | schema (Zod), runner state machine, interaction engines, scoring rules | `src/engine` |
| **Learning** | attempts, responses, skill mastery, badges, observations, recommendations | `src/modules/learning` |
| **Sync & Offline** | Dexie DB, queue, content packs, service worker | `src/offline` |
| **Audio** | AudioManager, sound banks, preloading | `src/audio` |
| **Reporting** | teacher analytics queries, printable reports | `src/modules/reporting` |
| **Audit & Privacy** | audit logs, DSAR export/delete, retention | `src/modules/governance` |

Business rules live in `src/modules/**` (plain TypeScript, unit-testable) and in
Postgres functions where they must be atomic with data. Presentation components
never import Supabase clients directly.

## 5. Proposed repository structure

```
/
  app/                         Next.js routes only (thin)
    (public)/                  /, /welcome, /privacy, /terms
    (auth)/                    /auth/*
    (kids)/                    Child Mode root layout + routes
    (teach)/                   Teacher portal
    (admin)/                   Admin + CMS
    (platform)/                Super admin
    api/                       sync, packs, health
  src/
    engine/                    Activity Engine (schema, runner, interactions, scoring)
      schema/                  Zod schemas per activity type, versioned
      runner/                  Lifecycle state machine
      interactions/            matching, drag-drop, tap-target, choice, counting, sort, trace, join-dots, colouring, sequence, memory, puzzle, spot-difference, story
      scoring/                 Pure scoring functions
    modules/                   Domain logic (see section 4)
    offline/                   Dexie db, sync queue, content packs
    audio/                     AudioManager
    i18n/                      next-intl config, message catalogues
    ui/
      tokens/                  CSS variables generated from Figma tokens
      kids/                    Child-mode components (large targets, mascot, feedback)
      adult/                   shadcn/ui-based components for portals
    lib/                       supabase clients, env parsing (Zod), logger, sentry
  supabase/
    migrations/                SQL migrations (source of truth)
    seed/                      Nenyere tenant, curriculum, sample content
    tests/                     pgTAP RLS and function tests
  content/                     Authored seed content (JSON validated by Zod in CI)
  public/
    sw.js (built)              Service worker output
    media/                     Only tiny brand assets; educational media lives in Storage
  tests/
    e2e/                       Playwright
  docs/
  .github/workflows/
```

## 6. Multi-tenancy model

- **Shared schema, row-level isolation**: every school-owned table carries `school_id uuid not null references schools(id)`.
- Authorization context comes from JWT claims set by a Supabase **custom access token hook**: `app_role`, `school_id` (and `class_ids` for `CLASSROOM_DEVICE`). Claims are re-derived from the `memberships` table on every token refresh; membership is the source of truth.
- Platform-global content (KuWeX library) has `school_id null` and `is_global = true`; schools see global + their own published content.
- `SUPER_ADMIN` bypasses tenant filters via explicit policy, never via the service role key in application code. The service role key is used only in CI seeds and migrations.

## 7. Child Mode session model (ADR-007)

```
Auth user (TEACHER or CLASSROOM_DEVICE) signs in on the tablet
  -> app enters Child Mode
  -> learner picker lists learners in classes the auth user may access (RLS)
  -> "active learner" is held client-side (IndexedDB) for the session
  -> attempts carry learner_id; server verifies (RLS) that the auth user may write for that learner
  -> exiting Child Mode requires the grown-up gate
```

`CLASSROOM_DEVICE` is a deliberately minimal role: read published content, read
learners in its assigned classes (id, display name, avatar, level only), write
attempts. It cannot read progress, observations, or any adult portal data. This
allows a tablet to be left in Child Mode all day without a teacher's full session
on it.

## 8. Content pack model

A **content pack** is the published set of activities, stories, media manifest
and translations for one school + ECD level at a point in time
(`content_pack_versions`). Clients download the manifest, diff against local, and
fetch only changed assets. Packs are immutable; publishing creates a new version.
This keeps offline caching deterministic and lets the service worker precache by
version.

## 9. Deployment architecture

| Environment | Vercel | Supabase | Purpose |
| --- | --- | --- | --- |
| development | local `next dev` | Supabase CLI local stack (Docker) | Everything runs offline on a dev laptop |
| preview | per-PR preview deployment | Shared `staging` project (seeded, reset weekly) | Human review, E2E in CI |
| production | production deployment on `main` after approval | `production` project (Pro plan: PITR, no pausing) | Nenyere |

Secrets live in Vercel/GitHub environment variables and Supabase Vault. Never in
the repo. `.env.example` documents each variable.

## 10. Future scale path (no MVP work required)

| Need | Path |
| --- | --- |
| Many schools | Already isolated by `school_id` + RLS; add per-school content packs (already versioned per school) |
| Thousands of learners | Indexes on `(school_id, learner_id, created_at)`; mastery pre-aggregated; reporting reads from materialised views refreshed nightly |
| Parent portal | Add `GUARDIAN` role + `guardian_learners` link; RLS policies already keyed on membership |
| More languages | Add locale to `translations` and message catalogues; content audio per locale via `audio_assets.locale` |
| Mobile apps | PWA first; Capacitor wrapper if store presence is needed (same codebase) |
| AI teacher assistance | Server-side only, on pseudonymised aggregates; reviewable outputs; behind feature flag |
| Billing | `subscriptions` table + Paynow/Stripe; no schema changes to learning data |
| District reporting | Materialised views over `school_id` sets; SUPER_ADMIN policies |
