/**
 * Development tracking — stores per-learner progress in localStorage.
 * Tracks activities completed, stars earned, skills developed, and
 * developmental milestones per pillar.
 */

import { PILLARS, type PillarKey, getActivitiesByPillar } from "./activity-catalog";

const STORAGE_KEY = "nenyere_dev_tracker";

export interface ActivityRecord {
  activityId: string;
  completedAt: string;
  stars: number;
  attempts: number;
  bestScore: number;
}

export interface SkillRecord {
  skillId: string;
  timesPracticed: number;
  lastPracticedAt: string;
}

export interface LearnerProfile {
  learnerId: string;
  activities: Record<string, ActivityRecord>;
  skills: Record<string, SkillRecord>;
  totalStars: number;
  totalActivitiesCompleted: number;
  badges: string[];
  createdAt: string;
}

export interface PillarProgress {
  pillar: PillarKey;
  label: string;
  emoji: string;
  color: string;
  totalActivities: number;
  completedActivities: number;
  stars: number;
  skillsPracticed: number;
  percentage: number;
}

function loadAllProfiles(): Record<string, LearnerProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllProfiles(profiles: Record<string, LearnerProfile>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getLearnerProfile(learnerId: string): LearnerProfile {
  const profiles = loadAllProfiles();
  if (!profiles[learnerId]) {
    profiles[learnerId] = {
      learnerId,
      activities: {},
      skills: {},
      totalStars: 0,
      totalActivitiesCompleted: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };
    saveAllProfiles(profiles);
  }
  return profiles[learnerId];
}

export function recordActivityCompletion(
  learnerId: string,
  activityId: string,
  score: number,
  skillIds: string[]
): LearnerProfile {
  const profiles = loadAllProfiles();
  const profile = profiles[learnerId] ?? {
    learnerId,
    activities: {},
    skills: {},
    totalStars: 0,
    totalActivitiesCompleted: 0,
    badges: [],
    createdAt: new Date().toISOString(),
  };

  const stars = score >= 0.9 ? 3 : score >= 0.6 ? 2 : 1;
  const existing = profile.activities[activityId];
  const bestScore = existing ? Math.max(existing.bestScore, score) : score;
  const attempts = existing ? existing.attempts + 1 : 1;

  if (!existing) {
    profile.totalActivitiesCompleted++;
  }
  if (existing) {
    profile.totalStars -= existing.stars;
  }
  profile.totalStars += stars;

  profile.activities[activityId] = {
    activityId,
    completedAt: new Date().toISOString(),
    stars,
    attempts,
    bestScore,
  };

  for (const skillId of skillIds) {
    const skill = profile.skills[skillId];
    if (skill) {
      skill.timesPracticed++;
      skill.lastPracticedAt = new Date().toISOString();
    } else {
      profile.skills[skillId] = {
        skillId,
        timesPracticed: 1,
        lastPracticedAt: new Date().toISOString(),
      };
    }
  }

  // Check for new badges
  profile.badges = computeBadges(profile);

  profiles[learnerId] = profile;
  saveAllProfiles(profiles);
  return profile;
}

export function getPillarProgress(learnerId: string): PillarProgress[] {
  const profile = getLearnerProfile(learnerId);
  return PILLARS.filter((p) => p.key !== "themes").map((pillar) => {
    const activities = getActivitiesByPillar(pillar.key);
    const totalActivities = activities.length;
    let completedActivities = 0;
    let stars = 0;
    const skillIds = new Set<string>();

    for (const activity of activities) {
      const record = profile.activities[activity.id];
      if (record) {
        completedActivities++;
        stars += record.stars;
      }
      for (const skillId of activity.skills) {
        skillIds.add(skillId);
      }
    }

    let skillsPracticed = 0;
    for (const skillId of skillIds) {
      if (profile.skills[skillId]) skillsPracticed++;
    }

    const percentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    return {
      pillar: pillar.key,
      label: pillar.label,
      emoji: pillar.emoji,
      color: pillar.color,
      totalActivities,
      completedActivities,
      stars,
      skillsPracticed,
      percentage,
    };
  });
}

export function getLearnerStats(learnerId: string) {
  const profile = getLearnerProfile(learnerId);
  const pillarProgress = getPillarProgress(learnerId);
  const totalSkills = Object.keys(profile.skills).length;
  const avgScore = profile.totalActivitiesCompleted > 0
    ? Math.round((profile.totalStars / (profile.totalActivitiesCompleted * 3)) * 100)
    : 0;

  return {
    totalStars: profile.totalStars,
    totalActivities: profile.totalActivitiesCompleted,
    totalSkills,
    badges: profile.badges,
    avgScore,
    pillarProgress,
  };
}

interface BadgeDef {
  id: string;
  emoji: string;
  label: string;
  description: string;
  check: (profile: LearnerProfile) => boolean;
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first-star",
    emoji: "⭐",
    label: "First Star",
    description: "Complete your first activity",
    check: (p) => p.totalActivitiesCompleted >= 1,
  },
  {
    id: "counting-champ",
    emoji: "🔢",
    label: "Counting Champion",
    description: "Complete 3 maths activities",
    check: (p) => {
      let count = 0;
      for (const id of Object.keys(p.activities)) {
        if (id.startsWith("00000000-0000-0000-0003")) count++;
      }
      return count >= 3;
    },
  },
  {
    id: "colour-expert",
    emoji: "🎨",
    label: "Colour Expert",
    description: "Complete 3 creativity activities",
    check: (p) => {
      let count = 0;
      for (const id of Object.keys(p.activities)) {
        if (id.startsWith("00000000-0000-0000-0009")) count++;
      }
      return count >= 3;
    },
  },
  {
    id: "story-lover",
    emoji: "📖",
    label: "Story Lover",
    description: "Complete 2 stories",
    check: (p) => {
      let count = 0;
      for (const id of Object.keys(p.activities)) {
        if (id.startsWith("00000000-0000-0000-0006-00000000000")) count++;
      }
      return count >= 2;
    },
  },
  {
    id: "puzzle-master",
    emoji: "🧩",
    label: "Puzzle Master",
    description: "Complete 3 cognitive activities",
    check: (p) => {
      let count = 0;
      for (const id of Object.keys(p.activities)) {
        if (id.startsWith("00000000-0000-0000-0001")) count++;
      }
      return count >= 3;
    },
  },
  {
    id: "tracing-star",
    emoji: "✏️",
    label: "Tracing Star",
    description: "Complete 3 tracing activities",
    check: (p) => {
      let count = 0;
      for (const id of Object.keys(p.activities)) {
        if (id.startsWith("00000000-0000-0000-0002")) count++;
      }
      return count >= 3;
    },
  },
  {
    id: "language-whiz",
    emoji: "🌍",
    label: "Language Whiz",
    description: "Complete 3 indigenous language activities",
    check: (p) => {
      let count = 0;
      for (const id of Object.keys(p.activities)) {
        if (id.startsWith("00000000-0000-0000-0005")) count++;
      }
      return count >= 3;
    },
  },
  {
    id: "ten-stars",
    emoji: "🌟",
    label: "Ten Stars",
    description: "Earn 10 stars total",
    check: (p) => p.totalStars >= 10,
  },
  {
    id: "explorer",
    emoji: "🗺️",
    label: "Explorer",
    description: "Complete activities from 5 different pillars",
    check: (p) => {
      const pillars = new Set<string>();
      for (const id of Object.keys(p.activities)) {
        const prefix = id.substring(0, 30);
        pillars.add(prefix);
      }
      return pillars.size >= 5;
    },
  },
  {
    id: "scientist",
    emoji: "🔬",
    label: "Little Scientist",
    description: "Complete 3 science activities",
    check: (p) => {
      let count = 0;
      for (const id of Object.keys(p.activities)) {
        if (id.startsWith("00000000-0000-0000-0006-00000000000")) {
          // exclude stories
          if (!id.endsWith("000000000001") && !id.endsWith("000000000002") && !id.endsWith("000000000003") && !id.endsWith("000000000004") && !id.endsWith("000000000005")) {
            count++;
          }
        }
      }
      return count >= 3;
    },
  },
];

function computeBadges(profile: LearnerProfile): string[] {
  return BADGE_DEFS.filter((b) => b.check(profile)).map((b) => b.id);
}

export function getAllBadges(learnerId: string) {
  const profile = getLearnerProfile(learnerId);
  return BADGE_DEFS.map((b) => ({
    id: b.id,
    emoji: b.emoji,
    label: b.label,
    description: b.description,
    earned: profile.badges.includes(b.id),
  }));
}
