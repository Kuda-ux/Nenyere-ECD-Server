/**
 * POST /api/sync — batch attempt upload from client sync queue.
 * Per architecture.md §3.3: Zod validate batch → derive actor + school from JWT
 * → for each attempt: apply_attempt (idempotent by client_attempt_id).
 *
 * This is a placeholder implementation that validates the payload shape.
 * In production, it will call the Supabase `apply_attempt` SQL function.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ResponseSchema = z.object({
  id: z.string().uuid(),
  attempt_id: z.string(),
  item_id: z.string(),
  answer: z.unknown(),
  hint_level: z.number().int().min(0),
  is_correct: z.boolean().nullable(),
  created_at: z.number(),
});

const AttemptSchema = z.object({
  client_attempt_id: z.string(),
  learner_id: z.string().uuid(),
  activity_id: z.string().uuid(),
  activity_version_id: z.string().nullable().optional(),
  assignment_id: z.string().nullable().optional(),
  device_id: z.string(),
  actor_user_id: z.string(),
  started_at: z.number(),
  completed_at: z.number().nullable(),
  status: z.enum(["completed", "abandoned"]),
  accuracy: z.number().min(0).max(1),
  stars: z.number().int().min(0).max(3),
  duration_ms: z.number().int().min(0),
  hints_used: z.number().int().min(0),
  items_total: z.number().int().min(0),
  items_correct: z.number().int().min(0),
  client_meta: z.record(z.unknown()).default({}),
  synced: z.number(),
  created_at: z.number(),
});

const BatchItemSchema = z.object({
  attempt: AttemptSchema,
  responses: z.array(ResponseSchema),
});

const SyncRequestSchema = z.object({
  batch: z.array(BatchItemSchema).min(1).max(50),
});

type SyncResult = {
  client_attempt_id: string;
  status: "applied" | "duplicate" | "rejected";
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

    // Placeholder: in production, call Supabase apply_attempt for each item
    // For now, simulate success for all items
    const results: SyncResult[] = parsed.data.batch.map((item) => ({
      client_attempt_id: item.attempt.client_attempt_id,
      status: "applied" as const,
    }));

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
