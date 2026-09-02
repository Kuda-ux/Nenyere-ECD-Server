/**
 * Join-dots, colouring, sequence, memory, puzzle, spot-difference, story
 * engine schemas.
 * Per docs/activity-engine.md §4
 */
import { z } from "zod";
import { ActivityBaseSchema, LocalizedTextSchema, LocalizedAssetRefSchema } from "./common";

// ══ JOIN-DOTS ════════════════════════════════════════════════════════════════
const JoinDotsItemSchema = z.object({
  id: z.string(),
  dots: z.array(z.object({
    id: z.string(),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    label: z.string().optional(),
  })).min(2).max(26),
  // Correct order of dot ids
  correct_sequence: z.array(z.string()),
  // Image revealed when complete
  reveal_image: LocalizedAssetRefSchema,
  reveal_label: LocalizedTextSchema.optional(),
});

export const JoinDotsActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("join-dots"),
  items: z.array(JoinDotsItemSchema).min(1).max(5),
  show_numbers: z.boolean().default(true),
  line_colour: z.string().default("#F2A93B"),
});

export type JoinDotsActivity = z.infer<typeof JoinDotsActivitySchema>;
export type JoinDotsItem = z.infer<typeof JoinDotsItemSchema>;

export function scoreJoinDots(
  activity: JoinDotsActivity,
  responses: Array<{ item_id: string; sequence: string[]; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.items.length;
  let items_correct = 0;
  for (const r of responses) {
    const item = activity.items.find((i) => i.id === r.item_id);
    if (!item) continue;
    const correct = JSON.stringify(r.sequence) === JSON.stringify(item.correct_sequence);
    if (correct) items_correct++;
  }
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars = accuracy >= activity.scoring.star_bands.three ? 3 : accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}

// ══ COLOURING ════════════════════════════════════════════════════════════════
const ColouringRegionSchema = z.object({
  id: z.string(),
  // SVG path or polygon points defining the region
  path: z.string(),
  // Correct colour for this region
  correct_colour: z.string(),
  // Optional: accept any colour (free colouring)
  accept_any: z.boolean().default(false),
});

export const ColouringActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("colouring"),
  svg_template: z.string(),
  regions: z.array(ColouringRegionSchema).min(1).max(20),
  palette: z.array(z.string()).min(2).max(8),
  // Whether to show the target image as a guide
  show_guide: z.boolean().default(true),
});

export type ColouringActivity = z.infer<typeof ColouringActivitySchema>;
export type ColouringRegion = z.infer<typeof ColouringRegionSchema>;

export function scoreColouring(
  activity: ColouringActivity,
  responses: Array<{ region_id: string; colour: string; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.regions.length;
  let items_correct = 0;
  for (const r of responses) {
    const region = activity.regions.find((rg) => rg.id === r.region_id);
    if (!region) continue;
    if (region.accept_any || region.correct_colour.toLowerCase() === r.colour.toLowerCase()) {
      items_correct++;
    }
  }
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars = accuracy >= activity.scoring.star_bands.three ? 3 : accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}

// ══ SEQUENCE ═════════════════════════════════════════════════════════════════
const SequenceItemSchema = z.object({
  id: z.string(),
  // Steps in correct order
  steps: z.array(z.object({
    id: z.string(),
    image: LocalizedAssetRefSchema.optional(),
    text: LocalizedTextSchema.optional(),
    audio: LocalizedAssetRefSchema.optional(),
  })).min(2).max(6),
  // Whether to show numbered slots or free arrange
  show_slots: z.boolean().default(true),
});

export const SequenceActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("sequence"),
  items: z.array(SequenceItemSchema).min(1).max(5),
  shuffle_steps: z.boolean().default(true),
});

export type SequenceActivity = z.infer<typeof SequenceActivitySchema>;
export type SequenceItem = z.infer<typeof SequenceItemSchema>;

export function scoreSequence(
  activity: SequenceActivity,
  responses: Array<{ item_id: string; ordered_step_ids: string[]; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.items.length;
  let items_correct = 0;
  for (const r of responses) {
    const item = activity.items.find((i) => i.id === r.item_id);
    if (!item) continue;
    const correct = item.steps.map((s) => s.id);
    if (JSON.stringify(r.ordered_step_ids) === JSON.stringify(correct)) items_correct++;
  }
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars = accuracy >= activity.scoring.star_bands.three ? 3 : accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}

// ══ MEMORY ═══════════════════════════════════════════════════════════════════
const MemoryCardSchema = z.object({
  id: z.string(),
  pair_id: z.string(),
  image: LocalizedAssetRefSchema.optional(),
  text: LocalizedTextSchema.optional(),
  audio: LocalizedAssetRefSchema.optional(),
});

export const MemoryActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("memory"),
  cards: z.array(MemoryCardSchema).min(4).max(12),
  // Grid columns
  columns: z.number().int().min(2).max(4).default(3),
  // Show all cards briefly at start (ms)
  preview_ms: z.number().int().min(0).max(5000).default(2000),
});

export type MemoryActivity = z.infer<typeof MemoryActivitySchema>;
export type MemoryCard = z.infer<typeof MemoryCardSchema>;

export function scoreMemory(
  activity: MemoryActivity,
  responses: Array<{ matched: boolean; attempts: number; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const total_pairs = activity.cards.length / 2;
  const matched = responses.filter((r) => r.matched).length;
  const total_attempts = responses.reduce((sum, r) => sum + r.attempts, 0);
  const accuracy = total_attempts > 0 ? matched / total_attempts : 0;
  const stars = accuracy >= activity.scoring.star_bands.three ? 3 : accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total: total_pairs, items_correct: matched };
}

// ══ PUZZLE ═══════════════════════════════════════════════════════════════════
const PuzzlePieceSchema = z.object({
  id: z.string(),
  // Grid position (row, col) in the completed puzzle
  correct_row: z.number().int().min(0),
  correct_col: z.number().int().min(0),
  // Image segment (SVG path or image URL for this piece)
  image: LocalizedAssetRefSchema,
});

export const PuzzleActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("puzzle"),
  pieces: z.array(PuzzlePieceSchema).min(2).max(9),
  rows: z.number().int().min(1).max(3),
  cols: z.number().int().min(2).max(3),
  show_ghost: z.boolean().default(false),
});

export type PuzzleActivity = z.infer<typeof PuzzleActivitySchema>;
export type PuzzlePiece = z.infer<typeof PuzzlePieceSchema>;

export function scorePuzzle(
  activity: PuzzleActivity,
  responses: Array<{ piece_id: string; placed_row: number; placed_col: number; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.pieces.length;
  let items_correct = 0;
  for (const r of responses) {
    const piece = activity.pieces.find((p) => p.id === r.piece_id);
    if (!piece) continue;
    if (piece.correct_row === r.placed_row && piece.correct_col === r.placed_col) items_correct++;
  }
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars = accuracy >= activity.scoring.star_bands.three ? 3 : accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}

// ══ SPOT-DIFFERENCE ══════════════════════════════════════════════════════════
const DifferenceZoneSchema = z.object({
  id: z.string(),
  // Normalised coordinates of the difference zone (centre + radius)
  cx: z.number().min(0).max(1),
  cy: z.number().min(0).max(1),
  radius: z.number().min(0.02).max(0.2),
});

export const SpotDifferenceActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("spot-difference"),
  image_left: LocalizedAssetRefSchema,
  image_right: LocalizedAssetRefSchema,
  differences: z.array(DifferenceZoneSchema).min(1).max(6),
  // Tolerance for tap position (as fraction of radius)
  tap_tolerance: z.number().min(0.5).max(2).default(1.2),
});

export type SpotDifferenceActivity = z.infer<typeof SpotDifferenceActivitySchema>;
export type DifferenceZone = z.infer<typeof DifferenceZoneSchema>;

export function scoreSpotDifference(
  activity: SpotDifferenceActivity,
  responses: Array<{ diff_id: string; found: boolean; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.differences.length;
  const items_correct = responses.filter((r) => r.found).length;
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars = accuracy >= activity.scoring.star_bands.three ? 3 : accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}

// ══ STORY ════════════════════════════════════════════════════════════════════
const StoryPageSchema = z.object({
  id: z.string(),
  image: LocalizedAssetRefSchema,
  narration: LocalizedAssetRefSchema,
  text: LocalizedTextSchema.optional(),
  // Optional interaction on this page
  interaction: z.object({
    type: z.enum(["tap_hotspot", "tap_correct", "choose_path"]),
    prompt: LocalizedTextSchema.optional(),
    audio_prompt: LocalizedAssetRefSchema.optional(),
    // For tap_hotspot: areas that trigger a response
    hotspots: z.array(z.object({
      id: z.string(),
      cx: z.number().min(0).max(1),
      cy: z.number().min(0).max(1),
      radius: z.number().min(0.02).max(0.3),
      response_audio: LocalizedAssetRefSchema,
      response_text: LocalizedTextSchema.optional(),
    })).optional(),
    // For tap_correct: choices
    choices: z.array(z.object({
      id: z.string(),
      text: LocalizedTextSchema,
      audio: LocalizedAssetRefSchema.optional(),
      is_correct: z.boolean(),
    })).optional(),
    // For choose_path: which page to go to
    paths: z.array(z.object({
      choice_id: z.string(),
      next_page_id: z.string(),
    })).optional(),
  }).optional(),
});

export const StoryActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("story"),
  pages: z.array(StoryPageSchema).min(2).max(12),
  // Whether pages auto-advance after narration
  auto_advance: z.boolean().default(false),
  auto_advance_delay_ms: z.number().int().min(500).max(10000).default(2000),
});

export type StoryActivity = z.infer<typeof StoryActivitySchema>;
export type StoryPage = z.infer<typeof StoryPageSchema>;

export function scoreStory(
  activity: StoryActivity,
  responses: Array<{ page_id: string; is_correct: boolean; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  // Stories are scored by completion + interaction correctness
  const interactive_pages = activity.pages.filter((p) => p.interaction).length;
  const items_total = Math.max(interactive_pages, 1);
  const items_correct = responses.filter((r) => r.is_correct).length;
  const accuracy = items_total > 0 ? items_correct / items_total : 1;
  const stars = accuracy >= activity.scoring.star_bands.three ? 3 : accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}
