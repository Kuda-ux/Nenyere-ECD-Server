/**
 * Unified schema registry — maps activity types to engines and validators.
 * Per docs/activity-engine.md §3 (mapping table)
 */
import { z } from "zod";
import { type ActivityType, type Engine } from "./common";
import { ChoiceActivitySchema } from "./choice";
import { MatchActivitySchema } from "./match";
import { DragSortActivitySchema } from "./drag-sort";
import { CountingActivitySchema } from "./counting";
import { TraceActivitySchema } from "./trace";
import {
  JoinDotsActivitySchema,
  ColouringActivitySchema,
  SequenceActivitySchema,
  MemoryActivitySchema,
  PuzzleActivitySchema,
  SpotDifferenceActivitySchema,
  StoryActivitySchema,
} from "./engines";

// ── Activity type → engine mapping ──────────────────────────────────────────
export const TYPE_TO_ENGINE: Record<ActivityType, Engine> = {
  matching: "match",
  drag_and_drop: "drag-sort",
  tap_correct: "choice",
  multiple_choice: "choice",
  counting: "counting",
  sorting: "drag-sort",
  shape_matching: "match",
  shape_sorting: "drag-sort",
  colour_identification: "match",
  colouring: "colouring",
  joining_dots: "join-dots",
  tracing: "trace",
  pattern_completion: "drag-sort",
  spot_the_difference: "spot-difference",
  puzzle: "puzzle",
  phonics_recognition: "choice",
  sound_recognition: "choice",
  animal_sound_recognition: "choice",
  story_interaction: "story",
  sequence_ordering: "sequence",
  classification: "drag-sort",
  memory_game: "memory",
  pointing_target: "choice",
  basic_addition: "counting",
  basic_subtraction: "counting",
  image_identification: "choice",
  audio_to_image: "choice",
  image_to_audio: "choice",
};

// ── Engine → schema map ─────────────────────────────────────────────────────
const ENGINE_SCHEMAS = {
  choice: ChoiceActivitySchema,
  match: MatchActivitySchema,
  "drag-sort": DragSortActivitySchema,
  counting: CountingActivitySchema,
  trace: TraceActivitySchema,
  "join-dots": JoinDotsActivitySchema,
  colouring: ColouringActivitySchema,
  sequence: SequenceActivitySchema,
  memory: MemoryActivitySchema,
  puzzle: PuzzleActivitySchema,
  "spot-difference": SpotDifferenceActivitySchema,
  story: StoryActivitySchema,
} as const;

// ── Discriminated union of all activity schemas ─────────────────────────────
export const AnyActivitySchema = z.discriminatedUnion("engine", [
  ChoiceActivitySchema,
  MatchActivitySchema,
  DragSortActivitySchema,
  CountingActivitySchema,
  TraceActivitySchema,
  JoinDotsActivitySchema,
  ColouringActivitySchema,
  SequenceActivitySchema,
  MemoryActivitySchema,
  PuzzleActivitySchema,
  SpotDifferenceActivitySchema,
  StoryActivitySchema,
]);

export type AnyActivity = z.infer<typeof AnyActivitySchema>;

// ── Validate an activity definition ─────────────────────────────────────────
export function validateActivity(def: unknown): AnyActivity {
  return AnyActivitySchema.parse(def);
}

export function safeValidateActivity(def: unknown): {
  success: boolean;
  data?: AnyActivity;
  error?: z.ZodError;
} {
  const result = AnyActivitySchema.safeParse(def);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// ── Get the engine for an activity type ─────────────────────────────────────
export function getEngineForType(type: ActivityType): Engine {
  return TYPE_TO_ENGINE[type];
}

// ── Get the schema for an engine ────────────────────────────────────────────
export function getSchemaForEngine(engine: Engine) {
  return ENGINE_SCHEMAS[engine];
}

// ── Content quality lints (per content-authoring.md §5) ─────────────────────
export function lintActivity(activity: AnyActivity): string[] {
  const errors: string[] = [];

  // Every stimulus must have alt text or audio
  if ("items" in activity) {
    for (const item of activity.items) {
      if ("stimulus" in item && item.stimulus?.image && !("alt" in item)) {
        errors.push(`Item ${item.id}: image stimulus missing alt text`);
      }
    }
  }

  // No negative feedback text allowed
  const feedbackTexts = [
    ...activity.feedback.correct.map((f) => f.text.en),
    ...activity.feedback.encourage.map((f) => f.text.en),
  ];
  const negativeWords = ["wrong", "bad", "stupid", "fail", "incorrect", "no"];
  for (const text of feedbackTexts) {
    const lower = text.toLowerCase();
    if (negativeWords.some((w) => lower.includes(w))) {
      errors.push(`Feedback contains negative language: "${text}"`);
    }
  }

  // Instructions must have audio
  if (!activity.instructions.audio) {
    errors.push("Instructions must include audio narration");
  }

  // At least one skill must be tagged
  if (activity.skills.length === 0) {
    errors.push("Activity must tag at least one skill");
  }

  return errors;
}
