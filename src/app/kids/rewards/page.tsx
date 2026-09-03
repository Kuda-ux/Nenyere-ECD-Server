"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { getAllBadges, getLearnerStats } from "@/lib/dev-tracker";

function RewardsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const learnerId = params.get("learner") ?? "tari";
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [badges, setBadges] = useState<ReturnType<typeof getAllBadges> | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getLearnerStats> | null>(null);

  useEffect(() => {
    setBadges(getAllBadges(learnerId));
    setStats(getLearnerStats(learnerId));
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
          <span className="text-4xl" aria-hidden="true">🏆</span>
          <h1 className="text-2xl font-bold text-[var(--color-ink-900)]">My Stars</h1>
        </div>
      </div>

      {/* Stars summary */}
      <div className="flex flex-col items-center gap-2 px-6 py-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className="text-5xl"
              style={{ color: stats && stats.totalStars >= s ? "var(--color-brand-sun)" : "var(--color-surface-2)" }}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-xl font-bold text-[var(--color-ink-900)]">
          {stats ? `${stats.totalStars} stars earned!` : "0 stars earned!"}
        </p>
        {stats && (
          <button
            onClick={() => router.push(`/kids/profile?learner=${learnerId}`)}
            className="mt-2 rounded-full px-6 py-2 text-sm font-bold transition-all hover:scale-105"
            style={{ backgroundColor: "var(--color-brand-jacaranda)", color: "white" }}
          >
            📊 View My Progress
          </button>
        )}
      </div>

      {/* Badges grid */}
      <div className="flex flex-1 items-start justify-center px-6 pb-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {(badges ?? []).map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6"
              style={{
                border: `3px solid ${badge.earned ? "var(--color-brand-sun)" : "var(--color-surface-2)"}`,
                minHeight: "140px",
                minWidth: "120px",
                opacity: badge.earned ? 1 : 0.5,
              }}
            >
              <span className="text-5xl" aria-hidden="true">{badge.emoji}</span>
              <span className="text-center text-lg font-bold text-[var(--color-ink-900)]">
                {badge.label}
              </span>
              <span className="text-center text-xs text-[var(--color-ink-500)]">
                {badge.description}
              </span>
              {badge.earned && (
                <span className="text-xs font-medium text-[var(--color-brand-sun)]">Earned!</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>}>
      <RewardsContent />
    </Suspense>
  );
}
