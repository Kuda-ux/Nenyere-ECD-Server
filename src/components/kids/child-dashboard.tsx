"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { PILLARS, type PillarKey } from "@/lib/activity-catalog";
import { getLearnerStats } from "@/lib/dev-tracker";

const PILLAR_ROUTES: Record<PillarKey, string> = {
  cognitive: "/kids/explore/cognitive",
  "pre-writing": "/kids/explore/pre-writing",
  mathematics: "/kids/explore/mathematics",
  literacy: "/kids/explore/literacy",
  "indigenous-language": "/kids/explore/indigenous-language",
  science: "/kids/explore/science",
  "social-studies": "/kids/explore/social-studies",
  "social-emotional": "/kids/explore/social-emotional",
  creativity: "/kids/explore/creativity",
  physical: "/kids/explore/physical",
  stories: "/kids/stories",
  themes: "/kids/explore/themes",
};

export function ChildDashboard({ learnerId }: { learnerId: string }) {
  const router = useRouter();
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stats, setStats] = useState<{ totalStars: number; totalActivities: number } | null>(null);

  useEffect(() => {
    const s = getLearnerStats(learnerId);
    setStats({ totalStars: s.totalStars, totalActivities: s.totalActivities });
  }, [learnerId]);

  if (!learnerId) {
    router.push("/kids");
    return null;
  }

  function handleExitHoldStart() {
    setExitProgress(0);
    let elapsed = 0;
    holdTimer.current = setInterval(() => {
      elapsed += 100;
      setExitProgress(elapsed / 2000);
      if (elapsed >= 2000) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        router.push("/kids");
      }
    }, 100);
  }

  function handleExitHoldEnd() {
    if (holdTimer.current) clearInterval(holdTimer.current);
    setExitProgress(0);
  }

  function handlePillarClick(pillar: PillarKey) {
    router.push(PILLAR_ROUTES[pillar]);
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "var(--color-surface-0)",
        fontFamily: "var(--font-kids)",
      }}
    >
      {/* Exit gate — hold 2s */}
      <button
        className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full text-2xl text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-surface-1)]"
        onPointerDown={handleExitHoldStart}
        onPointerUp={handleExitHoldEnd}
        onPointerLeave={handleExitHoldEnd}
        aria-label="Hold to exit"
      >
        ←
        {exitProgress > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24" cy="24" r="22"
              fill="none"
              stroke="var(--color-brand-sun)"
              strokeWidth="3"
              strokeDasharray={`${exitProgress * 138.2} 138.2`}
            />
          </svg>
        )}
      </button>

      {/* Greeting */}
      <div className="flex flex-col items-center gap-2 px-6 pt-12 pb-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          ⭐
        </div>
        <h1
          className="text-3xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Let&apos;s play!
        </h1>
        <p className="text-sm text-[var(--color-ink-500)]">
          Choose what to learn today
        </p>
        {stats && (
          <div className="mt-2 flex gap-4">
            <button
              onClick={() => router.push(`/kids/profile?learner=${learnerId}`)}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition-all hover:scale-105"
              style={{ backgroundColor: "var(--color-brand-sun)", color: "white" }}
            >
              ⭐ {stats.totalStars} stars · 🎯 {stats.totalActivities} activities
            </button>
            <button
              onClick={() => router.push(`/kids/rewards?learner=${learnerId}`)}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition-all hover:scale-105"
              style={{ backgroundColor: "var(--color-brand-jacaranda)", color: "white" }}
            >
              🏆 Badges
            </button>
          </div>
        )}
      </div>

      {/* Pillar tiles */}
      <div className="flex flex-1 items-start justify-center px-4 pb-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {PILLARS.map((pillar) => (
            <button
              key={pillar.key}
              onClick={() => handlePillarClick(pillar.key)}
              className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: "white",
                border: `3px solid ${pillar.color}`,
                minHeight: "130px",
                minWidth: "120px",
              }}
            >
              <span className="text-4xl" aria-hidden="true">
                {pillar.emoji}
              </span>
              <span
                className="text-base font-bold"
                style={{ color: "var(--color-ink-900)" }}
              >
                {pillar.label}
              </span>
              <span className="text-center text-xs text-[var(--color-ink-500)]">
                {pillar.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
