/**
 * Dexie database — local IndexedDB store for offline-first operation.
 * Per architecture.md §3.2: content cache, attempts, responses, sync_queue, learner session.
 *
 * Tables:
 * - activities: cached published activity definitions (keyed by id)
 * - stories: cached published story definitions
 * - mediaCache: media manifest + blob URLs for offline assets
 * - attempts: completed activity attempts awaiting sync
 * - responses: individual item responses (written synchronously during play)
 * - syncQueue: ordered queue of operations to push when online
 * - learnerSession: current active learner in Child Mode (single row)
 * - contentPackVersion: tracks which content pack version is cached
 */
import Dexie, { type Table } from "dexie";
import type { AnyActivity } from "@/engine/schema";
import type { EcdLevel } from "@/lib/types";

// ── Row types ───────────────────────────────────────────────────────────

export type ActivityCacheRow = {
  id: string;
  activity: AnyActivity;
  ecd_level: EcdLevel;
  learning_area: string;
  cached_at: number;
};

export type MediaCacheRow = {
  url: string;
  blob: Blob | null;
  kind: "image" | "audio" | "svg";
  cached_at: number;
};

export type ResponseRow = {
  id: string;
  attempt_id: string;
  item_id: string;
  answer: unknown;
  hint_level: number;
  is_correct: boolean | null;
  created_at: number;
};

export type AttemptRow = {
  client_attempt_id: string;
  learner_id: string;
  activity_id: string;
  activity_version_id: string | null;
  assignment_id: string | null;
  device_id: string;
  actor_user_id: string;
  started_at: number;
  completed_at: number | null;
  status: "completed" | "abandoned";
  accuracy: number;
  stars: number;
  duration_ms: number;
  hints_used: number;
  items_total: number;
  items_correct: number;
  client_meta: Record<string, unknown>;
  synced: 0 | 1;
  created_at: number;
};

export type SyncQueueRow = {
  id?: number;
  client_attempt_id: string;
  payload: Record<string, unknown>;
  retries: number;
  last_error: string | null;
  next_retry_at: number;
  status: "pending" | "in_flight" | "dead_letter";
  created_at: number;
};

export type LearnerSessionRow = {
  id: "current";
  learner_id: string;
  preferred_name: string;
  avatar_key: string;
  ecd_level: EcdLevel;
  set_at: number;
};

export type ContentPackVersionRow = {
  id: "current";
  ecd_level: EcdLevel;
  version: string;
  fetched_at: number;
};

// ── Database class ──────────────────────────────────────────────────────

export class NenyereDB extends Dexie {
  activities!: Table<ActivityCacheRow, string>;
  stories!: Table<ActivityCacheRow, string>;
  mediaCache!: Table<MediaCacheRow, string>;
  attempts!: Table<AttemptRow, string>;
  responses!: Table<ResponseRow, string>;
  syncQueue!: Table<SyncQueueRow, number>;
  learnerSession!: Table<LearnerSessionRow, string>;
  contentPackVersion!: Table<ContentPackVersionRow, string>;

  constructor() {
    super("nenyere-ecd");

    this.version(1).stores({
      activities: "id, ecd_level, learning_area, cached_at",
      stories: "id, ecd_level, cached_at",
      mediaCache: "url, kind, cached_at",
      attempts: "client_attempt_id, learner_id, activity_id, synced, created_at",
      responses: "id, attempt_id, created_at",
      syncQueue: "++id, client_attempt_id, status, next_retry_at, created_at",
      learnerSession: "id",
      contentPackVersion: "id",
    });
  }
}

// ── Singleton (SSR-safe) ────────────────────────────────────────────────

let _db: NenyereDB | null = null;

export function getDB(): NenyereDB {
  if (typeof window === "undefined") {
    throw new Error("Dexie database is only available in the browser");
  }
  if (!_db) {
    _db = new NenyereDB();
  }
  return _db;
}
