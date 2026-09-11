"use client";

import { useEffect, useState } from "react";
import { getLearners, type Learner } from "@/lib/learner-store";
import { getLearnerStats, getLearnerProfile, getPillarProgress, type LearnerProfile, type PillarProgress } from "@/lib/dev-tracker";
import { getAllActivities, getActivitiesByEcdLevel, PILLARS } from "@/lib/activity-catalog";

export interface PortalData {
  learners: Learner[];
  totalLearners: number;
  ecdACount: number;
  ecdBCount: number;
  totalActivities: number;
  ecdAActivities: number;
  ecdBActivities: number;
  totalPillars: number;
  learnerStats: Array<{
    learner: Learner;
    profile: LearnerProfile;
    stats: ReturnType<typeof getLearnerStats>;
    pillarProgress: PillarProgress[];
  }>;
  classTotalStars: number;
  classTotalActivities: number;
  classAvgScore: number;
}

export function usePortalData(): { data: PortalData | null; loading: boolean; refresh: () => void } {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const learners = getLearners();
    const allActivities = getAllActivities();
    const ecdAActivities = getActivitiesByEcdLevel("ECD_A").length;
    const ecdBActivities = getActivitiesByEcdLevel("ECD_B").length;

    const learnerStats = learners.map((learner) => {
      const profile = getLearnerProfile(learner.id);
      const stats = getLearnerStats(learner.id);
      const pillarProgress = getPillarProgress(learner.id);
      return { learner, profile, stats, pillarProgress };
    });

    const classTotalStars = learnerStats.reduce((sum, s) => sum + s.stats.totalStars, 0);
    const classTotalActivities = learnerStats.reduce((sum, s) => sum + s.stats.totalActivities, 0);
    const classAvgScore = learnerStats.length > 0
      ? Math.round(learnerStats.reduce((sum, s) => sum + s.stats.avgScore, 0) / learnerStats.length)
      : 0;

    setData({
      learners,
      totalLearners: learners.length,
      ecdACount: learners.filter((l) => l.ecd_level === "ECD_A").length,
      ecdBCount: learners.filter((l) => l.ecd_level === "ECD_B").length,
      totalActivities: allActivities.length,
      ecdAActivities,
      ecdBActivities,
      totalPillars: PILLARS.filter((p) => p.key !== "themes").length,
      learnerStats,
      classTotalStars,
      classTotalActivities,
      classAvgScore,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "nenyere_learners" || e.key === "nenyere_dev_tracker" || e.key === null) {
        fetchData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Poll every 3 seconds as fallback for same-tab updates
    const interval = setInterval(fetchData, 3000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return { data, loading, refresh: fetchData };
}
