# Architecture Decision Records

Format: Context → Options → Decision → Consequences. Deviations from the master
specification are marked **DEVIATION** and must be approved in review.

---

## ADR-001 — Next.js 16 App Router on Vercel, pnpm

**Context.** Spec requests Vercel + Supabase. Need SSR for adult portals, a
client-heavy PWA for Child Mode, Server Actions for secure mutations, and
preview deployments.

**Options.** (a) Next.js 16 App Router. (b) Vite + React SPA with separate API.
(c) Remix/React Router 7. (d) SvelteKit.

**Decision.** (a). Next.js 16 is current (16.3 at time of writing; Node ≥ 20.9,
TS ≥ 5.1), integrates natively with Vercel previews, and Server Actions remove the
need for a separate API server. Child Mode is a client-rendered route group, so
we get both models in one deployable.

**Consequences.** Must be disciplined about keeping Child Mode's client bundle
small (route-group layout with no adult imports; `next/dynamic` per interaction
engine). `proxy.ts` (formerly middleware) is used only for session refresh and
coarse redirects — never as the authorization layer.

## ADR-002 — Supabase (Postgres, Auth, Storage, RLS)

**Context.** Spec prefers Supabase unless research shows a compelling reason
otherwise. Requirements: RLS, managed auth, storage, low cost, PITR for child data.

**Options.** (a) Supabase. (b) Neon + Clerk + Cloudflare R2. (c) Self-hosted
Postgres.

**Decision.** (a). One vendor covers DB, auth, storage and RLS with a local Docker
stack for offline development and pgTAP support for RLS tests. (b) adds three
vendors and three sets of secrets. (c) violates the managed-services principle.

**Consequences.** Production must be on Supabase **Pro** (US$25/mo) — the Free
tier pauses inactive projects and lacks backups; unacceptable for child data.
Use the newer **publishable / secret** API key model; the legacy `service_role`
key is never shipped in application code. Verify key naming against current
Supabase docs during Session 3.

## ADR-003 — Tailwind CSS v4 + design tokens; shadcn/ui only in adult portals

**Context.** Two very different UIs share one brand. Child UI needs bespoke,
oversized, audio-first components; adult UIs need dense, accessible forms/tables.

**Decision.** Design tokens exported from Figma → CSS variables (`src/ui/tokens`).
Tailwind v4 consumes the variables. shadcn/ui (Radix-based) is used **only** in
`src/ui/adult` for dialogs, tables, forms, menus. `src/ui/kids` is hand-built on
the same tokens with no Radix dependency to keep the child bundle small.

**Consequences.** Two component libraries to maintain, but they are small and
share tokens. Prevents "generic dashboard look" bleeding into Child Mode.

## ADR-004 — Zod as the single validation layer

**Decision.** Zod schemas define the versioned activity JSON, all Server Action
inputs, `/api/sync` payloads, environment variables, and seed content (validated
in CI). Types are inferred from schemas — no duplicated TypeScript interfaces.

## ADR-005 — Dexie (IndexedDB) + Serwist for offline

**Context.** Need durable local storage for content packs, attempts and a sync
queue; a service worker for app-shell + media caching and background sync.

**Options.** Raw IndexedDB; `idb`; Dexie; RxDB/WatermelonDB (full replication
frameworks). `next-pwa` (unmaintained) vs Serwist vs hand-rolled Workbox.

**Decision.** **Dexie** (~25 kB, typed tables, transactions, versioned schema
migrations) — full replication frameworks are overkill because our sync is
one-directional per record type (content down, attempts up). **Serwist** is the
maintained Workbox-based integration for Next.js App Router.

**Consequences.** We own the sync protocol (documented in `offline-sync.md`).
Must handle Safari's 7-day storage eviction for non-installed PWAs by prompting
install and requesting `navigator.storage.persist()`.

## ADR-006 — next-intl for UI strings; database for content translations

**Decision.** UI chrome uses `next-intl` message catalogues (`en` first; `sn`,
`nd` scaffolded). Educational content (activity titles, instructions, story
text, audio) is translated in the `translations` and `audio_assets` tables and
approved through the CMS workflow — never machine-translated automatically.

## ADR-007 — Learners are not auth users; CLASSROOM_DEVICE role — **DEVIATION**

**Context.** Spec lists a `LEARNER` role and "learner selection/login". Children
aged 3–5 cannot manage credentials; shared tablets serve many children per day;
Supabase Auth users require an email/phone or anonymous sign-in, and anonymous
users would each be a separate identity with no link to the roster.

**Options.** (a) Supabase anonymous auth per child. (b) Teacher session +
client-side "active learner". (c) Dedicated `CLASSROOM_DEVICE` auth account per
class/tablet with minimal privileges, plus (b).

**Decision.** (c). `LEARNER` remains a **principal type** in the domain model
(the subject of attempts/progress) but not an authentication role. A tablet is
signed in as either a `TEACHER` or a `CLASSROOM_DEVICE`. The active learner is
chosen from a picker and held in IndexedDB; the server verifies on every write
that the authenticated principal may act for that learner (class membership via
RLS). An optional **picture-PIN** (choose 2 of 6 pictures) may be enabled per
class to reduce mis-selection, but it is not a security control and is
documented as such.

**Consequences.** Adds one role to the spec's list. Removes the need to store
any credential for a child. A stolen tablet in Child Mode exposes only learner
first names/avatars of that class and the ability to submit attempts — no
progress or personal data. Grown-up gate protects exit from Child Mode.

## ADR-008 — Authorization: RLS + JWT claims + server-side checks

**Decision.** Three layers, all required:
1. **JWT custom claims** (`app_role`, `school_id`, `class_ids`) set by a Supabase
   custom access token hook from the `memberships` table.
2. **RLS policies** on every tenant table using the claims (cheap, no subquery per
   row) with a periodic integrity test that claims match `memberships`.
3. **Server Actions / Route Handlers** validate input, re-check role for
   privileged operations (publish, delete, export), and write `audit_logs`.

`proxy.ts` only redirects unauthenticated users; hiding UI is never authz.

## ADR-009 — Published educational media in a public-read bucket — **DEVIATION (partial)**

**Context.** Spec asks for signed URLs/private storage "where needed". Offline
caching by the service worker requires stable URLs; signed URLs expire and defeat
cache-by-version.

**Decision.** Two storage classes:
- `media-published` (public read, write only via CMS publish): illustrations,
  audio, story art. Contains **no personal data** by policy and by validation
  (no uploads to this bucket outside the publish transaction).
- `media-private` (RLS, signed URLs): drafts, unpublished uploads, any
  school-specific documents (e.g. scanned consent forms if ever stored — see
  privacy.md; default is *not* to store them).

**Consequences.** Published assets are cacheable and CDN-served; private assets
follow the spec exactly.

## ADR-010 — Scoring and mastery computed in Postgres functions

**Context.** Sync must be idempotent and atomic: an attempt, its responses and
resulting mastery changes must all apply or none.

**Decision.** `public.apply_attempt(jsonb)` runs as SECURITY INVOKER (RLS
applies) inside the sync transaction. Scoring rules for each activity type are
implemented **once in TypeScript** (`src/engine/scoring`, used for instant
client feedback) and the **server re-computes** the score from raw responses
using the same rule expressed in SQL/PLpgSQL for the mastery update. The client
score is advisory; the server score is authoritative. Property tests assert both
implementations agree on the same fixtures.

**Consequences.** Some rule duplication (TS + SQL) — mitigated by shared
fixtures and a small rule set (correct/incorrect per item, tolerance for tracing
expressed as a percentage the client computes and the server bounds-checks).

## ADR-011 — No animation, drawing or charting libraries in the child bundle

**Decision.** CSS transitions/keyframes and the Web Animations API cover
celebrations, tile presses and page transitions. Tracing, colouring and
join-the-dots use Canvas 2D + SVG paths + Pointer Events directly. Teacher
analytics use small hand-rolled SVG bars/sparklines. Confetti is a ~2 kB
canvas routine, not a library.

**Consequences.** More code we own; far smaller bundle and predictable
performance on 2 GB Android tablets. Revisit only with measured evidence.

## ADR-012 — Central AudioManager

**Decision.** One `AudioManager` owns an `HTMLAudioElement` pool, unlock-on-first-
gesture, global mute (persisted), priority channels (instruction > feedback >
ambient), and preloading from the content pack manifest. Opus/WebM primary with
AAC/M4A fallback for iOS Safari. No autoplay without a prior user gesture on the
device.

## ADR-013 — Sentry with PII scrubbing

**Decision.** Sentry for client + server errors and failed sync operations.
`beforeSend` strips learner names, removes request bodies for `/api/sync`, and
replaces user context with `{ role, school_id }` only. No product analytics
vendor in MVP; teacher analytics come from our own database.

## ADR-014 — Testing stack

**Decision.** Vitest (unit/integration in jsdom), Playwright (E2E incl. offline
mode via `context.setOffline(true)` and service worker), pgTAP via
`supabase test db` for RLS/tenant isolation, `@axe-core/playwright` for
accessibility, and Zod validation of all seed content in CI.

## ADR-015 — Activity types are configurations of 10 interaction engines — **DEVIATION (clarification)**

**Context.** Spec lists 28 activity types. Building 28 engines duplicates logic.

**Decision.** 28 **activity types** (author-facing, curriculum-facing) map onto
**10 interaction engines** (code-facing): `choice`, `match`, `drag-sort`,
`counting`, `trace`, `join-dots`, `colouring`, `sequence`, `memory`, `puzzle`,
plus `spot-difference` and `story` as specialised engines (12 code modules in
total; see `activity-engine.md`). Each activity type is a Zod discriminated
union member specifying which engine renders it and what configuration it
allows. Adding a type is a new schema member + optional new engine.

## ADR-016 — Mastery model: five stages, evidence-based, never a single score

**Decision.** `NOT_STARTED → INTRODUCED → PRACTISING → DEVELOPING → SECURE` per
(learner, skill). Transitions require *recent* evidence (rolling window of last N
attempts, N configurable per skill, default 5) — e.g. SECURE needs ≥ 3 of the
last 5 attempts at ≥ 80% with at least two on different days. Regression to
PRACTISING is allowed after sustained low accuracy but never below INTRODUCED.
Teacher observations can override with a reason (audited).

## ADR-017 — Content pack versioning

**Decision.** Publishing any content item bumps the school+level content pack
version. Packs are immutable manifests (list of activity version ids, story
version ids, asset URLs + hashes). Clients sync by manifest diff. Historical
versions are retained so old attempts always reference the exact activity
version they were played against.

## ADR-018 — Date of birth minimisation — **DEVIATION (privacy)**

**Context.** Spec asks for data minimisation. ECD level placement needs age but
not exact birthday.

**Decision.** Store `birth_month` (YYYY-MM) rather than full date of birth
unless the school confirms a legal/operational need for the full date. Flagged
for human review in `privacy.md`.
