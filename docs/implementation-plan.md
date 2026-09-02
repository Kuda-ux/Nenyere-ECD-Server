# Implementation Plan, Roadmap, Risks and Cost

Status: **AWAITING APPROVAL** — implementation does not start until this plan and
the architecture documents are approved.

## 1. Session / phase mapping

| Devin session | Spec phases | Deliverables | Exit criteria |
| --- | --- | --- | --- |
| **1 — Product Architect (this)** | 1–5 | `/docs/*` (this set) | Human approves architecture + deviations (ADR-007, 009, 015, 018) |
| **2 — Design** | 6–8 | Figma design system + 42 screens (design-system.md §6), token export, component mapping | Design review checklist passes |
| **3 — Foundation** | 9–11, part 45–46 | Repo scaffold, CI, env, Supabase migrations (identity, roster, curriculum, content, learning, governance), RLS + pgTAP, auth flows, RBAC, token hook, design tokens → CSS, adult component base, Child Mode shell (no activities), Sentry, `.env.example`, README | All security tests green; preview deploy; teacher can sign in, create class/learner; device can enter Child Mode picker |
| **4 — Activity Engine** | 12–13 (+ part 18) | Zod schemas, runner, 12 engines, scoring TS+SQL parity, AudioManager, seed content set (§content-authoring 5), Playwright per engine | Every activity type playable offline-ready with audio; parity tests green |
| **5 — Learning & Teacher** | 14–15 | `apply_attempt`, mastery, badges, teacher dashboard/class/learner/assign/observations, reports | Critical flows 5, 6, 10 green |
| **6 — CMS & Offline** | 16–17 | Schema-driven editor, media pipeline, workflow, content packs, Dexie + Serwist, sync, resume | Flows 7, 8, 11 green; offline day test on device |
| **7 — Hardening & Release** | 19–24 | Security audit, perf audit, a11y audit, DPIA stub, runbook, production release | DoD for every feature; human sign-off on privacy items |

## 2. Milestone roadmap (indicative effort, single autonomous agent + human review)

| Milestone | Scope | Est. effort |
| --- | --- | --- |
| M0 Approval | Review this plan | — |
| M1 Design system & screens | Session 2 | 1–2 weeks |
| M2 Foundation | Session 3 | 2 weeks |
| M3 Engine + content | Session 4 | 3 weeks |
| M4 Learning + teacher portal | Session 5 | 2 weeks |
| M5 CMS + offline | Session 6 | 2–3 weeks |
| M6 Hardening + pilot at Nenyere | Session 7 | 2 weeks + 2-week pilot |

Human dependencies on the critical path: curriculum validation with Nenyere
teachers (before M3 content), Shona audio recording/review (M3–M5), legal
decisions H1–H6 (before M6 production), commissioned illustrations (M1–M3).

## 3. Dependency decisions (every runtime dependency justified)

| Dependency | Why | Size concern |
| --- | --- | --- |
| `next`, `react`, `react-dom` | Framework | core |
| `@supabase/supabase-js`, `@supabase/ssr` | DB/auth client, cookie sessions | adult + sync only |
| `zod` | Validation everywhere | ~14 kB, shared |
| `dexie` | IndexedDB | ~25 kB, Child Mode |
| `@serwist/next`, `serwist` | Service worker | SW bundle only |
| `next-intl` | UI i18n | small |
| `tailwindcss` (v4) | Styling | build-time |
| `@radix-ui/*` via shadcn/ui, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge` | Adult portal primitives | adult bundle only |
| `@sentry/nextjs` | Error monitoring | lazy-loaded |
| `dompurify` (server) | SVG sanitisation | server only |
| `sharp` (server/CI) | Image re-encode | server only |
| Dev: `vitest`, `@testing-library/react`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `prettier`, `size-limit`, `@lhci/cli`, `gitleaks` (CI binary), `supabase` CLI | Testing/quality | dev only |

**Explicitly rejected for MVP:** framer-motion/motion, konva/fabric, recharts/
chart.js, redux/zustand (React state + reducers suffice; revisit if needed),
react-query (Server Components + Server Actions cover adult data; Child Mode reads
Dexie), next-pwa (unmaintained), moment/dayjs (use `Intl`), lodash.

## 4. Risk register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| R1 | Curriculum wording unverified (VR rows) → content mis-mapped | High | Medium | Teacher validation before content; VR flag visible; excluded from reports | Product + Nenyere |
| R2 | Legal status (controller/licence/DPO/transfer) unresolved before launch | Medium | High | Items H1–H6 raised now; production gated on sign-off | Human legal |
| R3 | Low-end tablet performance below budget | Medium | High | Budgets in CI; no heavy libs; test on real device from M2 | Eng |
| R4 | Audio unlock/autoplay restrictions on Android WebView / iOS | Medium | Medium | Gesture-unlock pattern; speaker button always present | Eng |
| R5 | Storage eviction of offline data (Safari/low storage) | Medium | High | Install prompt, `storage.persist()`, quota checks, small packs | Eng |
| R6 | Duplicate/lost attempts in sync | Low | High | Client UUID idempotency, pgTAP tests, dead-letter surfacing | Eng |
| R7 | Cross-tenant leak via a missed policy | Low | Critical | Deny-by-default, no-RLS-table guard test, negative tests per table | Eng |
| R8 | Shona audio/phonics pedagogically wrong | Medium | High | Hard language-review gate; no auto-translation | Content |
| R9 | Design drifts toward generic dashboard look | Medium | Medium | Figma as source of truth; review checklist | Design |
| R10 | Scope creep (AI, parent portal, billing) | Medium | Medium | Out-of-scope list; ADR for any addition | PM |
| R11 | Commissioned illustrations delayed | Medium | Medium | Placeholder = simple vector pictograms in brand style (not stock/clip-art); swap without code change via media library | Content |
| R12 | Supabase/Vercel outage during school day | Low | Low | Offline-first means Child Mode continues | — |
| R13 | Classroom device account compromised | Low | Medium | Minimal role; revocation via membership; no progress data readable | Eng |
| R14 | TS vs SQL scoring divergence | Medium | Medium | Shared fixtures + parity tests | Eng |

## 5. Cost estimate (monthly, USD, indicative — verify current pricing)

| Item | Pilot (1 school) | Growth (10 schools) |
| --- | --- | --- |
| Vercel Pro (required for commercial use; 1 seat) | ~20 | ~20–40 |
| Supabase Pro (prod) | 25 | 25 + usage (compute add-on likely ~10–50) |
| Supabase staging | 0 (Free) | 0–25 |
| Sentry (Developer/Team) | 0–26 | 26 |
| GitHub (Free/Team) | 0 | 0–4/user |
| Figma (Professional, 1 editor) | ~15 | ~15 |
| Domain + email | ~2 | ~2 |
| **Total** | **~60–90** | **~100–200** |

One-off: illustration/mascot commission, Shona voice recording, one test tablet
(~US$100–150), optional external pen test. Bandwidth: content packs are
downloaded once per device per version (≤ 40 MB), so egress is small.

## 6. Performance budget (enforced by `size-limit` + Lighthouse CI)

| Metric | Budget |
| --- | --- |
| Child Mode first-route JS (gz) | 150 kB |
| Per-engine chunk (gz) | 40 kB |
| Adult portal first-route JS (gz) | 250 kB |
| LCP (Moto G4 profile, slow 4G) | ≤ 2.5 s warm (SW), ≤ 4 s cold |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| Image per activity | ≤ 80 kB |
| Audio clip | ≤ 60 kB |
| Content pack per level | ≤ 40 MB |

## 7. Future scalability strategy
See `architecture.md` §10. Summary: tenancy, versioned content, pseudonymous
evidence and function-based writes are all in the MVP schema, so multi-school,
guardian portal, more languages, and AI-assisted teacher summaries are additive
features rather than migrations.

## 8. Approval checklist (please confirm or amend)

1. Accept deviations: ADR-007 (CLASSROOM_DEVICE; learners not auth users),
   ADR-009 (public-read bucket for published, non-personal media), ADR-015
   (28 types → 12 engines), ADR-018 (birth month not full DOB).
2. Accept technology stack (ADR-001…014).
3. Accept mastery model (ADR-016) and reporting stance (no single score).
4. Accept MVP scope and out-of-scope list (product-requirements §6, §8).
5. Confirm who will validate curriculum rows marked VR and record Shona audio.
6. Acknowledge legal items H1–H6 as human-owned prerequisites for production.
7. Approve Session 2 (Figma) to begin.
