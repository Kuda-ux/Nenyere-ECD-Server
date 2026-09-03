"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { getLearnerStats, getPillarProgress, getAllBadges } from "@/lib/dev-tracker";

function ProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const learnerId = params.get("learner") ?? "tari";
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getLearnerStats> | null>(null);
  const [badges, setBadges] = useState<ReturnType<typeof getAllBadges> | null>(null);
  const [pillarProgress, setPillarProgress] = useState<ReturnType<typeof getPillarProgress> | null>(null);

  useEffect(() => {
    setStats(getLearnerStats(learnerId));
    setBadges(getAllBadges(learnerId));
    setPillarProgress(getPillarProgress(learnerId));
  }, [learnerId]);

  function handleExitHoldStart() {
    setExitProgress(0);
    let elapsed = 0;
    holdTimer.current = setInterval(() => {
      elapsed += 100;
      setExitProgress(elapsed / 2000);
      if (elapsed >= 2000) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        router.push("/kids/dashboard");
      }
    }, 100);
  }

  function handleExitHoldEnd() {
    if (holdTimer.current) clearInterval(holdTimer.current);
    setExitProgress(0);
  }

  if (!stats || !badges || !pillarProgress) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--color-surface-0)" }}>
        <p className="text-lg" style={{ fontFamily: "var(--font-kids)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "var(--color-surface-0)",
        fontFamily: "var(--font-kids)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          className="relative flex h-12 w-12 items-center justify-center rounded-full text-2xl text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-surface-1)]"
          onPointerDown={handleExitHoldStart}
          onPointerUp={handleExitHoldEnd}
          onPointerLeave={handleExitHoldEnd}
          aria-label="Hold to go back"
        >
          ←
          {exitProgress > 0 && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-brand-sun)" strokeWidth="3" strokeDasharray={`${exitProgress * 138.2} 138.2`} />
            </svg>
          )}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">📊</span>
          <h1 className="text-2xl font-bold text-[var(--color-ink-900)]">My Progress</h1>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 px-6 py-2">
        <div className="flex flex-col items-center rounded-2xl bg-white p-4" style={{ border: "3px solid var(--color-brand-sun)" }}>
          <span className="text-4xl">⭐</span>
          <span className="text-2xl font-bold text-[var(--color-ink-900)]">{stats.totalStars}</span>
          <span className="text-xs text-[var(--color-ink-500)]">Stars</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-white p-4" style={{ border: "3px solid var(--color-brand-jacaranda)" }}>
          <span className="text-4xl">🎯</span>
          <span className="text-2xl font-bold text-[var(--color-ink-900)]">{stats.totalActivities}</span>
          <span className="text-xs text-[var(--color-ink-500)]">Activities</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-white p-4" style={{ border: "3px solid var(--color-brand-msasa)" }}>
          <span className="text-4xl">🧠</span>
          <span className="text-2xl font-bold text-[var(--color-ink-900)]">{stats.totalSkills}</span>
          <span className="text-xs text-[var(--color-ink-500)]">Skills</span>
        </div>
      </div>

      {/* Pillar progress bars */}
      <div className="px-6 py-4">
        <h2 className="mb-3 text-xl font-bold text-[var(--color-ink-900)]">Learning Pillars</h2>
        <div className="flex flex-col gap-3">
          {pillarProgress.map((p) => (
            <div key={p.pillar} className="rounded-2xl bg-white p-4" style={{ border: `2px solid ${p.color}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="font-bold text-[var(--color-ink-900)]">{p.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-ink-500)]">{p.completedActivities}/{p.totalActivities}</span>
                  <span className="text-sm">⭐ {p.stars}</span>
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-surface-2)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-[var(--color-ink-500)]">
                <span>{p.percentage}% complete</span>
                <span>{p.skillsPracticed} skills practiced</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="px-6 py-4 pb-8">
        <h2 className="mb-3 text-xl font-bold text-[var(--color-ink-900)]">My Badges</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3"
              style={{
                border: `3px solid ${badge.earned ? "var(--color-brand-sun)" : "var(--color-surface-2)"}`,
                opacity: badge.earned ? 1 : 0.4,
              }}
            >
              <span className="text-3xl">{badge.emoji}</span>
              <span className="text-center text-xs font-bold text-[var(--color-ink-900)]">{badge.label}</span>
              {badge.earned && <span className="text-xs text-[var(--color-brand-sun)]">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
