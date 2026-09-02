/**
 * Trace engine schema.
 * Covers: tracing, pre-writing strokes
 * Per docs/activity-engine.md §4, §7 (pre-writing trace algorithm)
 */
import { z } from "zod";
import { ActivityBaseSchema, LocalizedTextSchema, LocalizedAssetRefSchema } from "./common";

// ── Trace path point ────────────────────────────────────────────────────────
const TracePointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

// ── Trace stroke (a connected path) ─────────────────────────────────────────
const TraceStrokeSchema = z.object({
  id: z.string(),
  points: z.array(TracePointSchema).min(2),
  width: z.number().min(2).max(20).default(8),
  colour: z.string().default("#F2A93B"),
  is_guide: z.boolean().default(true),
});

// ── Trace item ──────────────────────────────────────────────────────────────
const TraceItemSchema = z.object({
  id: z.string(),
  strokes: z.array(TraceStrokeSchema).min(1),
  // Tolerance for deviation from guide path (in normalised units)
  tolerance: z.number().min(0.01).max(0.2).default(0.08),
  // Minimum coverage percentage to be considered "complete"
  min_coverage: z.number().min(0.5).max(1).default(0.75),
  // Audio played when stroke completed
  completion_audio: LocalizedAssetRefSchema.optional(),
  // Letter/shape name for feedback
  label: LocalizedTextSchema.optional(),
});

// ── Trace activity definition ───────────────────────────────────────────────
export const TraceActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("trace"),
  items: z.array(TraceItemSchema).min(1).max(6),
  canvas_width: z.number().int().min(200).max(1200).default(600),
  canvas_height: z.number().int().min(200).max(1200).default(400),
  show_dotted_guide: z.boolean().default(true),
  show_starting_dot: z.boolean().default(true),
  brush_colours: z.array(z.string()).min(1).max(4).default(["#F2A93B", "#4a7fc1", "#5a9e57", "#e88a3a"]),
});

export type TraceActivity = z.infer<typeof TraceActivitySchema>;
export type TraceItem = z.infer<typeof TraceItemSchema>;
export type TraceStroke = z.infer<typeof TraceStrokeSchema>;

// ── Scoring: coverage × accuracy ────────────────────────────────────────────
export function scoreTrace(
  activity: TraceActivity,
  responses: Array<{
    item_id: string;
    coverage: number;
    deviation: number;
    hint_level: number;
  }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.items.length;
  let items_correct = 0;
  let total_score = 0;

  for (const r of responses) {
    const item = activity.items.find((i) => i.id === r.item_id);
    if (!item) continue;

    const coverage_score = r.coverage >= item.min_coverage ? 1 : r.coverage / item.min_coverage;
    const accuracy_score = r.deviation <= item.tolerance ? 1 : Math.max(0, 1 - (r.deviation - item.tolerance) / item.tolerance);
    const item_score = coverage_score * accuracy_score;
    total_score += item_score;
    if (item_score >= 0.6) items_correct++;
  }

  const accuracy = items_total > 0 ? total_score / items_total : 0;
  const stars =
    accuracy >= activity.scoring.star_bands.three ? 3 :
    accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}
