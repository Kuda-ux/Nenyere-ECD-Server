/**
 * POST /api/sync — batch attempt upload from client sync queue.
 * Per architecture.md §3.3: validate batch → derive actor + school from the
 * session → for each attempt call apply_attempt (idempotent by
 * client_attempt_id, auto-provisions seed content via migration 0008).
 *
 * The browser client normally calls the apply_attempt RPC directly; this
 * route exists for server-mediated sync and as a fallback.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ResponseSchema = z.object({
  item_id: z.string(),
  client_response_id: z.string().uuid(),
  value: z.unknown(),
  is_correct: z.boolean().nullable(),
  elapsed_ms: z.number().int().min(0),
  hint_level: z.number().int().min(0),
  seq: z.number().int(),
});

const AttemptSchema = z.object({
  client_attempt_id: z.string().uuid(),
  school_id: z.string().uuid().nullable().optional(),
  learner_id: z.string().uuid(),
  activity_id: z.string().uuid().optional(),
  activity_version_id: z.string().uuid().nullable().optional(),
  assignment_id: z.string().uuid().nullable().optional(),
  device_id: z.string().uuid(),
  actor_user_id: z.string().uuid().nullable().optional(),
  started_at: z.string(),
  completed_at: z.string().nullable().optional(),
  status: z.enum(["completed", "abandoned"]),
  accuracy: z.number().min(0).max(1),
  stars: z.number().int().min(0).max(3),
  duration_ms: z.number().int().min(0),
  hints_used: z.number().int().min(0),
  items_total: z.number().int().min(0),
  items_correct: z.number().int().min(0),
  client_meta: z.record(z.unknown()).default({}),
  responses: z.array(ResponseSchema).default([]),
  activity: z.record(z.unknown()).optional(),
  activity_skills: z.array(z.record(z.unknown())).optional(),
});

const SyncRequestSchema = z.object({
  batch: z.array(z.object({ attempt: AttemptSchema })).min(1).max(50),
});

type SyncResult = {
  client_attempt_id: string;
  status: "applied" | "duplicate" | "rejected" | "failed";
  reason?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SyncRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid batch payload", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const results: SyncResult[] = [];
    let applied = 0;
    let duplicates = 0;
    let rejected = 0;

    for (const item of parsed.data.batch) {
      const { attempt } = item;
      const { responses, ...attemptFields } = attempt;
      const { data, error } = await supabase.rpc("apply_attempt", {
        p: {
          ...attemptFields,
          school_id: attempt.school_id ?? null,
          actor_user_id: attempt.actor_user_id ?? user.id,
          responses,
        },
      });

      if (error) {
        results.push({
          client_attempt_id: attempt.client_attempt_id,
          status: "failed",
          reason: error.message,
        });
        rejected++;
        continue;
      }

      const status = (data as { status?: string; code?: string } | null)?.status;
      const code = (data as { code?: string } | null)?.code;
      if (status === "applied") applied++;
      else if (status === "duplicate") duplicates++;
      else rejected++;
      results.push({
        client_attempt_id: attempt.client_attempt_id,
        status: status === "applied" || status === "duplicate" ? status : "rejected",
        reason: code,
      });
    }

    // Record the batch for auditability (best-effort — needs school scope)
    const { data: membership } = await supabase
      .from("memberships")
      .select("school_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .single();

    if (membership?.school_id) {
      await supabase.from("sync_batches").insert({
        school_id: membership.school_id,
        actor_user_id: user.id,
        device_id: parsed.data.batch[0].attempt.device_id,
        item_count: parsed.data.batch.length,
        applied,
        duplicates,
        rejected,
      });
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: "Sync failed", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/sync",
    methods: ["POST"],
  });
}
