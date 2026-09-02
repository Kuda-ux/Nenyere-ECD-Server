/**
 * Drag-sort engine schema.
 * Covers: sorting, sequence_ordering, pattern_completion
 * Per docs/activity-engine.md §4
 */
import { z } from "zod";
import { ActivityBaseSchema, LocalizedTextSchema, LocalizedAssetRefSchema } from "./common";

// ── Sort slot ───────────────────────────────────────────────────────────────
const SortSlotSchema = z.object({
  id: z.string(),
  label: LocalizedTextSchema.optional(),
  image: LocalizedAssetRefSchema.optional(),
  accepts_item_ids: z.array(z.string()).min(1),
});

// ── Sort item ───────────────────────────────────────────────────────────────
const SortItemSchema = z.object({
  id: z.string(),
  image: LocalizedAssetRefSchema.optional(),
  text: LocalizedTextSchema.optional(),
  shape: z.enum(["circle", "square", "triangle", "star", "heart", "diamond"]).optional(),
  colour: z.string().optional(),
  correct_slot_id: z.string(),
});

// ── Drag-sort activity definition ───────────────────────────────────────────
export const DragSortActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("drag-sort"),
  slots: z.array(SortSlotSchema).min(2).max(5),
  items: z.array(SortItemSchema).min(2).max(10),
  layout: z.enum(["bins", "sequence"]).default("bins"),
  allow_rearrange: z.boolean().default(true),
});

export type DragSortActivity = z.infer<typeof DragSortActivitySchema>;
export type SortSlot = z.infer<typeof SortSlotSchema>;
export type SortItem = z.infer<typeof SortItemSchema>;

// ── Scoring ─────────────────────────────────────────────────────────────────
export function scoreDragSort(
  activity: DragSortActivity,
  responses: Array<{ item_id: string; placed_slot_id: string; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.items.length;
  let items_correct = 0;
  for (const r of responses) {
    const item = activity.items.find((i) => i.id === r.item_id);
    if (item && item.correct_slot_id === r.placed_slot_id) {
      items_correct++;
    }
  }
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars =
    accuracy >= activity.scoring.star_bands.three ? 3 :
    accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}
