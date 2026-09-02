/**
 * Learner session — manages the active learner in Child Mode.
 * Per architecture.md §7: "active learner" is held client-side (IndexedDB).
 */
import { getDB, type LearnerSessionRow } from "./db";
import type { EcdLevel } from "@/lib/types";

export async function setLearnerSession(session: {
  learner_id: string;
  preferred_name: string;
  avatar_key: string;
  ecd_level: EcdLevel;
}): Promise<void> {
  const db = getDB();
  const row: LearnerSessionRow = {
    id: "current",
    ...session,
    set_at: Date.now(),
  };
  await db.learnerSession.put(row);
}

export async function getLearnerSession(): Promise<LearnerSessionRow | null> {
  const db = getDB();
  const row = await db.learnerSession.get("current");
  return row ?? null;
}

export async function clearLearnerSession(): Promise<void> {
  const db = getDB();
  await db.learnerSession.delete("current");
}
