/**
 * Match engine schema.
 * Covers: matching, shape_matching, colour_identification, classification
 * Per docs/activity-engine.md §4
 */
import { z } from "zod";
import { ActivityBaseSchema, LocalizedTextSchema, LocalizedAssetRefSchema } from "./common";

// ── Match pair ──────────────────────────────────────────────────────────────
const MatchPairSchema = z.object({
  id: z.string(),
  left: z.object({
    image: LocalizedAssetRefSchema.optional(),
    text: LocalizedTextSchema.optional(),
    shape: z.enum(["circle", "square", "triangle", "star", "heart", "diamond"]).optional(),
    colour: z.string().optional(),
    audio: LocalizedAssetRefSchema.optional(),
  }),
  right: z.object({
    image: LocalizedAssetRefSchema.optional(),
    text: LocalizedTextSchema.optional(),
    shape: z.enum(["circle", "square", "triangle", "star", "heart", "diamond"]).optional(),
    colour: z.string().optional(),
    audio: LocalizedAssetRefSchema.optional(),
  }),
});

// ── Match activity definition ───────────────────────────────────────────────
export const MatchActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("match"),
  pairs: z.array(MatchPairSchema).min(2).max(6),
  layout: z.enum(["two_column", "connect_lines"]).default("two_column"),
  shuffle_right: z.boolean().default(true),
});

export type MatchActivity = z.infer<typeof MatchActivitySchema>;
export type MatchPair = z.infer<typeof MatchPairSchema>;

// ── Scoring ─────────────────────────────────────────────────────────────────
export function scoreMatch(
  activity: MatchActivity,
  responses: Array<{ pair_id: string; is_correct: boolean; hint_level: number }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.pairs.length;
  const items_correct = responses.filter((r) => r.is_correct).length;
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars =
    accuracy >= activity.scoring.star_bands.three ? 3 :
    accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}
