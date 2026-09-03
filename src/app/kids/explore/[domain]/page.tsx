"use client";

import { useRouter } from "next/navigation";
import { getActivitiesByPillar, toActivityCard, PILLARS, type PillarKey } from "@/lib/activity-catalog";
import { useState, useRef } from "react";

const VALID_PILLARS = new Set(PILLARS.map((p) => p.key));

export default function ExplorePage({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pillar, setPillar] = useState<PillarKey | null>(null);

  // Unwrap params promise
  params.then((p) => {
    if (VALID_PILLARS.has(p.domain as PillarKey)) {
      setPillar(p.domain as PillarKey);
    }
  });

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

  if (!pillar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-0)]">
        <p className="text-lg text-[var(--color-ink-500)]">Loading...</p>
      </div>
    );
  }

  const pillarInfo = PILLARS.find((p) => p.key === pillar)!;
  const activities = getActivitiesByPillar(pillar).map(toActivityCard);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "var(--color-surface-0)",
        fontFamily: "var(--font-kids)",
      }}
    >
      {/* Top bar with back button */}
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          className="flex h-12 w-12 items-center justify-center rounded-full text-2xl text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-surface-1)]"
          onPointerDown={handleExitHoldStart}
          onPointerUp={handleExitHoldEnd}
          onPointerLeave={handleExitHoldEnd}
          aria-label="Hold to go back"
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
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">{pillarInfo.emoji}</span>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[var(--color-ink-900)]">{pillarInfo.label}</h1>
            <p className="text-xs text-[var(--color-ink-500)]">{pillarInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Activity tiles */}
      <div className="flex flex-1 items-start justify-center px-6 pb-8 pt-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-20">
            <span className="text-6xl" aria-hidden="true">🎯</span>
            <p className="text-xl text-[var(--color-ink-500)]">No activities yet. Coming soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => router.push(`/kids/play/${activity.id}`)}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 transition-all hover:shadow-lg active:scale-95"
                style={{
                  border: `3px solid ${pillarInfo.color}`,
                  minHeight: "160px",
                  minWidth: "140px",
                }}
              >
                <span className="text-5xl" aria-hidden="true">{activity.emoji}</span>
                <span className="text-center text-lg font-bold text-[var(--color-ink-900)]">
                  {activity.title}
                </span>
                {/* Level badge */}
                <span className="rounded-full bg-[var(--color-surface-1)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-500)]">
                  {activity.ecd_level.replace("_", " ")}
                </span>
                {/* Star indicator */}
                <div className="flex gap-1" aria-label="Stars earned">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`text-lg ${s <= activity.stars ? "text-[var(--color-brand-sun)]" : "text-[var(--color-surface-2)]"}`}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
