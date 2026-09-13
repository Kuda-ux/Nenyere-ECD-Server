/**
 * Sync outbox — durable queue of pending writes in localStorage.
 * Roster and attempt writes are appended here first so they survive
 * load-shedding and offline periods, then flushed when a session
 * and connectivity are available.
 */

const OUTBOX_KEY = "nenyere_sync_outbox";

export type OutboxOp =
  | {
      kind: "learner-upsert";
      id: string;
      queuedAt: string;
      learner: {
        id: string;
        preferred_name: string;
        first_name: string;
        avatar_key: string;
        ecd_level: string;
      };
    }
  | { kind: "learner-remove"; id: string; queuedAt: string; learnerId: string }
  | {
      kind: "attempt";
      id: string;
      queuedAt: string;
      payload: Record<string, unknown>;
    };

function load(): OutboxOp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(ops: OutboxOp[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(ops));
}

export function enqueueOp(op: OutboxOp) {
  const ops = load();
  ops.push(op);
  save(ops);
}

export function getOutbox(): OutboxOp[] {
  return load();
}

export function removeOp(id: string) {
  save(load().filter((o) => o.id !== id));
}

export function clearOutbox() {
  save([]);
}
