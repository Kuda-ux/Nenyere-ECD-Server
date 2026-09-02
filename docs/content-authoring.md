# Content Authoring and Publishing Workflow

Status: **PROPOSED**.

## 1. Roles in the workflow

| Step | Status | Who | Gate |
| --- | --- | --- | --- |
| Create / edit | `draft` | CONTENT_EDITOR (or SCHOOL_ADMIN) | Zod valid; all assets uploaded with licence metadata |
| Submit | `review` | CONTENT_EDITOR | Feedback-wording lint passes; at least one curriculum objective linked; audio present for every instruction in the activity's language |
| Review (play-test) | `approved` / back to `draft` with notes | TEACHER with `reviewer` flag | Reviewer must play the activity in the preview frame; language content additionally requires a reviewer with `language_reviewer: sn` |
| Publish | `published` | SCHOOL_ADMIN (or SUPER_ADMIN for global) | Creates immutable version; copies assets to `media-published`; bumps content pack; audit log |
| Retire | `archived` | SCHOOL_ADMIN | Existing attempts keep referencing the version; hidden from pickers |

Editing a published item always creates a **new version in `draft`**; the
published version remains live until the new one is published.

## 2. Activity editor (schema-driven)
- Form generated from the Zod schema of the selected activity type; custom
  widgets for: stimulus picker (media library), path editor (trace/join-dots —
  draw on canvas, snap points), region painter (colouring SVG), hotspot placer
  (spot-difference), pair builder (match/memory).
- Live preview renders the real child engine in a tablet frame (landscape /
  portrait toggle) — same code path as production.
- Curriculum picker shows objective text with its `validation_status`; VR
  objectives are selectable but shown with a warning and excluded from reports.
- Localisation tab: per-locale title/instructions/feedback + audio upload; a
  locale is "complete" only when text and audio exist.

## 3. Story editor
Pages with image, text per locale, narration audio per locale, optional
embedded interaction (choice/sequence), vocabulary items, and a comprehension
set. Reading-level guard: ≤ 12 words per page for ECD A, ≤ 20 for ECD B (warn).

## 4. Media library
- Upload → validation (type, size, sanitise SVG, re-encode raster to WebP/AVIF,
  transcode audio to Opus + AAC, loudness-normalise to −16 LUFS) → content-
  addressed path.
- Mandatory metadata: `source` (original / licensed / public domain),
  `license` (e.g. CC0, CC-BY-4.0, "commissioned — Nenyere"), `attribution`,
  `alt` per locale. Publishing is blocked if any asset lacks licence data.
- No scraping; no copyrighted children's books. Original illustrations are
  commissioned or produced in-house in the mascot style guide.

## 5. Seed content plan (Session 4, "first complete set")

| Domain | Activities (type) | Level |
| --- | --- | --- |
| Pre-writing | Straight lines (trace), curves (trace), zigzag (trace), circle (trace), pattern rows (trace) | A, B |
| Join dots | Hut (5 dots), fish (7), star (5→ B: 10), kombi (12) | A, B |
| Numbers | Identify 1–5 (tap), count cows 1–5 (counting), identify 1–10 (B), count chickens 1–10 (B), sequence 1–5 (sequence) | A, B |
| Operations | Add within 5 (mangoes), subtract within 5 (goats leave the kraal) | B |
| Matching | Animal↔animal, animal↔sound, shape↔shape, colour↔colour, mother↔baby animal (B), picture↔word (B) | A, B |
| Shapes | Identify circle/square/triangle (tap), sort shapes (drag-sort), shape puzzle | A, B |
| Colours | Identify colours (audio→tap), colour match, sort by colour, colouring (free), colouring (target) | A, B |
| Phonics / sounds | Environmental sounds (rain, kombi horn, drum, cock crow), animal sounds, vowels a e i o u (B), beginning sounds (B) | A, B |
| Coordination | Tap the moving star (timed choice), drag the ball to the basket, pop the bubbles | A, B |
| Puzzles | 2×2 elephant, 2×3 kombi, 3×3 flag (B), spot the difference (market scene: 2 diffs A / 4 diffs B), memory 2×2 / 3×4 | A, B |
| Environment | Weather identify, dress for the weather (match), transport identify, land/air/water sort, animal homes | A, B |
| Health & body | Body parts (tap), hand-washing sequence, healthy snack choice | A, B |
| Social | Family members, community helpers, sharing scenarios (story interaction) | A, B |
| ICT | Identify devices (tablet, phone, computer, radio), safe use (choose safe behaviour) | A, B |
| Stories (original) | 5 short stories with Zimbabwean settings (e.g. *Tariro and the Rain*, *The Kombi Ride to Mbare Musika*, *Gogo's Garden*, *Tinashe Shares His Maputi*, *The Little Star Nyere*) with narration, 2 questions each, vocabulary | A, B |

Target: ~60 activities + 5 stories, all with English text + audio; Shona audio
where reviewed. Each seeded item is authored as JSON in `/content` and
validated in CI.

## 6. Content quality rules (enforced by lint where possible)
- No negative feedback words (`wrong`, `fail`, `bad`, `no!`).
- Every stimulus has alt text and audio.
- Colour activities never rely on colour names alone.
- Distractors are plausible and age-appropriate (no trick questions).
- ≤ 6 items per activity for ECD A, ≤ 10 for ECD B.
- Culturally specific content reviewed by a Zimbabwean educator; avoid stereotypes.
