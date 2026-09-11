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
      <div className="flex items-center gap-4 px-6 py-4">
        <HoldExitButton
          onExit={() => router.push(`/kids/dashboard?learner=${learnerId}`)}
          label="Hold to go back"
        />
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-lg anim-bounce-in"
          style={{ background: "linear-gradient(135deg, #9B59D0, #6C5CE7)" }}
        >
          <span className="text-4xl" aria-hidden="true">📊</span>
          <h1 className="text-2xl font-bold text-white drop-shadow-md">My Progress</h1>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 px-6 py-2">
        <div
          className="flex flex-col items-center rounded-3xl p-5 shadow-lg anim-pop-in"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          <span className="text-5xl">⭐</span>
          <span className="text-4xl font-bold text-white">{stats.totalStars}</span>
          <span className="text-sm text-white/80">Stars</span>
        </div>
        <div
          className="flex flex-col items-center rounded-3xl p-5 shadow-lg anim-pop-in anim-delay-1"
          style={{ background: "linear-gradient(135deg, #9B59D0, #6C5CE7)" }}
        >
          <span className="text-5xl">🎯</span>
          <span className="text-4xl font-bold text-white">{stats.totalActivities}</span>
          <span className="text-sm text-white/80">Activities</span>
        </div>
        <div
          className="flex flex-col items-center rounded-3xl p-5 shadow-lg anim-pop-in anim-delay-2"
          style={{ background: "linear-gradient(135deg, #4CAF50, #00B894)" }}
        >
          <span className="text-5xl">🧠</span>
          <span className="text-4xl font-bold text-white">{stats.totalSkills}</span>
          <span className="text-sm text-white/80">Skills</span>
        </div>
      </div>

      {/* Pillar progress bars */}
      <div className="overflow-y-auto kids-scroll px-6 py-4">
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-ink-900)]">🌈 Learning Pillars</h2>
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.emoji}</span>
                    <span className="text-lg font-bold text-[var(--color-ink-900)]">{p.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-[var(--color-ink-500)]">{p.completedActivities}/{p.totalActivities}</span>
                    <span className="text-base">⭐ {p.stars}</span>
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
      <div className="px-6 py-4 pb-8">
        <h2 className="mb-4 text-2xl font-bold text-[var(--color-ink-900)]">🏅 My Badges</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {badges.map((badge, i) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 shadow-md anim-pop-in`}
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
              <span className={`text-4xl ${badge.earned ? "anim-wiggle" : ""}`} style={{ animationDelay: `${i * 0.08}s` }}>
                {badge.emoji}
              </span>
              <span
                className="text-center text-sm font-bold"
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
