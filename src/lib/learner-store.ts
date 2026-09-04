/**
 * Learner store — manages ECD pupils in localStorage for offline tablet use.
 * Teachers can add, edit, and remove learners. Data persists on-device.
 */

const LEARNERS_KEY = "nenyere_learners";

export type ECDLevel = "ECD_A" | "ECD_B";

export interface Learner {
  id: string;
  preferred_name: string;
  first_name: string;
  avatar_key: string;
  ecd_level: ECDLevel;
}

export const AVATAR_EMOJI: Record<string, string> = {
  star: "⭐",
  elephant: "🐘",
  lion: "🦁",
  bird: "🐦",
  fish: "🐟",
  rabbit: "🐰",
  sun: "☀️",
  flower: "🌸",
  tree: "🌳",
  butterfly: "🦋",
};

export const AVATAR_COLORS: Record<string, string> = {
  star: "linear-gradient(135deg, #FFB627, #FF9F43)",
  elephant: "linear-gradient(135deg, #4FC3F7, #6C5CE7)",
  lion: "linear-gradient(135deg, #FF9F43, #FF6B35)",
  bird: "linear-gradient(135deg, #26D0A8, #00B894)",
  fish: "linear-gradient(135deg, #4FC3F7, #26D0A8)",
  rabbit: "linear-gradient(135deg, #FF6B9D, #E84393)",
  sun: "linear-gradient(135deg, #FFEB3B, #FFB627)",
  flower: "linear-gradient(135deg, #FF6B9D, #9B59D0)",
  tree: "linear-gradient(135deg, #4CAF50, #00B894)",
  butterfly: "linear-gradient(135deg, #9B59D0, #6C5CE7)",
};

export const AVATAR_KEYS = Object.keys(AVATAR_EMOJI);

const DEFAULT_LEARNERS: Learner[] = [
  { id: "00000000-0000-0000-0000-000000001001", preferred_name: "Tari", first_name: "Tariro", avatar_key: "star", ecd_level: "ECD_A" },
  { id: "00000000-0000-0000-0000-000000001002", preferred_name: "Tina", first_name: "Tinashe", avatar_key: "elephant", ecd_level: "ECD_A" },
  { id: "00000000-0000-0000-0000-000000001003", preferred_name: "Rumbi", first_name: "Rumbidzai", avatar_key: "lion", ecd_level: "ECD_B" },
];

function loadLearners(): Learner[] {
  if (typeof window === "undefined") return DEFAULT_LEARNERS;
  try {
    const raw = localStorage.getItem(LEARNERS_KEY);
    if (!raw) {
      localStorage.setItem(LEARNERS_KEY, JSON.stringify(DEFAULT_LEARNERS));
      return DEFAULT_LEARNERS;
    }
    const parsed = JSON.parse(raw) as Learner[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_LEARNERS;
    }
    return parsed;
  } catch {
    return DEFAULT_LEARNERS;
  }
}

function saveLearners(learners: Learner[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEARNERS_KEY, JSON.stringify(learners));
}

export function getLearners(): Learner[] {
  return loadLearners();
}

export function getLearnerById(id: string): Learner | undefined {
  return loadLearners().find((l) => l.id === id);
}

export function addLearner(data: Omit<Learner, "id">): Learner {
  const learners = loadLearners();
  const newLearner: Learner = {
    ...data,
    id: crypto.randomUUID(),
  };
  learners.push(newLearner);
  saveLearners(learners);
  return newLearner;
}

export function updateLearner(id: string, updates: Partial<Omit<Learner, "id">>): Learner | undefined {
  const learners = loadLearners();
  const idx = learners.findIndex((l) => l.id === id);
  if (idx === -1) return undefined;
  learners[idx] = { ...learners[idx], ...updates };
  saveLearners(learners);
  return learners[idx];
}

export function removeLearner(id: string): boolean {
  const learners = loadLearners();
  const filtered = learners.filter((l) => l.id !== id);
  if (filtered.length === learners.length) return false;
  saveLearners(filtered);
  return true;
}

export function resetLearners() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEARNERS_KEY, JSON.stringify(DEFAULT_LEARNERS));
}
