"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActivityRunner } from "@/engine";
import { getActivityById } from "@/lib/activity-catalog";
import { recordActivityCompletion } from "@/lib/dev-tracker";
import { Confetti } from "@/components/kids/confetti";
import { useSound } from "@/hooks/use-sound";

function PlayActivityContent({ params }: { params: Promise<{ activityId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const learnerId = searchParams.get("learner") ?? "tari";
  const { play, unlock } = useSound();
  const [completed, setCompleted] = useState(false);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [completionResult, setCompletionResult] = useState<{ stars: number; accuracy: number } | null>(null);

  params.then((p) => setActivityId(p.activityId));

  // Play fanfare + star sounds when completed becomes true
  useEffect(() => {
    if (completed && completionResult) {
      play("fanfare");
      const earnedStars = completionResult.stars;
      for (let i = 0; i < earnedStars; i++) {
        const timer = setTimeout(() => play("star"), 400 + i * 200);
        return () => clearTimeout(timer);
      }
    }
  }, [completed, completionResult, play]);

  if (!activityId) {
    return (
      <div className="kids-bg-playful flex min-h-screen items-center justify-center">
        <p className="text-xl text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p>
      </div>
    );
  }

  const activity = getActivityById(activityId);

  if (!activity) {
    return (
      <div className="kids-bg-playful flex min-h-screen flex-col items-center justify-center gap-6">
        <div className="text-7xl anim-float" aria-hidden="true">🔍</div>
        <p className="text-2xl font-bold text-[var(--color-ink-900)]" style={{ fontFamily: "var(--font-kids)" }}>
          Activity not found
        </p>
        <button
          onClick={() => { play("tap"); router.push("/kids/dashboard"); }}
          className="kids-btn px-8 py-4 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          Back to Play
        </button>
      </div>
    );
  }

  if (completed) {
    const earnedStars = completionResult?.stars ?? 1;
    return (
      <div className="kids-bg-rainbow relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden">
        {/* Confetti celebration */}
        <Confetti count={50} />

        {/* Celebration emoji */}
        <div className="text-8xl anim-bounce-in" aria-hidden="true">🎉</div>

        {/* Completion message */}
        <p className="text-3xl font-bold text-[var(--color-ink-900)] anim-bounce-in anim-delay-1" style={{ fontFamily: "var(--font-kids)" }}>
          Activity complete!
        </p>
        <p className="text-lg text-[var(--color-ink-700)] anim-slide-up anim-delay-2" style={{ fontFamily: "var(--font-kids)" }}>
          You did it! So clever! 🌟
        </p>

        {/* Stars earned */}
        <div className="flex gap-3 anim-delay-3">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`text-6xl ${s <= earnedStars ? "anim-star-burst" : ""}`}
              style={{
                color: s <= earnedStars ? "var(--color-brand-sun)" : "var(--color-surface-2)",
                animationDelay: `${s * 0.15}s`,
              }}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row anim-slide-up anim-delay-4">
          <button
            onClick={() => { play("pop"); setCompleted(false); }}
            className="kids-btn px-6 py-3 text-base text-white shadow-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          >
            🔄 Play Again
          </button>
          <button
            onClick={() => { play("chime"); router.push(`/kids/profile?learner=${learnerId}`); }}
            className="kids-btn px-6 py-3 text-base text-white shadow-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #9B59D0, #6C5CE7)" }}
          >
            📊 My Progress
          </button>
          <button
            onClick={() => { play("tap"); router.push("/kids/dashboard"); }}
            className="kids-btn border-4 px-6 py-3 text-base text-[var(--color-ink-900)] shadow-md transition-all hover:scale-105"
            style={{ borderColor: "var(--color-brand-msasa)", backgroundColor: "white" }}
          >
            🏠 Back to Play
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kids-bg-playful min-h-screen">
      <ActivityRunner
        activity={activity}
        onExit={() => router.push("/kids/dashboard")}
        onComplete={(result) => {
          unlock();
          recordActivityCompletion(learnerId, activityId, result.accuracy, activity.skills);
          setCompletionResult({ stars: result.stars, accuracy: result.accuracy });
          setCompleted(true);
        }}
      />
    </div>
  );
}

export default function PlayActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
  return (
    <Suspense fallback={<div className="kids-bg-playful flex min-h-screen items-center justify-center"><p className="text-xl text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p></div>}>
      <PlayActivityContent params={params} />
    </Suspense>
  );
}
