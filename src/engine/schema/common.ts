/**
 * Shared schema primitives used across all activity type schemas.
 * Per docs/activity-engine.md §4
 */
import { z } from "zod";

// ── Locale ──────────────────────────────────────────────────────────────────
export const LocaleSchema = z.enum(["en", "sn", "nd"]);
export type Locale = z.infer<typeof LocaleSchema>;

// ── Localised text ──────────────────────────────────────────────────────────
export const LocalizedTextSchema = z.object({
  en: z.string().min(1),
  sn: z.string().optional(),
  nd: z.string().optional(),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

// ── Localised asset reference ───────────────────────────────────────────────
export const LocalizedAssetRefSchema = z.object({
  en: z.string().min(1),
  sn: z.string().optional(),
  nd: z.string().optional(),
});
export type LocalizedAssetRef = z.infer<typeof LocalizedAssetRefSchema>;

// ── Asset reference ─────────────────────────────────────────────────────────
export const AssetRefSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["image", "audio", "svg"]),
  url: z.string(),
  alt: LocalizedTextSchema.optional(),
});
export type AssetRef = z.infer<typeof AssetRefSchema>;

// ── Stimulus (visual / audio / text element shown to child) ─────────────────
export const StimulusSchema = z.object({
  kind: z.enum(["image", "audio", "text", "shape", "colour"]),
  ref: z.string().optional(),
  value: z.string().optional(),
  alt: LocalizedTextSchema.optional(),
});
export type Stimulus = z.infer<typeof StimulusSchema>;

// ── Activity type enum (28 members) ─────────────────────────────────────────
export const ActivityTypeSchema = z.enum([
  "matching",
  "drag_and_drop",
  "tap_correct",
  "multiple_choice",
  "counting",
  "sorting",
  "shape_matching",
  "shape_sorting",
  "colour_identification",
  "colouring",
  "joining_dots",
  "tracing",
  "pattern_completion",
  "spot_the_difference",
  "puzzle",
  "phonics_recognition",
  "sound_recognition",
  "animal_sound_recognition",
  "story_interaction",
  "sequence_ordering",
  "classification",
  "memory_game",
  "pointing_target",
  "basic_addition",
  "basic_subtraction",
  "image_identification",
  "audio_to_image",
  "image_to_audio",
]);
export type ActivityType = z.infer<typeof ActivityTypeSchema>;

// ── Engine enum (12 modules) ────────────────────────────────────────────────
export const EngineSchema = z.enum([
  "choice",
  "match",
  "drag-sort",
  "counting",
  "trace",
  "join-dots",
  "colouring",
  "sequence",
  "memory",
  "puzzle",
  "spot-difference",
  "story",
]);
export type Engine = z.infer<typeof EngineSchema>;

// ── Learning area ───────────────────────────────────────────────────────────
export const LearningAreaKeySchema = z.enum([
  "english_language",
  "indigenous_language",
  "mathematics",
  "science_and_technology",
  "social_sciences",
  "physical_education_and_arts",
]);

// ── ECD level ───────────────────────────────────────────────────────────────
export const EcdLevelSchema = z.enum(["ECD_A", "ECD_B"]);

// ── Difficulty ──────────────────────────────────────────────────────────────
export const DifficultySchema = z.enum(["easy", "standard", "stretch"]);

// ── Validation status ───────────────────────────────────────────────────────
export const ValidationStatusSchema = z.enum([
  "verified",
  "validation_required",
]);

// ── Curriculum reference ────────────────────────────────────────────────────
export const CurriculumRefSchema = z.object({
  objective_id: z.string().uuid(),
  validation_status: ValidationStatusSchema,
});

// ── Feedback config ─────────────────────────────────────────────────────────
export const FeedbackConfigSchema = z.object({
  correct: z
    .array(
      z.object({
        text: LocalizedTextSchema,
        audio: LocalizedAssetRefSchema.optional(),
      }),
    )
    .min(1),
  encourage: z
    .array(
      z.object({
        text: LocalizedTextSchema,
        audio: LocalizedAssetRefSchema.optional(),
      }),
    )
    .min(1),
  celebration: z.enum(["stars", "confetti", "mascot_dance"]).default("stars"),
});
export type FeedbackConfig = z.infer<typeof FeedbackConfigSchema>;

export const DEFAULT_FEEDBACK: FeedbackConfig = {
  correct: [
    {
      text: { en: "You found it!" },
    },
    {
      text: { en: "Excellent!" },
    },
    {
      text: { en: "Great job!" },
    },
  ],
  encourage: [
    {
      text: { en: "Let's try again." },
    },
    {
      text: { en: "Great try!" },
    },
  ],
  celebration: "stars",
};

// ── Hint config ─────────────────────────────────────────────────────────────
export const HintConfigSchema = z.object({
  after_incorrect: z.number().int().min(1).default(2),
  highlight_after: z.number().int().min(1).default(3),
  show_demo: z.boolean().default(false),
});
export type HintConfig = z.infer<typeof HintConfigSchema>;

export const DEFAULT_HINTS = {
  after_incorrect: 2,
  highlight_after: 3,
  show_demo: false,
};

// ── Scoring config ──────────────────────────────────────────────────────────
export const ScoringConfigSchema = z.object({
  method: z.enum(["per_item", "coverage", "completion"]),
  star_bands: z
    .object({
      one: z.number().min(0).max(1).default(0),
      two: z.number().min(0).max(1).default(0.6),
      three: z.number().min(0).max(1).default(0.9),
    })
    .default({ one: 0, two: 0.6, three: 0.9 }),
  count_hints_as_partial: z.boolean().default(false),
  max_attempts_per_item: z.number().int().nullable().default(null),
});
export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;

// ── Instructions ────────────────────────────────────────────────────────────
export const InstructionsSchema = z.object({
  text: LocalizedTextSchema,
  audio: LocalizedAssetRefSchema,
  demo: z.enum(["none", "ghost_pointer", "auto_solve_first"]).default("none"),
});

// ── Activity base (shared fields for all activity types) ───────────────────
export const ActivityBaseSchema = z.object({
  id: z.string().uuid(),
  schema_version: z.literal(1),
  type: ActivityTypeSchema,
  engine: EngineSchema,
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  ecd_level: EcdLevelSchema,
  difficulty: DifficultySchema,
  learning_area: LearningAreaKeySchema,
  skills: z.array(z.string().uuid()).min(1),
  curriculum_refs: z.array(CurriculumRefSchema).default([]),
  instructions: InstructionsSchema,
  assets: z.array(AssetRefSchema).default([]),
  language: LocaleSchema.default("en"),
  estimated_duration_s: z.number().int().min(30).max(600),
  feedback: FeedbackConfigSchema.default(DEFAULT_FEEDBACK),
  scoring: ScoringConfigSchema,
  hints: HintConfigSchema.default(DEFAULT_HINTS),
  tags: z.array(z.string()).default([]),
});

// ── Item response (what the runner records per interaction) ─────────────────
export const ItemResponseSchema = z.object({
  item_id: z.string(),
  client_response_id: z.string().uuid(),
  value: z.unknown(),
  elapsed_ms: z.number().int().min(0),
  hint_level: z.number().int().min(0).max(2).default(0),
  pointer_samples: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
});
export type ItemResponse = z.infer<typeof ItemResponseSchema>;

// ── Item result (scoring output) ────────────────────────────────────────────
export const ItemResultSchema = z.object({
  item_id: z.string(),
  is_correct: z.boolean(),
  score: z.number().min(0).max(1),
  hint_level: z.number().int().min(0).max(2),
});
export type ItemResult = z.infer<typeof ItemResultSchema>;
