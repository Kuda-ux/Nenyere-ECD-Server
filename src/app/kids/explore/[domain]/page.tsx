"use client";

import { useRouter } from "next/navigation";
import { getActivitiesByPillar, toActivityCard, PILLARS, type PillarKey } from "@/lib/activity-catalog";
import { useState, useRef } from "react";
import { useSound } from "@/hooks/use-sound";

const VALID_PILLARS = new Set(PILLARS.map((p) => p.key));

const ACTIVITY_CARD_COLORS = [
  "linear-gradient(135deg, #FFB627, #FF9F43)",
  "linear-gradient(135deg, #4FC3F7, #6C5CE7)",
  "linear-gradient(135deg, #FF6B9D, #E84393)",
  "linear-gradient(135deg, #4CAF50, #00B894)",
  "linear-gradient(135deg, #9B59D0, #B388FF)",
  "linear-gradient(135deg, #FF6B35, #FF5252)",
  "linear-gradient(135deg, #26D0A8, #00B894)",
  "linear-gradient(135deg, #FFEB3B, #FF9F43)",
];

export default function ExplorePage({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();
  const { play, unlock } = useSound();
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pillar, setPillar] = useState<PillarKey | null>(null);

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
      <div className="kids-bg-playful flex min-h-screen items-center justify-center">
        <p className="text-xl text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p>
      </div>
    );
  }

  const pillarInfo = PILLARS.find((p) => p.key === pillar)!;
  const activities = getActivitiesByPillar(pillar).map(toActivityCard);

  return (
    <div
      className="kids-bg-playful relative flex min-h-screen flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-kids)" }}
    >
      {/* Top bar with back button */}
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: pillarInfo.color }}
          onPointerDown={() => { unlock(); handleExitHoldStart(); }}
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
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-lg anim-bounce-in"
          style={{ background: pillarInfo.gradient }}
        >
          <span className="text-4xl" aria-hidden="true">{pillarInfo.emoji}</span>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white drop-shadow-md">{pillarInfo.label}</h1>
            <p className="text-xs text-white/80">{pillarInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Activity tiles */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto kids-scroll px-6 pb-8 pt-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-20 anim-bounce-in">
            <span className="text-7xl anim-float" aria-hidden="true">🎯</span>
            <p className="text-xl text-[var(--color-ink-500)]">No activities yet. Coming soon! 🌟</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {activities.map((activity, i) => (
              <button
                key={activity.id}
                onClick={() => { play("pop"); router.push(`/kids/play/${activity.id}`); }}
                className={`kids-card flex flex-col items-center gap-3 p-6 anim-pop-in`}
                style={{
                  background: ACTIVITY_CARD_COLORS[i % ACTIVITY_CARD_COLORS.length],
                  minHeight: "170px",
                  minWidth: "150px",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <span className="text-5xl drop-shadow-md" aria-hidden="true">{activity.emoji}</span>
                <span className="text-center text-base font-bold text-white drop-shadow-md">
                  {activity.title}
                </span>
                {/* Level badge */}
                <span className="rounded-full bg-white/30 px-3 py-0.5 text-xs font-bold text-white">
                  {activity.ecd_level.replace("_", " ")}
                </span>
                {/* Star indicator */}
                <div className="flex gap-1" aria-label="Stars earned">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`text-lg ${s <= activity.stars ? "text-white" : "text-white/30"}`}
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
