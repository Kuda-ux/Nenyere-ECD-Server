"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getActivitiesByPillar, toActivityCard, PILLARS, type PillarKey } from "@/lib/activity-catalog";
import { Suspense, useState } from "react";
import { useSound } from "@/hooks/use-sound";
import { HoldExitButton } from "@/components/kids/hold-exit-button";

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

function ExploreContent({ params }: { params: Promise<{ domain: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const learnerId = searchParams.get("learner") ?? "";
  const { play } = useSound();
  const [pillar, setPillar] = useState<PillarKey | null>(null);

  params.then((p) => {
    if (VALID_PILLARS.has(p.domain as PillarKey)) {
      setPillar(p.domain as PillarKey);
    }
  });

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
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        <HoldExitButton
          onExit={() => router.push(`/kids/dashboard?learner=${learnerId}`)}
          color={pillarInfo.color}
          label="Hold to go back"
        />
        <div
          className="flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 shadow-lg anim-bounce-in sm:px-5"
          style={{ background: pillarInfo.gradient }}
        >
          <span className="text-3xl sm:text-4xl" aria-hidden="true">{pillarInfo.emoji}</span>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-xl font-bold text-white drop-shadow-md sm:text-2xl">{pillarInfo.label}</h1>
            <p className="hidden text-xs text-white/80 sm:block">{pillarInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Activity tiles */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto kids-scroll px-4 pb-8 pt-4 sm:px-6">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-20 anim-bounce-in">
            <span className="text-7xl anim-float" aria-hidden="true">🎯</span>
            <p className="text-xl text-[var(--color-ink-500)]">No activities yet. Coming soon! 🌟</p>
          </div>
        ) : (
          <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            {activities.map((activity, i) => (
              <button
                key={activity.id}
                onClick={() => { play("pop"); router.push(`/kids/play/${activity.id}?learner=${learnerId}`); }}
                className={`kids-card flex flex-col items-center gap-2 p-3 anim-pop-in sm:gap-3 sm:p-6`}
                style={{
                  background: ACTIVITY_CARD_COLORS[i % ACTIVITY_CARD_COLORS.length],
                  minHeight: "160px",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <span className="text-5xl drop-shadow-lg sm:text-6xl" aria-hidden="true">{activity.emoji}</span>
                <span className="text-center text-base font-bold text-white drop-shadow-md sm:text-lg">
                  {activity.title}
                </span>
                {/* Level badge */}
                <span className="rounded-full bg-white/30 px-3 py-1 text-xs font-bold text-white sm:text-sm">
                  {activity.ecd_level.replace("_", " ")}
                </span>
                {/* Star indicator */}
                <div className="flex gap-1" aria-label="Stars earned">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`text-lg sm:text-xl ${s <= activity.stars ? "text-white" : "text-white/30"}`}
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

export default function ExplorePage({ params }: { params: Promise<{ domain: string }> }) {
  return (
    <Suspense fallback={<div className="kids-bg-playful flex min-h-screen items-center justify-center"><p className="text-xl text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p></div>}>
      <ExploreContent params={params} />
    </Suspense>
  );
}
