/**
 * Remote data layer — reads/writes Supabase when a session exists.
 * All functions degrade gracefully: no session, no connectivity, or
 * RLS denial returns null so callers can stay on the local cache.
 */
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Learner } from "@/lib/learner-store";
import type { AppJwtClaims } from "@/lib/types";

export interface RemoteContext {
  userId: string;
  claims: AppJwtClaims;
}

interface RemoteLearnerRow {
  id: string;
  school_id: string;
  preferred_name: string | null;
  first_name: string;
  avatar_key: string;
  ecd_level: "ECD_A" | "ECD_B";
}

interface RemoteAttemptRow {
  learner_id: string;
  activity_version_id: string;
  accuracy: number;
  stars: number;
  completed_at: string | null;
  status: string;
  activity_versions: { activity_id: string } | { activity_id: string }[] | null;
}

function decodeClaims(accessToken: string): AppJwtClaims {
  try {
    const payload = accessToken.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      app_role: json.app_role ?? null,
      school_id: json.school_id ?? null,
      class_ids: Array.isArray(json.class_ids) ? json.class_ids : null,
    };
  } catch {
    return { app_role: "TEACHER", school_id: null, class_ids: null };
  }
}

/**
 * Returns the signed-in user's id + app claims, or null when there is no
 * session (shared tablets may run unauthenticated — that's fine, they stay
 * on the local cache until a staff member signs in).
 */
export async function getRemoteContext(): Promise<RemoteContext | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;
    return {
      userId: session.user.id,
      claims: decodeClaims(session.access_token),
    };
  } catch {
    return null;
  }
}

/**
 * Pull the consented, active roster for this school via the learner_picker
 * view. Returns null when unreachable or denied so callers keep local data.
 */
export async function pullLearners(ctx?: RemoteContext | null): Promise<Learner[] | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    let query = supabase
      .from("learner_picker")
      .select("id, school_id, preferred_name, first_name, avatar_key, ecd_level");
    // Scope to the caller's school when claims are available
    if (ctx?.claims.school_id) {
      query = query.eq("school_id", ctx.claims.school_id);
    }
    const { data, error } = await query;
    if (error || !data) return null;
    const seen = new Set<string>();
    const learners: Learner[] = [];
    for (const row of data as RemoteLearnerRow[]) {
      if (seen.has(row.id)) continue; // view joins enrollments — one row per class
      seen.add(row.id);
      learners.push({
        id: row.id,
        preferred_name: row.preferred_name ?? row.first_name,
        first_name: row.first_name,
        avatar_key: row.avatar_key,
        ecd_level: row.ecd_level,
      });
    }
    return learners;
  } catch {
    return null;
  }
}

/**
 * Push a learner upsert through the sync_learner RPC (creates the
 * enrollment too). Returns true when applied.
 */
export async function pushLearner(learner: Learner): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.rpc("sync_learner", {
      p: {
        id: learner.id,
        first_name: learner.first_name,
        preferred_name: learner.preferred_name,
        avatar_key: learner.avatar_key,
        ecd_level: learner.ecd_level,
      },
    });
    return !error && (data as { status?: string } | null)?.status === "applied";
  } catch {
    return false;
  }
}

export async function pushLearnerRemove(learnerId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.rpc("remove_learner", {
      p_learner_id: learnerId,
    });
    return !error && (data as { status?: string } | null)?.status === "applied";
  } catch {
    return false;
  }
}

/**
 * Push one attempt through apply_attempt. Returns the server status:
 * applied | duplicate | rejected, or null when unreachable.
 */
export async function pushAttempt(
  payload: Record<string, unknown>,
): Promise<"applied" | "duplicate" | "rejected" | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.rpc("apply_attempt", { p: payload });
    if (error) return null;
    const status = (data as { status?: string } | null)?.status;
    return status === "applied" || status === "duplicate" || status === "rejected"
      ? status
      : null;
  } catch {
    return null;
  }
}

/**
 * Pull completed attempts for the roster so progress recorded on other
 * devices merges into this one. Requires a staff session (RLS denies
 * CLASSROOM_DEVICE reads on attempts).
 */
export async function pullAttempts(): Promise<
  | Array<{
      learnerId: string;
      activityId: string;
      accuracy: number;
      stars: number;
      completedAt: string;
    }>
  | null
> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("attempts")
      .select(
        "learner_id, activity_version_id, accuracy, stars, completed_at, status, activity_versions(activity_id)",
      )
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(500);
    if (error || !data) return null;
    const rows: Array<{
      learnerId: string;
      activityId: string;
      accuracy: number;
      stars: number;
      completedAt: string;
    }> = [];
    for (const row of data as RemoteAttemptRow[]) {
      const av = Array.isArray(row.activity_versions)
        ? row.activity_versions[0]
        : row.activity_versions;
      if (!av?.activity_id || !row.completed_at) continue;
      rows.push({
        learnerId: row.learner_id,
        activityId: av.activity_id,
        accuracy: row.accuracy,
        stars: row.stars,
        completedAt: row.completed_at,
      });
    }
    return rows;
  } catch {
    return null;
  }
}
