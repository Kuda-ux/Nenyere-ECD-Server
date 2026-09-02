/**
 * Offline module barrel export.
 * Per architecture.md §3.2: local data layer for offline-first operation.
 */
export { getDB, NenyereDB } from "./db";
export type {
  ActivityCacheRow,
  MediaCacheRow,
  ResponseRow,
  AttemptRow,
  SyncQueueRow,
  LearnerSessionRow,
  ContentPackVersionRow,
} from "./db";

export {
  enqueueAttempt,
  flushSyncQueue,
  getSyncQueueStatus,
  getUnsyncedAttemptCount,
  tryFlush,
  initSyncListeners,
} from "./sync";

export {
  fetchContentPack,
  syncContentPack,
  getCachedActivities,
  getCachedStories,
  getCachedActivityById,
} from "./content-pack";

export {
  setLearnerSession,
  getLearnerSession,
  clearLearnerSession,
} from "./learner-session";

export { useOfflineProgress } from "./use-offline-progress";
