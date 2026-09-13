/**
 * Sync engine — coordinates the offline-first data flow:
 *   writes go to localStorage immediately + the outbox;
 *   when a session + connectivity exist the outbox flushes,
 *   then remote state is pulled and merged into the local cache.
 *
 * Components subscribe via the "nenyere-sync" window event, which fires
 * whenever a pull merges fresh remote data into localStorage.
 */
import {
  getRemoteContext,
  pullLearners,
  pullAttempts,
  pushLearner,
  pushLearnerRemove,
  pushAttempt,
} from "./remote";
import { getOutbox, removeOp, enqueueOp, type OutboxOp } from "./outbox";
import { getLearners, type Learner } from "@/lib/learner-store";
import { getActivityById } from "@/lib/activity-catalog";

export const SYNC_EVENT = "nenyere-sync";
const LEARNERS_KEY = "nenyere_learners";
const TRACKER_KEY = "nenyere_dev_tracker";
const REMOTE_LEARNER_IDS_KEY = "nenyere_remote_learner_ids";
const DEVICE_UUID_KEY = "nenyere_device_uuid";

let syncing = false;
let subscribers = 0;
let stopLoop: (() => void) | null = null;

function emitSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

/** Stable device id used as attempts.device_id. */
export function getDeviceUuid(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_UUID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_UUID_KEY, id);
  }
  return id;
}

function saveLearners(learners: Learner[]) {
  localStorage.setItem(LEARNERS_KEY, JSON.stringify(learners));
}

function getRemoteIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(REMOTE_LEARNER_IDS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

/**
 * Merge a remote roster into the local cache:
 *  - remote rows upsert over local rows (server wins on fields)
 *  - local learners never seen remotely are kept (they may be queued to push)
 *  - learners the server used to return but no longer does are removed
 */
function mergeRemoteLearners(remote: Learner[]): boolean {
  const local = getLearners();
  const previousRemoteIds = getRemoteIds();
  const remoteIds = new Set(remote.map((l) => l.id));
  const byId = new Map(local.map((l) => [l.id, l]));

  const merged: Learner[] = remote.map((r) => ({ ...byId.get(r.id), ...r }));
  for (const l of local) {
    if (!remoteIds.has(l.id) && !previousRemoteIds.has(l.id)) {
      merged.push(l); // local-only learner, not yet pushed
    }
  }

  localStorage.setItem(REMOTE_LEARNER_IDS_KEY, JSON.stringify([...remoteIds]));
  const changed = JSON.stringify(merged) !== JSON.stringify(local);
  if (changed) saveLearners(merged);
  return changed;
}

/**
 * Merge remote attempts into the local dev-tracker profiles so progress
 * made on other devices shows up here.
 */
function mergeRemoteAttempts(
  rows: Array<{
    learnerId: string;
    activityId: string;
    accuracy: number;
    stars: number;
    completedAt: string;
  }>,
): boolean {
  if (rows.length === 0) return false;
  let profiles: Record<
    string,
    {
      learnerId: string;
      activities: Record<
        string,
        { activityId: string; completedAt: string; stars: number; attempts: number; bestScore: number }
      >;
      skills: Record<string, { skillId: string; timesPracticed: number; lastPracticedAt: string }>;
      totalStars: number;
      totalActivitiesCompleted: number;
      badges: string[];
      createdAt: string;
    }
  >;
  try {
    profiles = JSON.parse(localStorage.getItem(TRACKER_KEY) ?? "{}") ?? {};
  } catch {
    profiles = {};
  }

  // Group attempts per learner/activity
  const grouped = new Map<string, Map<string, typeof rows>>();
  for (const r of rows) {
    if (!grouped.has(r.learnerId)) grouped.set(r.learnerId, new Map());
    const acts = grouped.get(r.learnerId)!;
    if (!acts.has(r.activityId)) acts.set(r.activityId, []);
    acts.get(r.activityId)!.push(r);
  }

  let changed = false;
  for (const [learnerId, acts] of grouped) {
    const profile = (profiles[learnerId] ??= {
      learnerId,
      activities: {},
      skills: {},
      totalStars: 0,
      totalActivitiesCompleted: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    });
    for (const [activityId, attempts] of acts) {
      const remoteCount = attempts.length;
      const remoteBest = Math.max(...attempts.map((a) => a.accuracy));
      const remoteStars = Math.max(...attempts.map((a) => a.stars));
      const remoteLatest = attempts
        .map((a) => a.completedAt)
        .sort()
        .at(-1)!;
      const existing = profile.activities[activityId];
      if (existing && existing.attempts >= remoteCount && existing.bestScore >= remoteBest) {
        continue;
      }
      profile.activities[activityId] = {
        activityId,
        completedAt: existing && existing.completedAt > remoteLatest ? existing.completedAt : remoteLatest,
        stars: Math.max(existing?.stars ?? 0, remoteStars),
        attempts: Math.max(existing?.attempts ?? 0, remoteCount),
        bestScore: Math.max(existing?.bestScore ?? 0, remoteBest),
      };
      // Derive skill practice from the catalog definition
      const activity = getActivityById(activityId);
      for (const skillId of activity?.skills ?? []) {
        const skill = (profile.skills[skillId] ??= {
          skillId,
          timesPracticed: 0,
          lastPracticedAt: remoteLatest,
        });
        if (skill.timesPracticed < remoteCount) {
          skill.timesPracticed = remoteCount;
          skill.lastPracticedAt = remoteLatest;
        }
      }
      changed = true;
    }
    if (changed) {
      // Recompute rollups from the merged activity map
      const acts2 = Object.values(profile.activities);
      profile.totalActivitiesCompleted = acts2.length;
      profile.totalStars = acts2.reduce((s, a) => s + a.stars, 0);
    }
  }

  if (changed) {
    localStorage.setItem(TRACKER_KEY, JSON.stringify(profiles));
  }
  return changed;
}

async function flushOutbox(ctx: { userId: string; claims: { school_id: string | null } }): Promise<number> {
  let flushed = 0;
  for (const op of getOutbox()) {
    let done = false;
    if (op.kind === "learner-upsert") {
      done = await pushLearner(op.learner as Learner);
    } else if (op.kind === "learner-remove") {
      done = await pushLearnerRemove(op.learnerId);
    } else if (op.kind === "attempt") {
      const result = await pushAttempt(op.payload);
      // applied + duplicate are done; rejected stays queued (e.g. the
      // learner may not have synced to the server yet — retry next cycle)
      done = result === "applied" || result === "duplicate";
    }
    if (done) {
      removeOp(op.id);
      flushed++;
    }
  }
  return flushed;
}

let lastSync = 0;
const MIN_SYNC_INTERVAL_MS = 5_000;

/**
 * One sync cycle: flush pending writes, then pull remote state.
 * Safe to call often — concurrent and too-frequent calls are collapsed.
 */
export async function syncNow(): Promise<void> {
  if (typeof window === "undefined" || syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  if (Date.now() - lastSync < MIN_SYNC_INTERVAL_MS) return;
  syncing = true;
  lastSync = Date.now();
  try {
    const ctx = await getRemoteContext();
    if (!ctx) return; // no session — stay local-only
    await flushOutbox(ctx);

    let changed = false;
    const remoteLearners = await pullLearners(ctx);
    if (remoteLearners) changed = mergeRemoteLearners(remoteLearners) || changed;

    const remoteAttempts = await pullAttempts();
    if (remoteAttempts) changed = mergeRemoteAttempts(remoteAttempts) || changed;

    if (changed) emitSync();
  } catch {
    // Offline / invalid key / RLS denial — local cache remains the truth.
  } finally {
    syncing = false;
  }
}

/**
 * Queue an activity completion for upload. Called from dev-tracker.
 */
export function enqueueAttemptSync(input: {
  learnerId: string;
  activityId: string;
  accuracy: number;
  stars: number;
  itemsTotal: number;
  itemsCorrect: number;
  startedAt: number;
  completedAt: number;
  responses?: Array<{
    item_id: string;
    client_response_id: string;
    value: unknown;
    is_correct: boolean;
    elapsed_ms: number;
    hint_level: number;
  }>;
}) {
  const activity = getActivityById(input.activityId);
  const payload = {
    client_attempt_id: crypto.randomUUID(),
    school_id: null, // server derives from the caller's claims when null
    learner_id: input.learnerId,
    activity_id: input.activityId,
    activity_version_id: input.activityId, // seed convention: version id == activity id
    device_id: getDeviceUuid(),
    actor_user_id: null, // filled server-side from auth.uid()
    started_at: new Date(input.startedAt).toISOString(),
    completed_at: new Date(input.completedAt).toISOString(),
    status: "completed",
    accuracy: input.accuracy,
    stars: input.stars,
    duration_ms: Math.max(0, input.completedAt - input.startedAt),
    hints_used: 0,
    items_total: input.itemsTotal,
    items_correct: input.itemsCorrect,
    client_meta: { source: "kids-app" },
    responses: (input.responses ?? []).map((r, i) => ({
      item_id: r.item_id,
      client_response_id: r.client_response_id,
      value: r.value,
      is_correct: r.is_correct,
      elapsed_ms: r.elapsed_ms,
      hint_level: r.hint_level,
      seq: i,
    })),
    activity: activity
      ? {
          type: activity.type,
          schema_version: activity.schema_version,
          ecd_level: activity.ecd_level,
          learning_area: activity.learning_area,
          title: activity.title,
        }
      : undefined,
    activity_skills: (activity?.skills ?? []).map((id) => ({ id })),
  };
  const op: OutboxOp = {
    kind: "attempt",
    id: payload.client_attempt_id,
    queuedAt: new Date().toISOString(),
    payload,
  };
  enqueueOp(op);
}

/**
 * Start background syncing: on load, when the tab regains focus or the
 * device comes back online, plus a slow interval while the app is open.
 */
export function startSyncLoop(): () => void {
  subscribers++;
  if (!stopLoop) {
    void syncNow();
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncNow();
    };
    const onOnline = () => void syncNow();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    const interval = setInterval(() => void syncNow(), 60_000);
    stopLoop = () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
    };
  }

  return () => {
    subscribers--;
    if (subscribers <= 0) {
      subscribers = 0;
      stopLoop?.();
      stopLoop = null;
    }
  };
}
