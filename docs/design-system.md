# Design System Proposal and Figma Screen Inventory

Status: **PROPOSAL** — to be realised in Figma in Session 2 (Figma MCP). This
document defines direction, tokens and the screen inventory so the Figma work
has a checklist and implementation has a contract.

## 1. Brand direction — "Nenyere" (Shona: *star*)

Concept: **a small star that guides discovery.** Warm, sunlit, grounded in
Zimbabwean textures (msasa leaf greens, granite kopje greys, clay ochres, jacaranda
accents) without literal ethnic pattern clichés. Premium children's product,
not a cartoon game.

**Mascot concept:** *Nyere* — a small, friendly five-point star character with
simple eyes and expressive arms, drawn in a soft geometric style. Appears in
INTRO, hints and celebrations only; never clutters activity space. Alternate
guide for stories: *Gogo* (grandmother storyteller silhouette) — to be validated
with the school for cultural fit.

Tone: encouraging, calm, concise. Voice examples: "You found it!", "Let's try
again", "Great listening".

## 2. Design tokens (Figma Variables → CSS custom properties)

### 2.1 Colour (semantic; raw palette lives in Figma)
| Token | Role | Draft value |
| --- | --- | --- |
| `--color-brand-sun` | Primary accent (stars, CTAs child) | #F2A93B |
| `--color-brand-msasa` | Secondary (success, growth) | #4F8A5B |
| `--color-brand-clay` | Warm surface accent | #C9704A |
| `--color-brand-jacaranda` | Playful accent (stories, badges) | #7E6BB5 |
| `--color-brand-sky` | Info / calm backgrounds | #5FA8D3 |
| `--color-ink-900/700/500` | Text | #1E1B16 / #4A443A / #7A7267 |
| `--color-surface-0/1/2` | Backgrounds (warm off-whites) | #FFFDF8 / #FBF5EA / #F3EADB |
| `--color-feedback-correct` | Correct (paired with icon) | msasa |
| `--color-feedback-encourage` | Encourage (never red) | sun |
| `--color-danger` | Adult UIs only (destructive) | #B4453A |
| Activity colour set (`red, blue, yellow, green, orange, purple, black, white, brown, pink`) | Colour-learning stimuli; must be unambiguous and named in audio | to be tuned for contrast |

All text/background pairs must pass 4.5:1; large child text 3:1 minimum but we
target 4.5:1 anyway.

### 2.2 Typography
- **Child UI:** a rounded humanist sans with clear single-storey `a` and
  unambiguous `I l 1` (candidates: *Nunito*, *Andika* — Andika is designed for
  early readers, SIL OFL). Sizes: 40/32/24 px; numerals 64–96 px in activities.
- **Adult UI:** *Inter* (or system UI) 14/16/20/24/32 px scale, 1.5 line height.
- Tokens: `--font-kids`, `--font-adult`, `--text-{xs..4xl}`, `--leading-*`.

### 2.3 Spacing, radii, elevation, motion
- Spacing: 4-pt base, scale 4/8/12/16/24/32/48/64.
- Radii: `--radius-sm 8`, `--radius-md 16`, `--radius-lg 24`, `--radius-pill`.
  Adult UI uses sm/md; child tiles use lg — not "rounded cards everywhere".
- Elevation: 3 levels, warm-tinted shadows, low spread.
- Motion: durations 120/200/320 ms; easing `cubic-bezier(.2,.8,.2,1)`; all
  motion honours `prefers-reduced-motion`.

### 2.4 Sizing rules (child)
- Minimum touch target 64 × 64 px; primary tiles 160–220 px; grid max 8 tiles.
- Safe zone: 24 px margins; no controls within 16 px of screen edge except the
  exit gate (top-left, hold 2 s).

## 3. Component inventory

### 3.1 Shared
Tokens, icon set (single-weight outlined set, e.g. Lucide for adult; custom
filled pictograms for child), logo, mascot poses (idle, happy, thinking, celebrate).

### 3.2 Child components (`src/ui/kids`)
| Component | Variants/states |
| --- | --- |
| `KidTile` | domain colour, with icon, star indicator (0–3), locked, pressed |
| `KidButton` | primary/secondary, icon-only (speaker, next, replay), sizes L/XL |
| `AvatarTile` | 24 illustrated avatars, selected, name label |
| `PicturePin` | 6-picture grid, 2-pick sequence |
| `InstructionBar` | text + speaker, playing state |
| `ProgressDots` | n items, current, done |
| `FeedbackOverlay` | correct / encourage, with mascot pose, auto-dismiss |
| `StarBurst` | 1–3 stars celebration, reduced-motion variant |
| `BadgeReveal` | new badge modal |
| `ExitGate` | hold-to-exit ring + simple sum fallback |
| Engine surfaces | `ChoiceGrid`, `MatchBoard`, `SortBins`, `CountingScene`, `TraceCanvas`, `DotsCanvas`, `ColourCanvas` + palette, `SequenceRail`, `MemoryGrid`, `PuzzleBoard`, `DiffPair`, `StoryPage` |
| `StoryControls` | play/pause, prev/next, page progress |
| `OfflineChip` | tiny, non-intrusive indicator (teacher-facing only) |

### 3.3 Adult components (`src/ui/adult`, shadcn/ui base)
Button, Input, Select, Combobox, Checkbox/Switch, Textarea, Form field + error,
Dialog, Sheet, Dropdown, Tabs, Table (sortable, paginated), Card (sparingly),
Badge/Status pill, Toast, Tooltip, Skeleton, Empty state, Error state,
Breadcrumb, Sidebar nav, Top bar, Stat tile, `MasteryPill` (5 stages, icon+label),
`SkillMatrix` (learners × skills heat table, colour + glyph), `Sparkline`,
`AttemptTimeline`, `ObservationCard`, `ConsentStatus`, `ContentStatusStepper`,
`ActivityPreviewFrame` (renders child engine in a device frame), `JsonSchemaForm`.

## 4. Layout system
| Form factor | Child Mode | Adult portals |
| --- | --- | --- |
| Phone (≥ 360) | Not primary; 2-column tiles, activity fits portrait | Single column, bottom nav |
| Tablet portrait (768) | 2×4 tiles; activities designed portrait-first | Sidebar collapsed |
| Tablet landscape (1024) | 4×2 tiles; activities landscape | Sidebar + content |
| Desktop (≥ 1280) | Centered 1024 stage with letterbox | Full sidebar, 2-col dashboards |
| Classroom display (≥ 1920, touch) | Scaled stage, 96 px targets, keyboard nav | — |

Child Mode uses a fixed **stage** (design at 1024×768 and 768×1024) scaled with
`min(vw/1024, vh/768)` for canvas engines so tolerances stay proportional.

## 5. Figma file structure (Session 2 deliverable)
```
Nenyere ECD — Design System
  00 Cover & principles
  01 Foundations (Variables: colour, type, space, radius, elevation, motion)
  02 Icons & pictograms
  03 Mascot & illustration guide
  04 Components / Kids
  05 Components / Adult
  06 Patterns (feedback, empty/error/loading states, forms)
Nenyere ECD — Screens
  10 Child Mode (tablet landscape + portrait variants)
  20 Teacher portal (tablet + desktop + phone)
  30 Admin & CMS (desktop + tablet)
  40 Platform (desktop)
  50 Prototype flows (J1–J6)
```
Every component uses Variables (no hard-coded colours), auto-layout, and
component properties mapped 1:1 to React props (`variant`, `size`, `state`).
Code Connect (or a documented mapping table) links Figma components to
`src/ui/**` components.

## 6. Screen inventory (minimum, from spec §28 + additions)

| # | Screen | Group | Form factors | Notes |
| --- | --- | --- | --- | --- |
| 1 | Splash / loading | Public | all | Star mark, offline-ready hint |
| 2 | Welcome (device not signed in) | Public | tablet, desktop | Sign in as teacher / device |
| 3 | Teacher sign-in, magic link sent, reset | Auth | all | |
| 4 | Learner picker | Kids | tablet L/P, display | Avatars, optional picture-PIN |
| 5 | Child dashboard | Kids | tablet L/P, display | 8 tiles, greeting |
| 6 | Activity library (domain) | Kids | tablet L/P | 4–6 tiles/page, stars |
| 7 | Activity — INTRO | Kids | tablet L/P | |
| 8 | Activity — INSTRUCTION (demo) | Kids | tablet L/P | |
| 9 | Activity — one screen per engine (12) | Kids | tablet L/P | choice, match, drag-sort, counting (+ add/subtract), trace, join-dots, colouring, sequence, memory, puzzle, spot-difference, story |
| 10 | Item feedback (correct / encourage) | Kids | tablet | overlay |
| 11 | Activity summary / success | Kids | tablet | stars, next/replay |
| 12 | Retry / resume prompt | Kids | tablet | |
| 13 | Story shelf | Kids | tablet | |
| 14 | Story reader + question page | Kids | tablet L/P | |
| 15 | Rewards (my stars & badges) | Kids | tablet | |
| 16 | Exit gate | Kids | tablet | |
| 17 | Teacher dashboard | Teach | tablet, desktop, phone | stats, support list, recent |
| 18 | Class view | Teach | tablet, desktop | roster, skill matrix |
| 19 | Learner profile | Teach | tablet, desktop | |
| 20 | Learner progress (mastery, timeline, replay) | Teach | tablet, desktop | |
| 21 | Activity assignment | Teach | tablet, desktop | pick activities, overrides |
| 22 | Observations (list + add) | Teach | tablet, phone | |
| 23 | Content review queue + play preview | Teach | desktop | |
| 24 | Admin dashboard | Admin | desktop, tablet | |
| 25 | School settings | Admin | desktop | |
| 26 | Users & roles | Admin | desktop | incl. device accounts |
| 27 | Classes & enrolments | Admin | desktop | |
| 28 | Learner registry + add learner | Admin | desktop, tablet | minimal fields |
| 29 | Consent register + record consent | Admin | desktop | |
| 30 | Learner data actions (export/erase) | Admin | desktop | confirmations |
| 31 | Content library (activities, stories, media, audio, translations) | Admin/CMS | desktop | filters by status |
| 32 | Activity editor (schema-driven + live preview) | CMS | desktop | |
| 33 | Story editor | CMS | desktop | |
| 34 | Media upload + licence metadata | CMS | desktop | |
| 35 | Content pack / publish dialog | CMS | desktop | |
| 36 | Reports — learner progress (print layout) | Admin/Teach | desktop, print | |
| 37 | Audit log | Admin | desktop | |
| 38 | Curriculum browser (areas, objectives, validation status) | Admin | desktop | |
| 39 | Platform — schools | Platform | desktop | |
| 40 | Privacy policy / consent info page | Public | all | |
| 41 | Offline fallback page (adult) | Public | all | |
| 42 | Empty / error / loading states for 17–38 | Patterns | — | designed once, applied |

## 7. Quality checklist for design review (Phase 8)
- Every colour and size comes from a Variable.
- No screen has more than one primary action (Child Mode).
- Every child screen has an audio affordance and no reliance on reading.
- Contrast pass for all text; colour-blind check for activity colour set.
- Icons from one set, one weight.
- Tablet portrait and landscape both designed, not scaled.
- Empty, error and loading states exist for every adult list/detail screen.
