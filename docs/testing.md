# Testing Strategy

Status: **PROPOSED**.

## 1. Test pyramid

| Layer | Tool | Scope | Runs |
| --- | --- | --- | --- |
| Static | TypeScript strict, ESLint (incl. security + a11y rules), Prettier | everything | every PR |
| Content validation | Zod over `/content/**/*.json`; feedback-wording lint; asset-reference check | seed content | every PR |
| Unit | Vitest (+ RTL for components) | engine scoring, runner state machine, sync queue, mastery rules (TS), schema refinements, Server Action decision logic (mocked Supabase), audio manager, i18n | every PR |
| Database | pgTAP via `supabase test db` | RLS positive/negative per role, `apply_attempt` idempotency, mastery transitions (SQL), publish gates, no-RLS-table guard | every PR |
| Integration | Vitest against local Supabase (Docker) | Server Actions end-to-end with real RLS; `/api/sync` handler | every PR |
| E2E | Playwright (Chromium desktop + Android tablet emulation "Galaxy Tab S4"-class 1024×768 / 768×1024) | 13 critical flows + offline; service worker enabled | every PR (sharded) |
| Accessibility | `@axe-core/playwright` on adult pages; manual checklist for child screens | WCAG 2.2 AA (adult) | every PR |
| Performance | Lighthouse CI on Child Mode routes with throttling; bundle size budget (`size-limit`) | budgets in product-requirements §7 | every PR (report), block on budget breach |
| Parity | Property test: TS scoring vs SQL scoring on shared fixtures | ADR-010 | every PR |

## 2. Critical flows (E2E)

| # | Flow | Assertions |
| --- | --- | --- |
| 1 | Teacher login (password + magic link) | redirect, session cookie flags, wrong password message |
| 2 | Learner selection | only own-class learners; consent-pending learner absent; picture-PIN |
| 3 | Activity launch | INTRO → INSTRUCTION → ACTIVITY; audio button present; assets from cache |
| 4 | Activity completion (one per engine, 12) | responses recorded; SUMMARY shows stars |
| 5 | Scoring | seeded responses → expected accuracy/stars (client) == server |
| 6 | Progress persistence | reload mid-activity → resume prompt; completed attempt visible in teacher portal |
| 7 | Offline activity | `setOffline(true)`, complete 3 activities, no errors, queue = 3 |
| 8 | Sync | `setOffline(false)` → 3 attempts in DB; re-flush → still 3; rejected item surfaced |
| 9 | Teacher login (device) | CLASSROOM_DEVICE lands in Child Mode; cannot open /teach |
| 10 | Teacher progress viewing | mastery pills, timeline, observation add |
| 11 | Content creation | editor create → review → approve → publish; version increments; pack version bumps; child sees new activity after content update |
| 12 | Authorization | forbidden routes/actions per role matrix |
| 13 | Tenant isolation | School A teacher cannot see School B data via UI or direct PostgREST call |

## 3. Security tests
See `security.md` §10 — implemented as pgTAP + Vitest + Playwright cases and
tagged `@security` so they can be run as a suite.

## 4. Test data
- `supabase/seed/dev.sql`: Nenyere + a second fictional school ("Chikwanha ECD")
  for isolation tests; fictional learners.
- Fixtures for every activity type in `src/engine/__fixtures__` shared by
  Vitest, pgTAP (loaded as JSON) and Playwright.
- Production seed contains **no learners**.

## 5. Definition of done gates (CI)
typecheck ✓ lint ✓ content-validate ✓ unit ✓ db-tests ✓ build ✓ e2e ✓ a11y ✓
size-budget ✓ → preview deployment → human review.

## 6. Manual QA checklist per release
- Real low-cost Android tablet (target device to be purchased/borrowed): cold
  start time, touch latency, audio unlock, install-to-home, full offline day.
- Classroom display: 96 px targets, keyboard navigation.
- Teacher on phone: dashboard readable, observations addable.
- Print report on A4.
