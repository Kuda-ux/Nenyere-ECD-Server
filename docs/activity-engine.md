# Activity Engine Architecture

Status: **PROPOSED — awaiting review**. No code yet; this document defines the
contract that Session 4 implements.

---

## 1. Goals
- One runner, many activity types; new types added by **adding a schema member
  and (optionally) one engine module** — never by editing the runner.
- Activities are **data** (versioned JSON validated by Zod) authored in the CMS
  and cached offline.
- Instant client feedback; authoritative server scoring (ADR-010).
- Every activity follows the same lifecycle so children always know what to expect.

## 2. Activity types → interaction engines (ADR-015)

| # | Activity type (author-facing) | Engine (code) | Notes |
| --- | --- | --- | --- |
| 1 | matching | `match` | image↔image / word / audio / shape / colour; configurable rules |
| 2 | drag_and_drop | `drag-sort` | targets with accept rules |
| 3 | tap_correct | `choice` | single target among distractors, visual prompt |
| 4 | multiple_choice | `choice` | picture-first options, audio prompt |
| 5 | counting | `counting` | tap-to-count objects (one-to-one), then choose numeral |
| 6 | sorting | `drag-sort` | 2–3 bins by attribute |
| 7 | shape_matching | `match` | preset = shapes |
| 8 | shape_sorting | `drag-sort` | preset = shapes |
| 9 | colour_identification | `choice` | audio names colour; never colour-name text alone |
| 10 | colouring | `colouring` | flood-fill regions of SVG; optional target palette |
| 11 | joining_dots | `join-dots` | numbered or lettered dots, shape reveal |
| 12 | tracing | `trace` | path with tolerance; strokes: line, curve, circle, zigzag, shape, pattern, letter/number (later) |
| 13 | pattern_completion | `choice` | ABAB / ABC with visual or audio patterns |
| 14 | spot_the_difference | `spot-difference` | two images, tap hotspots |
| 15 | puzzle | `puzzle` | jigsaw grid 2–9 pieces, snap-to-slot |
| 16 | phonics_recognition | `choice` | audio phoneme → letter/picture |
| 17 | sound_recognition | `choice` | audio → picture (environmental/object/people) |
| 18 | animal_sound_recognition | `choice` | preset = animals |
| 19 | story_interaction | `story` | pages + embedded mini-interactions (choice/sequence) |
| 20 | sequence_ordering | `sequence` | drag cards into order (2–4) |
| 21 | classification | `drag-sort` | preset = category bins |
| 22 | memory_game | `memory` | 2×2 to 3×4 card pairs, image or image↔sound |
| 23 | pointing_target | `choice` (timed-target mode) | moving/appearing targets; coordination |
| 24 | basic_addition | `counting` (operation mode) | two concrete groups → combine → choose numeral |
| 25 | basic_subtraction | `counting` (operation mode) | group → remove → choose numeral |
| 26 | image_identification | `choice` | audio/word prompt → tap picture |
| 27 | audio_to_image | `match` or `choice` | hear → pick/match picture |
| 28 | image_to_audio | `choice` | see → pick sound (audio buttons) |

12 engine modules: `choice`, `match`, `drag-sort`, `counting`, `trace`,
`join-dots`, `colouring`, `sequence`, `memory`, `puzzle`, `spot-difference`,
`story`. Each is a lazily loaded chunk (`next/dynamic`) ≤ 40 kB gzipped.

## 3. Lifecycle (runner state machine)

```
INTRO ──► INSTRUCTION ──► ACTIVITY ──► ITEM_FEEDBACK ──┐
  ▲            ▲             ▲              │           │ more items
  │            │             └──────────────┴───────────┘
  │            │                            │ no more items
  │            │                            ▼
  │            └────── RETRY ◄───────── SUMMARY ──► NEXT (back to library / next in assignment)
  └── EXIT (grown-up gate) from any state; partial attempt persisted as `abandoned`
```

- **INTRO**: title, illustration, mascot, auto-plays instruction audio *only if
  audio was unlocked by a prior gesture in this session*; otherwise a large
  speaker button.
- **INSTRUCTION**: optional demonstration (e.g. ghost finger traces the line once).
- **ACTIVITY**: engine renders current item; runner owns timer, attempts count,
  hint scheduling (after 2 incorrect responses show a hint; after 3, highlight).
- **ITEM_FEEDBACK**: always positive; two variants `correct` ("You found it!")
  and `encourage` ("Great try — let's try again"). Never blocks > 1.2 s.
- **SUMMARY**: stars (1–3, based on accuracy bands + completion, never 0), badge
  celebration if earned, two buttons: Play again / Next.
- Runner state is persisted to IndexedDB on every transition (power-loss safe).

## 4. Schema design (Zod, versioned)

Top-level envelope; `type` discriminates the config; `schema_version` is per
envelope, `content_version` per authored revision.

```ts
// Conceptual — final code lives in src/engine/schema
const ActivityBase = z.object({
  id: z.string().uuid(),
  schema_version: z.literal(1),
  type: ActivityType,                       // 28-member enum
  engine: Engine,                           // derived, validated to match type
  title: LocalizedText,                     // { en: string; sn?: string; nd?: string }
  description: LocalizedText.optional(),
  ecd_level: z.enum(['ECD_A', 'ECD_B']),
  difficulty: z.enum(['easy', 'standard', 'stretch']),
  learning_area: LearningAreaKey,           // HBC area
  skills: z.array(SkillKey).min(1),         // platform skills measured
  curriculum_refs: z.array(z.object({
    objective_id: z.string().uuid(),
    validation_status: z.enum(['verified', 'validation_required']),
  })),
  instructions: z.object({
    text: LocalizedText,
    audio: LocalizedAssetRef,               // { en: 'asset:uuid', sn?: ... }
    demo: z.enum(['none', 'ghost_pointer', 'auto_solve_first']).default('none'),
  }),
  assets: z.array(AssetRef),                // everything to precache
  language: z.enum(['en', 'sn', 'nd']),
  estimated_duration_s: z.number().int().min(30).max(600),
  feedback: FeedbackConfig.default(DEFAULT_FEEDBACK),
  scoring: ScoringConfig,                   // per-type rules below
  hints: HintConfig.default(DEFAULT_HINTS),
  tags: z.array(z.string()).default([]),
});

const Activity = z.discriminatedUnion('type', [
  ActivityBase.extend({ type: z.literal('matching'), engine: z.literal('match'), config: MatchConfig }),
  ActivityBase.extend({ type: z.literal('counting'), engine: z.literal('counting'), config: CountingConfig }),
  ActivityBase.extend({ type: z.literal('tracing'), engine: z.literal('trace'), config: TraceConfig }),
  // ... one member per activity type
]);
```

### 4.1 Representative engine configs

```ts
MatchConfig = {
  rule: 'identical' | 'image_to_word' | 'image_to_audio' | 'attribute',
  attribute?: 'shape' | 'colour' | 'category',
  pairs: Array<{ id, left: Stimulus, right: Stimulus }>,   // 2–6 pairs
  layout: 'two_columns' | 'scatter',
  allow_partial_credit: boolean,
}

Stimulus = { kind: 'image' | 'audio' | 'text' | 'shape' | 'colour', ref | value, alt: LocalizedText }

CountingConfig = {
  mode: 'count' | 'add' | 'subtract',
  scenes: Array<{ objects: Array<{ image, count }>, remove?: number, prompt: LocalizedText, prompt_audio }>,
  answer_range: { min: 1, max: 10 },
  numeral_options: 3,
  require_tap_each: boolean,             // one-to-one correspondence: child taps each object first
}

TraceConfig = {
  strokes: Array<{ path: SvgPathD, start_hint: Point, direction_arrows: boolean }>,
  tolerance_px_at_1x: number,            // scaled by viewport; teacher-configurable per assignment
  min_coverage: number,                  // 0–1 of path length that must be covered
  stroke_width: number,
  show_guide: 'always' | 'fade' | 'none',
}

JoinDotsConfig = { dots: Array<{ n, label: numeral|letter, point }>, reveal_image, snap_radius }
ColouringConfig = { svg_ref, regions: Array<{ id, target_colour?: ColourKey }>, palette: ColourKey[], mode: 'free' | 'target' }
SequenceConfig = { cards: Array<{ id, image, audio? }>, correct_order: id[], prompt }
MemoryConfig = { pairs: Array<{ a: Stimulus, b: Stimulus }>, grid: '2x2'|'2x3'|'3x4' }
PuzzleConfig = { image, grid: '1x2'|'2x2'|'2x3'|'3x3', snap_radius, show_ghost: boolean }
SpotDifferenceConfig = { image_a, image_b, hotspots: Array<{ id, cx, cy, r }>, required: number }
ChoiceConfig = { items: Array<{ prompt: Stimulus, options: Stimulus[], correct: id[] , timed?: { appear_ms, lifetime_ms } }>, options_per_item: 2–4 }
StoryConfig = { pages: Array<{ image, text: LocalizedText, narration: LocalizedAssetRef, interaction?: ChoiceConfig | SequenceConfig, vocabulary?: Array<{ word, image, audio }> }>, comprehension: ChoiceConfig }
```

Zod `superRefine` enforces cross-field invariants (e.g. `correct ⊆ options`,
`engine` matches `type`, every `asset:` reference appears in `assets`).

### 4.2 Scoring config

```ts
ScoringConfig = {
  method: 'per_item' | 'coverage' | 'completion',
  star_bands: { one: 0, two: 0.6, three: 0.9 },   // accuracy thresholds; completion always ≥ 1 star
  count_hints_as_partial: boolean,
  max_attempts_per_item: number | null,           // null = unlimited (default for ECD A)
}
```

Server-side `apply_attempt` recomputes accuracy from raw `responses` (correct /
total, or coverage for trace, or found/required for spot-difference) and
bounds-checks client-provided values.

### 4.3 Feedback config
```ts
FeedbackConfig = {
  correct: Array<LocalizedAudioText>,     // rotated randomly: "You found it!", "Excellent!", ...
  encourage: Array<LocalizedAudioText>,   // "Great try!", "Let's try again."
  celebration: 'stars' | 'confetti' | 'mascot_dance',
}
```
Negative wording is blocked by a CMS lint (`feedback_lint` word list).

## 5. Runtime contracts

```ts
interface InteractionEngine<C> {
  Component: React.ComponentType<EngineProps<C>>;
  scoreItem(item, response): ItemResult;          // pure, shared with tests
  preload(config: C): AssetRef[];                  // for AudioManager/image warmup
}

interface EngineProps<C> {
  config: C; itemIndex: number; locale: Locale;
  onResponse(r: ItemResponse): void;               // runner persists + evaluates
  hintLevel: 0 | 1 | 2; reducedMotion: boolean; audio: AudioManager;
}

ItemResponse = { item_id, client_response_id, value: unknown, elapsed_ms, hint_level, pointer_samples?: compact }
```

Engines never talk to storage, network or audio directly except via injected
`audio`. The runner writes `attempts`/`responses` to Dexie and enqueues sync.

## 6. Pre-writing (trace) algorithm

1. Sample the SVG path into N points (≈ every 4 px at design scale).
2. On pointer move, project the pointer onto the nearest unvisited path point
   within `tolerance`; mark it visited; if the pointer drifts beyond 2× tolerance
   for > 150 ms, show a gentle "come back" pulse (no penalty for ECD A).
3. Coverage = visited / N. Stroke passes when coverage ≥ `min_coverage` (default
   0.75 ECD A, 0.85 ECD B) and start/end regions were touched.
4. Direction is encouraged (arrows) but not enforced at ECD A.
5. Pointer samples are downsampled (≤ 100 points) and stored for teacher replay.

## 7. Accessibility in child activities
- Targets ≥ 64 px; hit-slop 8 px.
- Every stimulus has `alt` text and audio; colour never sole channel (shape or
  label always paired).
- `prefers-reduced-motion` disables celebrations' motion (keeps stars).
- Keyboard: arrow/enter navigation for `choice`, `match`, `sequence` (classroom
  display use); canvas engines have a "tap to complete" alternative when a
  teacher enables `accessibility.simplified_motor`.

## 8. Extensibility checklist (adding an activity type)
1. Add enum member + config schema + `superRefine` rules.
2. Map to an existing engine or add `src/engine/interactions/<engine>/`.
3. Add scoring function (TS) and the matching SQL branch in `apply_attempt`.
4. Add fixtures and property test asserting TS/SQL agreement.
5. Add CMS editor form (schema-driven; usually zero custom UI).
6. Add Playwright smoke test that plays one seeded activity of the type.
