# Product Requirements — Nenyere ECD Digital Learning Platform

Status: **DISCOVERY / AWAITING ARCHITECTURE APPROVAL** — no application code exists yet.
Owner: Product Architect (Session 1). Last updated: 2026-09-02.

---

## 1. Purpose

A production-quality, offline-capable, tablet-first digital learning platform for
Early Childhood Development (ECD A and ECD B) at Nenyere Day Care Centre, Mbare,
Harare. Nenyere is tenant #1 of a platform ("KuWeX ECD") that must be able to
serve many schools without re-architecture.

The product is **not** an LMS. It is a play-based children's learning product with
a teacher portal, admin portal and content management system behind it.

## 2. Users and personas

| Persona | Device | Literacy | Session length | Primary goal |
| --- | --- | --- | --- | --- |
| **Learner (ECD A, ~3–4 yrs)** | 7–10" Android tablet, classroom display | Pre-reader; relies on audio + pictures | 3–8 min | Play, explore, get positive feedback |
| **Learner (ECD B, ~4–5 yrs)** | Same | Emerging letter/number recognition | 5–10 min | Practise phonics, counting, pre-writing |
| **Teacher** | Tablet, laptop, phone | Adult; busy; often supervising 15–30 children | 2–15 min bursts | Pick learner, launch activity, see who needs support, record observations |
| **School Admin (Nenyere head)** | Laptop/phone | Adult | Weekly | Manage classes, staff, learners, consent, reports |
| **Content Editor** | Laptop | Adult, curriculum-literate | Hours | Author/review activities, stories, audio |
| **Super Admin (KuWeX)** | Laptop | Technical | Rare | Onboard schools, platform settings, audit |
| *Guardian (future)* | Phone | Adult | Rare | Consent, view child summary |

### Environmental constraints (Mbare, Harare)
- Intermittent connectivity; mobile data is metered and expensive → **offline-first, tiny payloads**.
- Load-shedding → devices may lose power mid-activity → **progress must persist locally every step**.
- Shared devices: one tablet is used by many children in a day → **fast learner switching, no personal logins for children**.
- Mixed language home environments (Shona dominant, Ndebele, English) → **i18n from day one; English UI first, Shona next**.
- Low-cost Android tablets (2 GB RAM, Chrome/WebView) → **performance budget is a hard constraint**.

## 3. Product principles (non-negotiable)

1. **Child safety first** — no public learner data, no rankings, no dark patterns, no ads, no shaming feedback.
2. **Play before instruction** — every activity is an interaction, never a form.
3. **Audio is a first-class modality** — every child-facing instruction has audio; audio is mutable and never autoplays disruptively.
4. **Offline is the default state** — the app assumes no network and treats connectivity as a bonus.
5. **Curriculum-anchored, teacher-validated** — every activity maps to an HBC learning area; unverifiable mappings are flagged, never invented.
6. **Teachers own judgement** — the platform surfaces evidence; it does not grade children.
7. **Tenant boundaries are enforced in the database**, not in the UI.
8. **Premium, warm, uncluttered** design quality bar.

## 4. Information architecture

```
/                         Splash → route by session state
/welcome                  Device not yet signed in (teacher/device sign-in entry)
/kids                     CHILD MODE (full-screen, locked navigation)
  /kids/who               Learner picker (avatar grid, optional picture-PIN)
  /kids/home              Child dashboard (8 large tiles)
  /kids/explore/[domain]  Activity library for one domain (paged, 4–6 tiles per screen)
  /kids/play/[activityId] Activity runner (INTRO → INSTRUCTION → ACTIVITY → FEEDBACK → SUMMARY)
  /kids/stories           Story shelf
  /kids/stories/[storyId] Story player
  /kids/rewards           My stars & badges (private to learner, shown to learner only)
/teach                    TEACHER PORTAL
  /teach                  Dashboard
  /teach/classes/[id]     Class view (roster, activity, support flags)
  /teach/learners/[id]    Learner profile → progress, attempts, observations
  /teach/assign           Assign activities to class/learner
  /teach/observations     Observation log
  /teach/content          Content assigned to my classes; review queue (if reviewer)
/admin                    ADMIN PORTAL
  /admin                  School dashboard
  /admin/school           School settings, terms, languages
  /admin/users            Staff & roles
  /admin/classes          Classes and enrolments
  /admin/learners         Learner registry, consent status, export/delete
  /admin/content          CMS: activities, stories, media, audio, translations
  /admin/content/activities/[id]/edit   Activity editor (schema-driven)
  /admin/curriculum       Curriculum areas/objectives (read-mostly)
  /admin/reports          Learner/class reports (print/PDF)
  /admin/audit            Audit log
  /admin/privacy          Consent records, retention, DSAR workflows
/platform                 SUPER ADMIN (KuWeX)
  /platform/schools       Tenants
  /platform/settings      Feature flags, global content library
/auth/*                   Sign-in, magic link callback, password reset
/privacy, /terms          Public policy pages
```

Child Mode is a separate route group with its own root layout (no adult chrome,
locked orientation hints, exit requires a "grown-up gate" — hold-to-exit or simple
arithmetic — to prevent accidental exit).

## 5. User journeys (MVP)

### J1 — Classroom start-of-day (teacher)
1. Teacher opens the app on the tablet (already installed as PWA).
2. If online, app silently syncs yesterday's queued attempts and pulls new content.
3. Teacher signs in (or the device is already signed in as a *classroom device*).
4. Teacher taps **Child Mode** → learner picker shows only learners in the teacher's classes.

### J2 — Child completes an activity
1. Child taps their avatar (large, photo-free illustrated avatar + first name).
2. Child dashboard: 8 tiles (Numbers, Letters & Sounds, Colours, Shapes, Animals & Nature, Stories, Puzzles, Explore). Audio greeting: "Hello, Tariro!".
3. Tap **Numbers** → 4–6 activity tiles with an icon and a star indicator.
4. Tap an activity → INTRO (mascot + title + audio) → INSTRUCTION (audio + demonstration) → ACTIVITY (e.g. count the cows) → per-item FEEDBACK ("You found it!") → SUMMARY (stars earned, "Play again" / "Next").
5. Every response is written to local IndexedDB immediately; the attempt is queued for sync.
6. Child returns to dashboard. No text-heavy screens, never more than one primary action per screen.

### J3 — Teacher reviews support needs
1. Teacher dashboard shows: learners active today, completion counts, **"Learners who may need support"** (skills at *Practising* with repeated low accuracy).
2. Teacher opens learner → Progress (mastery per skill), Attempts timeline, Observations.
3. Teacher adds an observation ("Holds stylus with whole hand; benefits from thicker tracing lines") and recommends "Straight-line tracing (easy)".

### J4 — Content lifecycle
1. Content editor creates "Match the Farm Animals" in the activity editor (schema-driven form, live preview in a child-frame).
2. Saves as **DRAFT** → submits for **REVIEW** → teacher reviewer plays it, approves (**APPROVED**) → school admin **PUBLISHES** → activity becomes available to assign and to download offline.
3. Editing a published activity creates a new version; the published version stays intact until the new version is published.

### J5 — Offline day
1. Power/network fails at 10:00. Tablets keep working: content is cached, attempts queue locally.
2. At 14:30 the network returns. Service worker background sync flushes the queue; server de-duplicates by `client_attempt_id`.
3. Teacher dashboard updates; no attempt is lost or duplicated.

### J6 — Guardian consent & learner onboarding (admin)
1. Admin registers learner with minimal fields: first name, preferred name, ECD level, class, date of birth (month/year is sufficient for level placement — see privacy.md), guardian consent record (paper form scanned or ticked as "consent on file", date, staff witness).
2. No photo, address, or phone number is collected for the learner.
3. Learner becomes selectable in Child Mode only after consent is recorded.

## 6. Functional scope (MVP)

| Area | In MVP | Deferred |
| --- | --- | --- |
| Authentication | Email+password and magic link for adults; classroom-device sessions; learner picker | SSO, guardian accounts |
| Tenancy | School-scoped data, RLS, Nenyere seeded | Billing, marketplace |
| Roles | SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, CONTENT_EDITOR, CLASSROOM_DEVICE, LEARNER (principal) | PARENT/GUARDIAN |
| Activity Engine | 10 interaction engines covering all 28 requested types (see activity-engine.md) | Adaptive difficulty |
| Content | ~60 seeded activities, 5 original stories, audio for all instructions | Marketplace content |
| Progress | Attempts, responses, skill mastery (5 stages), teacher observations | AI recommendations |
| Teacher portal | Dashboard, class, learner, assign, observe | Messaging |
| Admin portal | School, users, classes, learners, consent, CMS, audit, reports (print) | District reporting |
| CMS | Draft→Review→Approved→Published→Archived, versioning, preview | Collaborative editing |
| Offline | PWA, cached content packs, local attempt queue, idempotent sync | P2P sync between tablets |
| i18n | English UI; content translation tables; Shona-ready | Ndebele, others |
| Audio | Central AudioManager, instruction/feedback/sound banks | TTS |
| Reporting | Learner progress report (print/PDF via browser print CSS) | Scheduled emails |
| Observability | Sentry with PII scrubbing | Product analytics |
| Testing | Vitest, Playwright, pgTAP RLS tests, axe | Visual regression |

## 7. Non-functional requirements

| Requirement | Target |
| --- | --- |
| Child Mode initial JS (gzipped) | ≤ 150 kB on first route; each activity engine chunk ≤ 40 kB |
| Time to interactive on Moto-G-class Android, 3G | ≤ 4 s cold, ≤ 1 s warm (SW cache) |
| Touch → visual response | ≤ 100 ms |
| Activity-to-activity transition | No network dependency; ≤ 300 ms |
| Audio asset | Opus/WebM primary + AAC fallback; ≤ 60 kB per instruction clip |
| Images | AVIF/WebP, ≤ 80 kB per activity illustration, SVG for shapes/icons |
| Offline content pack per ECD level | ≤ 40 MB initial download |
| Availability of local progress | 100% — no attempt lost on disconnect or power loss |
| Accessibility (adult UIs) | WCAG 2.2 AA |
| Accessibility (child UIs) | Touch targets ≥ 64 px, contrast ≥ 4.5:1, never colour-only cues, reduced motion honoured |
| Security | Server-side authz on every mutation; RLS on every tenant table; CSP; audit log |
| Privacy | Data minimisation; consent recorded before processing; pseudonymous IDs in telemetry |

## 8. Out of scope for MVP (explicit)
- Native mobile apps (PWA covers install-to-home-screen).
- Billing / subscriptions.
- Parent portal.
- Automatic translation.
- AI features of any kind.
- Public marketing website beyond a minimal welcome screen.

## 9. Success criteria for MVP acceptance
1. A teacher at Nenyere can, on a low-cost Android tablet, run a full ECD A and ECD B session offline for a day and see accurate progress the next morning after sync.
2. Every one of the 28 requested activity types is playable via seeded content.
3. All 13 critical flows in `docs/testing.md` pass in CI.
4. RLS tests prove a teacher cannot read another school's learners.
5. Design review confirms the child experience meets the "showable to a major edtech company" bar.
6. Privacy review items in `docs/privacy.md` are signed off by a human (legal/compliance is *not* self-certified).
