/**
 * ActivityRunner — the main UI shell that orchestrates activity phases.
 * Enhanced with animated mascot, progress visuals, and playful transitions.
 * Per docs/activity-engine.md §5: INTRO → INSTRUCTION → ACTIVITY → FEEDBACK → SUMMARY
 */
"use client";

import { useCallback, useEffect } from "react";
import { useActivityRunner } from "../runner/use-activity-runner";
import { getEngineComponent } from "./registry";
import type { AnyActivity } from "../schema";
import type { ItemResponse, ItemResult } from "../schema/common";
import { useSound } from "@/hooks/use-sound";
import { Mascot } from "@/components/kids/mascot";

type Props = {
  activity: AnyActivity;
  onExit: () => void;
  onComplete?: (result: {
    accuracy: number;
    stars: number;
    itemsTotal: number;
    itemsCorrect: number;
  }) => void;
};

export function ActivityRunner({ activity, onExit, onComplete }: Props) {
  const {
    state,
    start,
    instructionDone,
    submitResponse,
    feedbackDone,
    finish,
    exit,
    audio,
  } = useActivityRunner(activity);

  const { play: playSound, unlock: unlockSound, muted: soundMuted, toggleMute: toggleSoundMute, startMusic, stopMusic } = useSound();

  // Start gentle background music during activity
  useEffect(() => {
    if (state.phase === "activity") {
      startMusic();
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [state.phase, startMusic, stopMusic]);

  const handleResult = useCallback(
    (response: ItemResponse, result: ItemResult) => {
      submitResponse(response, result);
    },
    [submitResponse],
  );

  const handleExit = useCallback(() => {
    stopMusic();
    exit();
    onExit();
  }, [exit, onExit, stopMusic]);

  // ── COMPLETED ─────────────────────────────────────────────────────────────
  if (state.phase === "completed") {
    if (onComplete) {
      onComplete({
        accuracy: state.accuracy,
        stars: state.stars,
        itemsTotal: state.itemsTotal,
        itemsCorrect: state.itemsCorrect,
      });
    }
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <Mascot mood="celebrating" size={100} />
        <p className="text-3xl font-bold text-[var(--color-ink-900)] anim-bounce-in" style={{ fontFamily: "var(--font-kids)" }}>
          All done! You&apos;re a star! 🌟
        </p>
        <button
          onClick={() => { playSound("tap"); handleExit(); }}
          className="kids-btn px-8 py-4 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          🏠 Back to Play
        </button>
      </div>
    );
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  if (state.phase === "summary") {
    const mascotMood = state.stars === 3 ? "celebrating" : state.stars === 2 ? "happy" : "encouraging";
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <Mascot mood={mascotMood} size={100} />
        <div className="flex gap-2" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`text-7xl ${s <= state.stars ? "anim-star-burst-big" : ""}`}
              style={{
                color: s <= state.stars ? "var(--color-brand-sun)" : "var(--color-surface-2)",
                animationDelay: `${s * 0.2}s`,
              }}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-3xl font-bold text-[var(--color-ink-900)] anim-bounce-in anim-delay-1" style={{ fontFamily: "var(--font-kids)" }}>
          {state.stars === 3 ? "Amazing! You&apos;re brilliant! 🌟" : state.stars === 2 ? "Great job! Well done! 👏" : "Good try! Keep going! 💪"}
        </p>
        <p className="text-lg text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>
          You got {state.itemsCorrect} out of {state.itemsTotal} right!
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { playSound("celebrate"); finish(); }}
            className="kids-btn px-8 py-3 text-base text-white shadow-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          >
            Done ★
          </button>
          <button
            onClick={() => { playSound("tap"); handleExit(); }}
            className="kids-btn border-4 px-6 py-3 text-base text-[var(--color-ink-700)] shadow-md transition-all hover:scale-105"
            style={{ borderColor: "var(--color-brand-jacaranda)", backgroundColor: "white" }}
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (state.phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <Mascot mood="happy" size={100} />
        <h1 className="text-3xl font-bold text-[var(--color-ink-900)] anim-bounce-in" style={{ fontFamily: "var(--font-kids)" }}>
          {activity.title.en}
        </h1>
        {activity.description && (
          <p className="max-w-md text-center text-lg text-[var(--color-ink-500)] anim-slide-up anim-delay-1" style={{ fontFamily: "var(--font-kids)" }}>
            {activity.description.en}
          </p>
        )}
        <button
          onClick={() => { unlockSound(); playSound("whoosh"); start(); }}
          className="kids-btn anim-pop-in anim-delay-2 px-12 py-4 text-xl text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #4CAF50, #00B894)" }}
        >
          Let&apos;s Play! ▶
        </button>
        <button
          onClick={() => { playSound("tap"); handleExit(); }}
          className="text-sm text-[var(--color-ink-500)] underline-offset-4 hover:underline"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          ← Exit
        </button>
      </div>
    );
  }

  // ── INSTRUCTION ───────────────────────────────────────────────────────────
  if (state.phase === "instruction") {
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <Mascot mood="thinking" size={80} />
        <p className="max-w-md text-center text-2xl font-bold text-[var(--color-ink-900)] anim-slide-in-up" style={{ fontFamily: "var(--font-kids)" }}>
          {activity.instructions.text.en}
        </p>
        {activity.instructions.demo !== "none" && (
          <p className="text-sm text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>
            👀 Watch how to play!
          </p>
        )}
        <button
          onClick={() => { playSound("chime"); instructionDone(); }}
          className="kids-btn px-10 py-3 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          Ready! ✓
        </button>
      </div>
    );
  }

  // ── FEEDBACK ──────────────────────────────────────────────────────────────
  if (state.phase === "feedback") {
    const isCorrect = state.lastResult?.is_correct ?? false;
    const feedbackPool = isCorrect ? activity.feedback.correct : activity.feedback.encourage;
    const pick = feedbackPool[Math.floor(Math.random() * feedbackPool.length)];

    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <Mascot mood={isCorrect ? "celebrating" : "encouraging"} size={90} />
        <p className="text-3xl font-bold text-[var(--color-ink-900)] anim-bounce-feedback" style={{ fontFamily: "var(--font-kids)" }}>
          {pick.text.en}
        </p>
        <button
          onClick={() => { playSound(isCorrect ? "correct" : "wrong"); feedbackDone(); }}
          className="kids-btn px-10 py-3 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: isCorrect ? "linear-gradient(135deg, #4CAF50, #00B894)" : "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          {isCorrect ? "Next →" : "Try again →"}
        </button>
      </div>
    );
  }

  // ── ACTIVITY ──────────────────────────────────────────────────────────────
  if (state.phase === "activity") {
    const EngineComponent = getEngineComponent(activity.engine);
    const itemCount = getItemCount(activity);
    const progressPercent = itemCount > 0 ? (state.results.length / itemCount) * 100 : 0;

    return (
      <div className="flex flex-col items-center gap-4 py-8">
        {/* Progress bar — themed */}
        <div className="flex w-full max-w-md items-center gap-2">
          <span className="text-2xl" aria-hidden="true">⭐</span>
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
            <div
              className="anim-progress-fill absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #FFB627, #FF9F43, #FF6B6B)",
              }}
            />
          </div>
          <span className="text-sm font-bold text-[var(--color-ink-700)]" style={{ fontFamily: "var(--font-kids)" }}>
            {state.results.length}/{itemCount}
          </span>
        </div>

        {/* Item dots */}
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: itemCount }, (_, i) => (
            <div
              key={i}
              className={[
                "h-3 flex-1 rounded-full transition-all",
                i < state.results.length
                  ? state.results[i]?.is_correct
                    ? "bg-[var(--color-success)]"
                    : "bg-[var(--color-danger)]"
                  : i === state.itemIndex
                    ? "bg-[var(--color-brand-sun)] anim-pulse-glow"
                    : "bg-[var(--color-surface-2)]",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Mute toggle */}
        <button
          onClick={() => { toggleSoundMute(); audio.toggleMute(); }}
          className="absolute right-4 top-4 text-2xl"
          aria-label={audio.muted || soundMuted ? "Unmute" : "Mute"}
        >
          {audio.muted || soundMuted ? "🔇" : "🔊"}
        </button>

        {/* Engine component — keyed by itemIndex to reset state on new item */}
        <EngineComponent
          key={`${activity.id}-${state.itemIndex}`}
          activity={activity}
          itemIndex={state.itemIndex}
          onResult={handleResult}
          hintLevel={state.attempts >= activity.hints.after_incorrect ? 1 : 0}
        />
      </div>
    );
  }

  return null;
}

// ── Helper: get item count per engine ───────────────────────────────────────
function getItemCount(activity: AnyActivity): number {
  if ("items" in activity) return activity.items.length;
  if ("pairs" in activity) return activity.pairs.length;
  if ("cards" in activity) return activity.cards.length / 2;
  if ("pieces" in activity) return activity.pieces.length;
  if ("differences" in activity) return activity.differences.length;
  if ("pages" in activity) return activity.pages.filter((p) => p.interaction).length || 1;
  if ("regions" in activity) return activity.regions.length;
  return 1;
}
