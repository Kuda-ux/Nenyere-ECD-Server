/**
 * useOfflineProgress — React hook that persists activity attempts and
 * responses to IndexedDB on completion, then queues for sync.
 *
 * Per architecture.md §3.2: "Every learner response is written to IndexedDB
 * synchronously with the interaction; an attempts record is finalised on
 * activity completion and pushed onto sync_queue."
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { enqueueAttempt, tryFlush, getSyncQueueStatus, initSyncListeners } from "./sync";
import { setLearnerSession, getLearnerSession, clearLearnerSession } from "./learner-session";
import type { AnyActivity } from "@/engine/schema";

type AttemptSummary = {
  accuracy: number;
  stars: number;
  items_total: number;
  items_correct: number;
  duration_ms: number;
  hints_used: number;
};

type OfflineProgressState = {
  isOnline: boolean;
  pendingSync: number;
  lastSyncedAt: number | null;
};

export function useOfflineProgress(learnerId: string | null) {
  const [state, setState] = useState<OfflineProgressState>({
    isOnline: true,
    pendingSync: 0,
    lastSyncedAt: null,
  });

  // Init sync listeners + online/offline tracking
  useEffect(() => {
    const cleanup = initSyncListeners();

    const updateOnlineStatus = () => {
      setState((s) => ({ ...s, isOnline: navigator.onLine }));
      if (navigator.onLine) void tryFlush();
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    setState((s) => ({ ...s, isOnline: navigator.onLine }));

    // Poll sync queue status
    const pollInterval = setInterval(async () => {
      const status = await getSyncQueueStatus();
      setState((s) => ({ ...s, pendingSync: status.pending }));
    }, 5000);

    return () => {
      cleanup();
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(pollInterval);
    };
  }, []);

  // Persist learner session
  useEffect(() => {
    if (!learnerId) return;
    void (async () => {
      const existing = await getLearnerSession();
      if (!existing || existing.learner_id !== learnerId) {
        // In production, fetch learner details from Supabase
        // For now, use placeholder data
        await setLearnerSession({
          learner_id: learnerId,
          preferred_name: "Learner",
          avatar_key: "star",
          ecd_level: "ECD_A" as const,
        });
      }
    })();
  }, [learnerId]);

  const recordAttempt = useCallback(
    async (
      activity: AnyActivity,
      summary: AttemptSummary,
      responses: Array<{
        item_id: string;
        answer: unknown;
        hint_level: number;
        is_correct: boolean | null;
      }>,
    ) => {
      if (!learnerId) return;

      const now = Date.now();
      const clientAttemptId = crypto.randomUUID();

      await enqueueAttempt(
        {
          client_attempt_id: clientAttemptId,
          learner_id: learnerId,
          activity_id: activity.id,
          activity_version_id: null,
          assignment_id: null,
          device_id: "device-1",
          actor_user_id: learnerId,
          started_at: now - summary.duration_ms,
          completed_at: now,
          status: "completed",
          accuracy: summary.accuracy,
          stars: summary.stars,
          duration_ms: summary.duration_ms,
          hints_used: summary.hints_used,
          items_total: summary.items_total,
          items_correct: summary.items_correct,
          client_meta: {},
        },
        responses.map((r) => ({
          ...r,
          attempt_id: clientAttemptId,
        })),
      );

      // Try to flush immediately if online
      void tryFlush();
    },
    [learnerId],
  );

  const exitLearner = useCallback(async () => {
    await clearLearnerSession();
  }, []);

  return {
    ...state,
    recordAttempt,
    exitLearner,
  };
}
