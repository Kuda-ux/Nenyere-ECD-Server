/**
 * Choice engine schema.
 * Covers: tap_correct, multiple_choice, phonics_recognition,
 *         sound_recognition, animal_sound_recognition, image_identification,
 *         audio_to_image, image_to_audio, pointing_target
 * Per docs/activity-engine.md §4
 */
import { z } from "zod";
import { ActivityBaseSchema, LocalizedTextSchema, LocalizedAssetRefSchema } from "./common";

// ── Choice item ─────────────────────────────────────────────────────────────
const ChoiceItemSchema = z.object({
  id: z.string(),
  stimulus: z.object({
    image: LocalizedAssetRefSchema.optional(),
    audio: LocalizedAssetRefSchema.optional(),
    text: LocalizedTextSchema.optional(),
    shape: z.enum(["circle", "square", "triangle", "star", "heart", "diamond"]).optional(),
    colour: z.string().optional(),
  }),
  is_correct: z.boolean(),
  alt: LocalizedTextSchema.optional(),
});

// ── Choice activity definition ──────────────────────────────────────────────
export const ChoiceActivitySchema = ActivityBaseSchema.extend({
  engine: z.literal("choice"),
  items: z.array(ChoiceItemSchema).min(2).max(6),
  prompt: z.object({
    text: LocalizedTextSchema,
    audio: LocalizedAssetRefSchema,
    image: LocalizedAssetRefSchema.optional(),
  }),
  layout: z.enum(["grid", "row", "scatter"]).default("grid"),
  show_correct_after_attempts: z.number().int().min(1).max(5).default(3),
});

export type ChoiceActivity = z.infer<typeof ChoiceActivitySchema>;
export type ChoiceItem = z.infer<typeof ChoiceItemSchema>;

// ── Scoring function for choice engine ──────────────────────────────────────
export function scoreChoice(
  activity: ChoiceActivity,
  responses: Array<{
    item_id: string;
    is_correct: boolean;
    hint_level: number;
  }>,
): { accuracy: number; stars: number; items_total: number; items_correct: number } {
  const items_total = activity.items.length;
  const items_correct = responses.filter((r) => r.is_correct).length;
  const accuracy = items_total > 0 ? items_correct / items_total : 0;
  const stars =
    accuracy >= activity.scoring.star_bands.three ? 3 :
    accuracy >= activity.scoring.star_bands.two ? 2 : 1;
  return { accuracy, stars, items_total, items_correct };
}
