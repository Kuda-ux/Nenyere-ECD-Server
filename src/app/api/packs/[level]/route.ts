/**
 * GET /api/packs/[level] — content pack manifest for an ECD level.
 * Per architecture.md §8: clients download the manifest, diff against local,
 * and fetch only changed assets.
 *
 * Returns activity/story metadata + media manifest.
 * In production, reads from Supabase. For now, returns seed data.
 */
import { NextRequest, NextResponse } from "next/server";
import { seedActivities, seedStories } from "@/engine/seed/activities";
import type { EcdLevel } from "@/lib/types";

const VALID_LEVELS = new Set(["ECD_A", "ECD_B"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ level: string }> },
) {
  const { level } = await params;

  if (!VALID_LEVELS.has(level)) {
    return NextResponse.json(
      { error: `Invalid ECD level: ${level}. Must be ECD_A or ECD_B.` },
      { status: 400 },
    );
  }

  const ecdLevel = level as EcdLevel;

  const activities = seedActivities
    .filter((a) => a.ecd_level === ecdLevel)
    .map((a) => ({
      id: a.id,
      type: a.type,
      engine: a.engine,
      title: a.title,
      ecd_level: a.ecd_level,
      learning_area: a.learning_area,
      difficulty: a.difficulty,
      estimated_duration_s: a.estimated_duration_s,
    }));

  const stories = seedStories
    .filter((s) => s.ecd_level === ecdLevel)
    .map((s) => ({
      id: s.id,
      title: s.title,
      ecd_level: s.ecd_level,
    }));

  // Collect all media URLs from activities
  const mediaUrls = new Set<string>();
  for (const activity of [...seedActivities, ...seedStories]) {
    if (activity.ecd_level !== ecdLevel) continue;
    if (activity.instructions.audio?.en) mediaUrls.add(activity.instructions.audio.en);
    for (const asset of activity.assets ?? []) {
      if (asset.url) mediaUrls.add(asset.url);
    }
  }

  const manifest = {
    ecd_level: ecdLevel,
    version: "seed-v1",
    generated_at: new Date().toISOString(),
    activities,
    stories,
    media: Array.from(mediaUrls).map((url) => ({
      url,
      kind: url.endsWith(".mp3") || url.endsWith(".opus") || url.endsWith(".webm")
        ? "audio" as const
        : "image" as const,
    })),
  };

  return NextResponse.json(manifest);
}
