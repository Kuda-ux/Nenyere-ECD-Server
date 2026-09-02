/**
 * Sync queue manager — enqueues attempts, flushes to /api/sync with
 * exponential backoff. Per architecture.md §3.3.
 *
 * Flow:
 * 1. Activity completion → enqueueAttempt() writes attempt + responses to Dexie
 * 2. flushSyncQueue() reads pending items, POSTs batch to /api/sync
 * 3. On success → mark synced, remove from queue
 * 4. On failure → increment retries, set next_retry_at with backoff
 * 5. Dead-letter after 5 retries
 */
import { getDB, type AttemptRow, type ResponseRow } from "./db";

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 2000;

function backoffDelay(retries: number): number {
  return Math.min(BASE_BACKOFF_MS * Math.pow(2, retries), 60000);
}

export async function enqueueAttempt(
  attempt: Omit<AttemptRow, "synced" | "created_at">,
  responses: Omit<ResponseRow, "id" | "created_at">[],
): Promise<void> {
  const db = getDB();
  const now = Date.now();

  await db.transaction("rw", db.attempts, db.responses, db.syncQueue, async () => {
    // Write attempt
    await db.attempts.put({
      ...attempt,
      synced: 0,
      created_at: now,
    });

    // Write responses
    for (const r of responses) {
      await db.responses.put({
        ...r,
        id: crypto.randomUUID(),
        created_at: now,
      });
    }

    // Enqueue sync item
    await db.syncQueue.add({
      client_attempt_id: attempt.client_attempt_id,
      payload: {
        attempt: { ...attempt, synced: 0, created_at: now },
        responses: responses.map((r) => ({
          ...r,
          id: crypto.randomUUID(),
          created_at: now,
        })),
      },
      retries: 0,
      last_error: null,
      next_retry_at: now,
      status: "pending",
      created_at: now,
    });
  });
}

type SyncResult = {
  client_attempt_id: string;
  status: "applied" | "duplicate" | "rejected";
  reason?: string;
};

export async function flushSyncQueue(): Promise<{
  flushed: number;
  failed: number;
  deadLettered: number;
}> {
  const db = getDB();
  const now = Date.now();

  // Get pending items ready for retry
  const pending = await db.syncQueue
    .where("status")
    .equals("pending")
    .and((item) => item.next_retry_at <= now)
    .toArray();

  if (pending.length === 0) {
    return { flushed: 0, failed: 0, deadLettered: 0 };
  }

  // Mark as in_flight
  await db.syncQueue.bulkPut(
    pending.map((p) => ({ ...p, status: "in_flight" as const })),
  );

  // Build batch payload
  const batch = pending.map((p) => p.payload);

  try {
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch }),
    });

    if (!res.ok) {
      throw new Error(`Sync HTTP ${res.status}`);
    }

    const data: { results: SyncResult[] } = await res.json();
    let flushed = 0;
    let failed = 0;

    for (const result of data.results) {
      const queueItem = pending.find((p) => p.client_attempt_id === result.client_attempt_id);
      if (!queueItem) continue;

      if (result.status === "applied" || result.status === "duplicate") {
        // Mark attempt as synced
        await db.attempts.update(result.client_attempt_id, { synced: 1 });
        // Remove from queue
        await db.syncQueue.delete(queueItem.id!);
        flushed++;
      } else {
        // Rejected — dead-letter
        await db.syncQueue.update(queueItem.id!, {
          status: "dead_letter",
          last_error: result.reason ?? "rejected",
        });
        failed++;
      }
    }

    return { flushed, failed, deadLettered: 0 };
  } catch (err) {
    // Network error — backoff and retry
    let deadLettered = 0;
    for (const item of pending) {
      const newRetries = item.retries + 1;
      if (newRetries >= MAX_RETRIES) {
        await db.syncQueue.update(item.id!, {
          status: "dead_letter",
          retries: newRetries,
          last_error: err instanceof Error ? err.message : String(err),
        });
        deadLettered++;
      } else {
        await db.syncQueue.update(item.id!, {
          status: "pending",
          retries: newRetries,
          last_error: err instanceof Error ? err.message : String(err),
          next_retry_at: Date.now() + backoffDelay(newRetries),
        });
      }
    }

    return { flushed: 0, failed: pending.length - deadLettered, deadLettered };
  }
}

export async function getSyncQueueStatus(): Promise<{
  pending: number;
  inFlight: number;
  deadLetter: number;
}> {
  const db = getDB();
  const [pending, inFlight, deadLetter] = await Promise.all([
    db.syncQueue.where("status").equals("pending").count(),
    db.syncQueue.where("status").equals("in_flight").count(),
    db.syncQueue.where("status").equals("dead_letter").count(),
  ]);
  return { pending, inFlight, deadLetter };
}

export async function getUnsyncedAttemptCount(): Promise<number> {
  const db = getDB();
  return db.attempts.where("synced").equals(0).count();
}

// ── Event-driven flush triggers ─────────────────────────────────────────

let flushInProgress = false;

export async function tryFlush(): Promise<void> {
  if (flushInProgress) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  flushInProgress = true;
  try {
    await flushSyncQueue();
  } finally {
    flushInProgress = false;
  }
}

export function initSyncListeners(): () => void {
  if (typeof window === "undefined") return () => {};

  const onOnline = () => void tryFlush();
  window.addEventListener("online", onOnline);

  // Periodic flush every 30 seconds when online
  const interval = setInterval(() => void tryFlush(), 30000);

  return () => {
    window.removeEventListener("online", onOnline);
    clearInterval(interval);
  };
}
