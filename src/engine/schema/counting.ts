/**
 * Counting engine schema.
 * Covers: counting, basic_addition, basic_subtraction
 * Per docs/activity-engine.md §4
 */
import { z } from "zod";
import { ActivityBaseSchema, LocalizedAssetRefSchema } from "./common";

// ── Counting item ───────────────────────────────────────────────────────────
const CountingItemSchema = z.object({
  id: z.string(),
  // What to count: visual objects on screen
  objects: z.object({
    image: LocalizedAssetRefSchema.optional(),
    shape: z.string().optional(),
    colour: z.string().optional(),
    count: z.number().int().min(1).max(20),
    arrangement: z.enum(["row", "grid", "scatter", "ten_frame"]).default("row"),
  }),
  // Answer options
  options: z.array(z.number().int()).min(2).max(6),
  correct_answer: z.number().int(),
  // For addition/subtraction
  operation: z.enum(["count", "add", "subtract"]).default("count"),
  operands: z.tuple([z.number().int(), z.number().int()]).optional(),
});

// ── Counting activity definition ────────────────────────────────────────────
export const CountingActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("counting"),
  items: z.array(CountingItemSchema).min(1).max(10),
  show_number_line: z.boolean().default(false),
  show_counter: z.boolean().default(true),
  tap_to_count: z.boolean().default(true),
});

export type CountingActivity = z.infer<typeof CountingActivitySchema>;
export type CountingItem = z.infer<typeof CountingItemSchema>;

// ── Scoring ─────────────────────────────────────────────────────────────────
export function scoreCounting(
  activity: CountingActivity,
  responses: Array<{ item_id: string; answer: number; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.items.length;
  let items_correct = 0;
  for (const r of responses) {
    const item = activity.items.find((i) => i.id === r.item_id);
    if (item && item.correct_answer === r.answer) {
      items_correct++;
    }
  }
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars =
    accuracy >= activity.scoring.star_bands.three ? 3 :
    accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}
