/**
 * Activity catalog — maps child-facing pillars to seed activities.
 * Organised around 10 developmental pillars for ECD A & ECD B learners.
 */
import { seedActivities, seedStories } from "@/engine/seed/activities";
import type { AnyActivity } from "@/engine/schema";

export type PillarKey =
  | "cognitive"
  | "pre-writing"
  | "mathematics"
  | "literacy"
  | "indigenous-language"
  | "science"
  | "social-studies"
  | "social-emotional"
  | "creativity"
  | "physical"
  | "stories"
  | "themes";

export type Pillar = {
  key: PillarKey;
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
};

export const PILLARS: Pillar[] = [
  {
    key: "cognitive",
    label: "Thinking",
    emoji: "🧠",
    color: "var(--color-brand-jacaranda)",
    gradient: "linear-gradient(135deg, #9B59D0, #6C5CE7)",
    description: "Matching, sorting, memory, puzzles, patterns",
  },
  {
    key: "pre-writing",
    label: "Tracing",
    emoji: "✏️",
    color: "var(--color-brand-sky)",
    gradient: "linear-gradient(135deg, #4FC3F7, #26D0A8)",
    description: "Lines, shapes, letters, numbers",
  },
  {
    key: "mathematics",
    label: "Numbers",
    emoji: "🔢",
    color: "var(--color-brand-msasa)",
    gradient: "linear-gradient(135deg, #4CAF50, #00B894)",
    description: "Counting, addition, subtraction, shapes",
  },
  {
    key: "literacy",
    label: "Letters",
    emoji: "🔤",
    color: "var(--color-brand-sky)",
    gradient: "linear-gradient(135deg, #4FC3F7, #6C5CE7)",
    description: "Phonics, vowels, alphabet, vocabulary",
  },
  {
    key: "indigenous-language",
    label: "ChiShona",
    emoji: "🇿🇼",
    color: "var(--color-brand-sun)",
    gradient: "linear-gradient(135deg, #FFB627, #FF9F43)",
    description: "Learn in ChiShona and isiNdebele",
  },
  {
    key: "science",
    label: "Discovery",
    emoji: "🔬",
    color: "var(--color-brand-clay)",
    gradient: "linear-gradient(135deg, #FF6B35, #FF5252)",
    description: "Animals, weather, plants, senses",
  },
  {
    key: "social-studies",
    label: "My World",
    emoji: "🌍",
    color: "var(--color-brand-msasa)",
    gradient: "linear-gradient(135deg, #00B894, #26D0A8)",
    description: "Family, community, Zimbabwe, transport",
  },
  {
    key: "social-emotional",
    label: "Feelings",
    emoji: "❤️",
    color: "var(--color-brand-sun)",
    gradient: "linear-gradient(135deg, #FF6B9D, #E84393)",
    description: "Emotions, sharing, kindness, respect",
  },
  {
    key: "creativity",
    label: "Create",
    emoji: "🎨",
    color: "var(--color-brand-sun)",
    gradient: "linear-gradient(135deg, #FFEB3B, #FF9F43)",
    description: "Colours, drawing, music, dance",
  },
  {
    key: "physical",
    label: "Move",
    emoji: "🏃",
    color: "var(--color-brand-clay)",
    gradient: "linear-gradient(135deg, #FF9F43, #FF6B35)",
    description: "Jump, clap, balance, coordination",
  },
  {
    key: "stories",
    label: "Stories",
    emoji: "📖",
    color: "var(--color-brand-jacaranda)",
    gradient: "linear-gradient(135deg, #9B59D0, #B388FF)",
    description: "Interactive Zimbabwean stories",
  },
  {
    key: "themes",
    label: "Themes",
    emoji: "🌟",
    color: "var(--color-brand-sun)",
    gradient: "linear-gradient(135deg, #FFB627, #FF6B9D)",
    description: "Animals, transport, weather themes",
  },
];

// ── Pillar filters: map each pillar to activity type/area filters ──────────

const PILLAR_FILTERS: Record<PillarKey, (a: AnyActivity) => boolean> = {
  cognitive: (a) =>
    a.type === "matching" ||
    a.type === "sorting" ||
    a.type === "classification" ||
    a.type === "memory_game" ||
    a.type === "pattern_completion" ||
    a.type === "sequence_ordering" ||
    a.type === "spot_the_difference" ||
    a.type === "puzzle" ||
    (a.type === "tap_correct" && a.learning_area === "mathematics" && a.tags.includes("cognitive")),
  "pre-writing": (a) =>
    a.type === "tracing" ||
    a.type === "joining_dots" ||
    a.type === "colouring",
  mathematics: (a) =>
    a.engine === "counting" ||
    a.type === "basic_addition" ||
    a.type === "basic_subtraction" ||
    a.type === "shape_matching" ||
    a.type === "shape_sorting" ||
    (a.type === "tap_correct" && a.learning_area === "mathematics" && !a.tags.includes("cognitive")) ||
    (a.type === "multiple_choice" && a.learning_area === "mathematics"),
  literacy: (a) =>
    a.type === "phonics_recognition" ||
    a.type === "sound_recognition" ||
    a.type === "image_identification" && a.learning_area === "english_language" ||
    a.type === "audio_to_image" && a.learning_area === "english_language" ||
    a.type === "image_to_audio" && a.learning_area === "english_language",
  "indigenous-language": (a) =>
    a.learning_area === "indigenous_language" ||
    a.tags.includes("indigenous"),
  science: (a) =>
    a.learning_area === "science_and_technology",
  "social-studies": (a) =>
    a.learning_area === "social_sciences",
  "social-emotional": (a) =>
    a.tags.includes("social-emotional"),
  creativity: (a) =>
    a.type === "colour_identification" ||
    a.type === "colouring" ||
    (a.type === "tap_correct" && a.learning_area === "physical_education_and_arts") ||
    a.type === "audio_to_image" && a.learning_area === "physical_education_and_arts",
  physical: (a) =>
    a.tags.includes("physical") ||
    a.type === "pointing_target",
  stories: () => false,
  themes: (a) =>
    a.tags.includes("theme-animals") ||
    a.tags.includes("theme-transport") ||
    a.tags.includes("theme-weather"),
};

export function getActivitiesByPillar(pillar: PillarKey): AnyActivity[] {
  if (pillar === "stories") return [];
  const filter = PILLAR_FILTERS[pillar] ?? (() => true);
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

// ── Activity card type for display ─────────────────────────────────────────

export type ActivityCard = {
  id: string;
  title: string;
  type: string;
  engine: string;
  ecd_level: string;
  difficulty: string;
  emoji: string;
  stars: number;
  pillar: PillarKey;
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
  joining_dots: "🔵",
  colouring: "🖍️",
  image_identification: "🖼️",
  phonics_recognition: "🔤",
  animal_sound_recognition: "🎵",
  audio_to_image: "👂",
  image_to_audio: "🔊",
  story_interaction: "📖",
  classification: "🔍",
  spot_the_difference: "👀",
  puzzle: "🧩",
  pointing_target: "👆",
  sound_recognition: "🎵",
  drag_and_drop: "🤚",
};

const PILLAR_FOR_ACTIVITY: Record<string, PillarKey> = {
  counting: "mathematics",
  basic_addition: "mathematics",
  basic_subtraction: "mathematics",
  shape_matching: "mathematics",
  shape_sorting: "mathematics",
  matching: "cognitive",
  sorting: "cognitive",
  classification: "cognitive",
  memory_game: "cognitive",
  pattern_completion: "cognitive",
  sequence_ordering: "cognitive",
  spot_the_difference: "cognitive",
  puzzle: "cognitive",
  tracing: "pre-writing",
  joining_dots: "pre-writing",
  colouring: "creativity",
  colour_identification: "creativity",
  phonics_recognition: "literacy",
  sound_recognition: "literacy",
  animal_sound_recognition: "science",
  image_identification: "literacy",
  audio_to_image: "literacy",
  image_to_audio: "literacy",
  story_interaction: "stories",
  pointing_target: "physical",
};

export function toActivityCard(activity: AnyActivity): ActivityCard {
  const pillar = (PILLAR_FOR_ACTIVITY[activity.type] ?? "cognitive") as PillarKey;
  return {
    id: activity.id,
    title: activity.title.en,
    type: activity.type,
    engine: activity.engine,
    ecd_level: activity.ecd_level,
    difficulty: activity.difficulty,
    emoji: TYPE_EMOJI[activity.type] ?? "🎯",
    stars: 0,
    pillar,
  };
}
