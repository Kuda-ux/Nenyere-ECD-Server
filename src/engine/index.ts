/**
 * Engine barrel export.
 */
export { ActivityRunner } from "./components/activity-runner";
export { getEngineComponent } from "./components/registry";
export { ContentImage } from "./components/content-image";

// Schemas
export { AnyActivitySchema, validateActivity, safeValidateActivity, lintActivity, getEngineForType } from "./schema";
export type { AnyActivity } from "./schema";
export type { ActivityType, Engine, Locale, LocalizedText, LocalizedAssetRef, AssetRef, Stimulus, ItemResponse, ItemResult, FeedbackConfig, HintConfig, ScoringConfig } from "./schema/common";

// Engine-specific schemas
export { ChoiceActivitySchema, scoreChoice } from "./schema/choice";
export type { ChoiceActivity, ChoiceItem } from "./schema/choice";
export { MatchActivitySchema, scoreMatch } from "./schema/match";
export type { MatchActivity, MatchPair } from "./schema/match";
export { DragSortActivitySchema, scoreDragSort } from "./schema/drag-sort";
export type { DragSortActivity, SortSlot, SortItem } from "./schema/drag-sort";
export { CountingActivitySchema, scoreCounting } from "./schema/counting";
export type { CountingActivity, CountingItem } from "./schema/counting";
export { TraceActivitySchema, scoreTrace } from "./schema/trace";
export type { TraceActivity, TraceItem, TraceStroke } from "./schema/trace";
export {
  JoinDotsActivitySchema, ColouringActivitySchema, SequenceActivitySchema,
  MemoryActivitySchema, PuzzleActivitySchema, SpotDifferenceActivitySchema,
  StoryActivitySchema,
  scoreJoinDots, scoreColouring, scoreSequence, scoreMemory, scorePuzzle,
  scoreSpotDifference, scoreStory,
} from "./schema/engines";
export type {
  JoinDotsActivity, ColouringActivity, SequenceActivity,
  MemoryActivity, PuzzleActivity, SpotDifferenceActivity, StoryActivity,
} from "./schema/engines";

// Runner
export { useActivityRunner } from "./runner/use-activity-runner";
export { createRunnerState, runnerReducer } from "./runner/state-machine";
export type { RunnerState, RunnerEvent } from "./runner/state-machine";

// Audio
export { useAudio, getAudioEngine } from "./audio/audio-manager";
