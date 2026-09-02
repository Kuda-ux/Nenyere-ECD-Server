/**
 * Activity catalog — maps child-facing domains to seed activities.
 * Used by the child dashboard, explore pages, and story shelf.
 */
import { seedActivities, seedStories } from "@/engine/seed/activities";
import type { AnyActivity } from "@/engine/schema";

export type DomainKey =
  | "numbers"
  | "letters-sounds"
  | "colours"
  | "shapes"
  | "animals-nature"
  | "stories"
  | "puzzles"
  | "explore";

export type Domain = {
  key: DomainKey;
  label: string;
  emoji: string;
  color: string;
};

export const DOMAINS: Domain[] = [
  { key: "numbers", label: "Numbers", emoji: "🔢", color: "var(--color-brand-msasa)" },
  { key: "letters-sounds", label: "Letters & Sounds", emoji: "🔤", color: "var(--color-brand-sky)" },
  { key: "colours", label: "Colours", emoji: "🎨", color: "var(--color-brand-sun)" },
  { key: "shapes", label: "Shapes", emoji: "⭐", color: "var(--color-brand-jacaranda)" },
  { key: "animals-nature", label: "Animals & Nature", emoji: "🐘", color: "var(--color-brand-clay)" },
  { key: "stories", label: "Stories", emoji: "📖", color: "var(--color-brand-jacaranda)" },
  { key: "puzzles", label: "Puzzles", emoji: "🧩", color: "var(--color-brand-msasa)" },
  { key: "explore", label: "Explore", emoji: "🌟", color: "var(--color-brand-sun)" },
];

const DOMAIN_FILTERS: Record<DomainKey, (a: AnyActivity) => boolean> = {
  numbers: (a) => a.engine === "counting",
  "letters-sounds": (a) =>
    a.type === "phonics_recognition" ||
    a.type === "sound_recognition" ||
    a.type === "animal_sound_recognition" ||
    a.type === "audio_to_image" ||
    a.type === "image_to_audio" ||
    a.type === "tracing",
  colours: (a) =>
    a.type === "colour_identification" ||
    a.type === "colouring" ||
    (a.type === "tap_correct" && a.learning_area === "physical_education_and_arts"),
  shapes: (a) =>
    a.type === "shape_matching" ||
    a.type === "shape_sorting" ||
    (a.type === "tap_correct" && a.learning_area === "mathematics"),
  "animals-nature": (a) =>
    a.learning_area === "science_and_technology" ||
    a.learning_area === "social_sciences",
  stories: () => false,
  puzzles: (a) =>
    a.type === "memory_game" ||
    a.type === "puzzle" ||
    a.type === "spot_the_difference" ||
    a.type === "joining_dots",
  explore: () => true,
};

export function getActivitiesByDomain(domain: DomainKey): AnyActivity[] {
  if (domain === "stories") return [];
  const filter = DOMAIN_FILTERS[domain] ?? (() => true);
  return seedActivities.filter(filter);
}

export function getActivityById(id: string): AnyActivity | undefined {
  return [...seedActivities, ...seedStories].find((a) => a.id === id);
}

export function getStoryById(id: string): AnyActivity | undefined {
  return seedStories.find((s) => s.id === id);
}

export function getAllStories(): AnyActivity[] {
  return seedStories;
}

export function getAllActivities(): AnyActivity[] {
  return seedActivities;
}

export function getActivitiesByEcdLevel(level: "ECD_A" | "ECD_B"): AnyActivity[] {
  return seedActivities.filter((a) => a.ecd_level === level);
}

export type ActivityCard = {
  id: string;
  title: string;
  type: string;
  engine: string;
  ecd_level: string;
  difficulty: string;
  emoji: string;
  stars: number;
};

const TYPE_EMOJI: Record<string, string> = {
  counting: "🔢",
  basic_addition: "➕",
  basic_subtraction: "➖",
  tap_correct: "👆",
  multiple_choice: "❓",
  matching: "🔗",
  shape_matching: "🔷",
  shape_sorting: "🔲",
  colour_identification: "🎨",
  sorting: "📦",
  pattern_completion: "🔁",
  sequence_ordering: "1️⃣",
  memory_game: "🃏",
  tracing: "✏️",
  image_identification: "🖼️",
  phonics_recognition: "🔤",
  animal_sound_recognition: "🎵",
  audio_to_image: "👂",
  story_interaction: "📖",
};

export function toActivityCard(activity: AnyActivity): ActivityCard {
  return {
    id: activity.id,
    title: activity.title.en,
    type: activity.type,
    engine: activity.engine,
    ecd_level: activity.ecd_level,
    difficulty: activity.difficulty,
    emoji: TYPE_EMOJI[activity.type] ?? "🎯",
    stars: 0,
  };
}
