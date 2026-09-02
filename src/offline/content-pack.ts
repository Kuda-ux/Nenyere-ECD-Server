/**
 * Content pack cache — fetches and stores activity definitions in IndexedDB.
 * Per architecture.md §8: clients download the manifest, diff against local,
 * and fetch only changed assets.
 */
import { getDB, type ActivityCacheRow, type ContentPackVersionRow } from "./db";
import { seedActivities, seedStories } from "@/engine/seed/activities";
import type { AnyActivity } from "@/engine/schema";
import type { EcdLevel } from "@/lib/types";

type ContentPackManifest = {
  ecd_level: EcdLevel;
  version: string;
  activities: Array<{
    id: string;
    title: string;
    ecd_level: EcdLevel;
    learning_area: string;
  }>;
  stories: Array<{
    id: string;
    title: string;
    ecd_level: EcdLevel;
  }>;
  media: Array<{
    url: string;
    kind: "image" | "audio" | "svg";
  }>;
};

/**
 * Fetch content pack manifest from server.
 * Falls back to seed data if offline or server unavailable.
 */
export async function fetchContentPack(level: EcdLevel): Promise<ContentPackManifest> {
  try {
    const res = await fetch(`/api/packs/${level}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Offline fallback — build manifest from seed data
    return buildManifestFromSeed(level);
  }
}

function buildManifestFromSeed(level: EcdLevel): ContentPackManifest {
  const activities = seedActivities
    .filter((a) => a.ecd_level === level)
    .map((a) => ({
      id: a.id,
      title: a.title.en,
      ecd_level: a.ecd_level,
      learning_area: a.learning_area,
    }));

  const stories = seedStories
    .filter((s) => s.ecd_level === level)
    .map((s) => ({
      id: s.id,
      title: s.title.en,
      ecd_level: s.ecd_level,
    }));

  return {
    ecd_level: level,
    version: "seed-v1",
    activities,
    stories,
    media: [],
  };
}

/**
 * Sync content pack to local IndexedDB.
 * Caches all activity/story definitions for offline use.
 */
export async function syncContentPack(level: EcdLevel): Promise<{
  cached: number;
  version: string;
}> {
  const db = getDB();
  const manifest = await fetchContentPack(level);

  // Cache activity definitions from seed (in production, fetch from server)
  const allActivities: AnyActivity[] = [...seedActivities, ...seedStories];
  const levelActivities = allActivities.filter((a) => a.ecd_level === level);
  const now = Date.now();

  const activityRows: ActivityCacheRow[] = levelActivities
    .filter((a) => a.engine !== "story")
    .map((a) => ({
      id: a.id,
      activity: a,
      ecd_level: a.ecd_level,
      learning_area: a.learning_area,
      cached_at: now,
    }));

  const storyRows: ActivityCacheRow[] = levelActivities
    .filter((a) => a.engine === "story")
    .map((a) => ({
      id: a.id,
      activity: a,
      ecd_level: a.ecd_level,
      learning_area: a.learning_area,
      cached_at: now,
    }));

  await db.transaction("rw", db.activities, db.stories, db.contentPackVersion, async () => {
    // Clear old cache for this level
    await db.activities.where("ecd_level").equals(level).delete();
    await db.stories.where("ecd_level").equals(level).delete();

    // Insert new cache
    if (activityRows.length > 0) await db.activities.bulkPut(activityRows);
    if (storyRows.length > 0) await db.stories.bulkPut(storyRows);

    // Record version
    const versionRow: ContentPackVersionRow = {
      id: "current",
      ecd_level: level,
      version: manifest.version,
      fetched_at: now,
    };
    await db.contentPackVersion.put(versionRow);
  });

  return { cached: activityRows.length + storyRows.length, version: manifest.version };
}

/**
 * Get cached activities for a domain from IndexedDB.
 * Falls back to seed data if cache is empty.
 */
export async function getCachedActivities(level: EcdLevel): Promise<AnyActivity[]> {
  const db = getDB();
  const rows = await db.activities.where("ecd_level").equals(level).toArray();
  if (rows.length > 0) {
    return rows.map((r) => r.activity);
  }
  // Fallback to seed
  return seedActivities.filter((a) => a.ecd_level === level);
}

export async function getCachedStories(level: EcdLevel): Promise<AnyActivity[]> {
  const db = getDB();
  const rows = await db.stories.where("ecd_level").equals(level).toArray();
  if (rows.length > 0) {
    return rows.map((r) => r.activity);
  }
  return seedStories.filter((s) => s.ecd_level === level);
}

export async function getCachedActivityById(id: string): Promise<AnyActivity | undefined> {
  const db = getDB();
  const row = await db.activities.get(id);
  if (row) return row.activity;
  const storyRow = await db.stories.get(id);
  if (storyRow) return storyRow.activity;
  // Fallback to seed
  return [...seedActivities, ...seedStories].find((a) => a.id === id);
}
