"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getLearnerStats, getPillarProgress, getAllBadges } from "@/lib/dev-tracker";
import { PILLARS } from "@/lib/activity-catalog";
import { HoldExitButton } from "@/components/kids/hold-exit-button";

function ProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const learnerId = params.get("learner") ?? "tari";
  const [stats, setStats] = useState<ReturnType<typeof getLearnerStats> | null>(null);
  const [badges, setBadges] = useState<ReturnType<typeof getAllBadges> | null>(null);
  const [pillarProgress, setPillarProgress] = useState<ReturnType<typeof getPillarProgress> | null>(null);

  useEffect(() => {
    setStats(getLearnerStats(learnerId));
    setBadges(getAllBadges(learnerId));
    setPillarProgress(getPillarProgress(learnerId));
  }, [learnerId]);

  if (!stats || !badges || !pillarProgress) {
    return (
      <div className="kids-bg-playful flex min-h-screen items-center justify-center">
        <p className="text-xl" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p>
      </div>
    );
  }

  const pillarInfoMap = Object.fromEntries(PILLARS.map((p) => [p.key, p]));

  return (
    <div
      className="kids-bg-playful relative flex min-h-screen flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-kids)" }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        <HoldExitButton
          onExit={() => router.push(`/kids/dashboard?learner=${learnerId}`)}
          label="Hold to go back"
        />
        <div
          className="flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 shadow-lg anim-bounce-in sm:px-5"
          style={{ background: "linear-gradient(135deg, #9B59D0, #6C5CE7)" }}
        >
          <span className="text-3xl sm:text-4xl" aria-hidden="true">📊</span>
          <h1 className="truncate text-xl font-bold text-white drop-shadow-md sm:text-2xl">My Progress</h1>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 px-4 py-2 sm:gap-4 sm:px-6">
        <div
          className="flex flex-col items-center rounded-3xl p-3 shadow-lg anim-pop-in sm:p-5"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          <span className="text-3xl sm:text-5xl">⭐</span>
          <span className="text-2xl font-bold text-white sm:text-4xl">{stats.totalStars}</span>
          <span className="text-xs text-white/80 sm:text-sm">Stars</span>
        </div>
        <div
          className="flex flex-col items-center rounded-3xl p-3 shadow-lg anim-pop-in anim-delay-1 sm:p-5"
          style={{ background: "linear-gradient(135deg, #9B59D0, #6C5CE7)" }}
        >
          <span className="text-3xl sm:text-5xl">🎯</span>
          <span className="text-2xl font-bold text-white sm:text-4xl">{stats.totalActivities}</span>
          <span className="text-xs text-white/80 sm:text-sm">Activities</span>
        </div>
        <div
          className="flex flex-col items-center rounded-3xl p-3 shadow-lg anim-pop-in anim-delay-2 sm:p-5"
          style={{ background: "linear-gradient(135deg, #4CAF50, #00B894)" }}
        >
          <span className="text-3xl sm:text-5xl">🧠</span>
          <span className="text-2xl font-bold text-white sm:text-4xl">{stats.totalSkills}</span>
          <span className="text-xs text-white/80 sm:text-sm">Skills</span>
        </div>
      </div>

      {/* Pillar progress bars */}
      <div className="overflow-y-auto kids-scroll px-4 py-4 sm:px-6">
        <h2 className="mb-4 text-xl font-bold text-[var(--color-ink-900)] sm:text-2xl">🌈 Learning Pillars</h2>
        <div className="flex flex-col gap-4">
          {pillarProgress.map((p, i) => {
            const pillarInfo = pillarInfoMap[p.pillar];
            const gradient = pillarInfo?.gradient ?? p.color;
            return (
              <div
                key={p.pillar}
                className="rounded-3xl bg-white p-5 shadow-md anim-slide-up"
                style={{ border: `3px solid ${p.color}`, animationDelay: `${i * 0.05}s` }}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-2xl sm:text-3xl">{p.emoji}</span>
                    <span className="truncate text-base font-bold text-[var(--color-ink-900)] sm:text-lg">{p.label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-[var(--color-ink-500)] sm:text-base">{p.completedActivities}/{p.totalActivities}</span>
                    <span className="text-sm sm:text-base">⭐ {p.stars}</span>
                  </div>
                </div>
                <div className="h-5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-surface-2)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.percentage}%`, background: gradient }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm text-[var(--color-ink-500)]">
                  <span>{p.percentage}% complete</span>
                  <span>{p.skillsPracticed} skills practiced</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 py-4 pb-8 sm:px-6">
        <h2 className="mb-4 text-xl font-bold text-[var(--color-ink-900)] sm:text-2xl">🏅 My Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {badges.map((badge, i) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-2 rounded-2xl p-3 shadow-md anim-pop-in sm:p-4`}
              style={{
                background: badge.earned
                  ? "linear-gradient(135deg, #FFB627, #FF9F43)"
                  : "white",
                border: `4px solid ${badge.earned ? "var(--color-brand-sun)" : "var(--color-surface-2)"}`,
                opacity: badge.earned ? 1 : 0.4,
                animationDelay: `${i * 0.04}s`,
                minHeight: "100px",
              }}
            >
              <span className={`text-3xl sm:text-4xl ${badge.earned ? "anim-wiggle" : ""}`} style={{ animationDelay: `${i * 0.08}s` }}>
                {badge.emoji}
              </span>
              <span
                className="text-center text-xs font-bold sm:text-sm"
                style={{ color: badge.earned ? "white" : "var(--color-ink-900)" }}
              >
                {badge.label}
              </span>
              {badge.earned && <span className="text-sm text-white">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="kids-bg-playful flex min-h-screen items-center justify-center"><p className="text-xl" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
