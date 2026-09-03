/**
 * ActivityRunner — the main UI shell that orchestrates activity phases.
 * Per docs/activity-engine.md §5: INTRO → INSTRUCTION → ACTIVITY → FEEDBACK → SUMMARY
 */
"use client";

import { useCallback } from "react";
import { useActivityRunner } from "../runner/use-activity-runner";
import { getEngineComponent } from "./registry";
import type { AnyActivity } from "../schema";
import type { ItemResponse, ItemResult } from "../schema/common";
import { useSound } from "@/hooks/use-sound";

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

  const handleResult = useCallback(
    (response: ItemResponse, result: ItemResult) => {
      submitResponse(response, result);
    },
    [submitResponse],
  );

  const handleExit = useCallback(() => {
    exit();
    onExit();
  }, [exit, onExit]);

  const { play: playSound, unlock: unlockSound, muted: soundMuted, toggleMute: toggleSoundMute } = useSound();

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
        <div className="text-6xl anim-bounce-in" aria-hidden="true">🎉</div>
        <p className="text-2xl font-bold text-[var(--color-ink-900)]" style={{ fontFamily: "var(--font-kids)" }}>
          All done! 🌟
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
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <div className="flex gap-2" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`text-6xl ${s <= state.stars ? "anim-star-burst" : ""}`}
              style={{
                color: s <= state.stars ? "var(--color-brand-sun)" : "var(--color-surface-2)",
                animationDelay: `${s * 0.15}s`,
              }}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-3xl font-bold text-[var(--color-ink-900)] anim-bounce-in anim-delay-1" style={{ fontFamily: "var(--font-kids)" }}>
          {state.stars === 3 ? "Amazing! 🌟" : state.stars === 2 ? "Great job! 👏" : "Good try! 💪"}
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
        <div
          className="anim-float flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          ⭐
        </div>
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
        <div
          className="anim-wobble flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #4FC3F7, #6C5CE7)" }}
          aria-hidden="true"
        >
          📢
        </div>
        <p className="max-w-md text-center text-2xl font-bold text-[var(--color-ink-900)]" style={{ fontFamily: "var(--font-kids)" }}>
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
        <div className={`text-6xl ${isCorrect ? "anim-bounce-in" : "anim-wiggle"}`} aria-hidden="true">
          {isCorrect ? "✅" : "💪"}
        </div>
        <p className="text-3xl font-bold text-[var(--color-ink-900)]" style={{ fontFamily: "var(--font-kids)" }}>
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

    return (
      <div className="flex flex-col items-center gap-4 py-8">
        {/* Progress bar */}
        <div className="flex w-full max-w-md gap-1">
          {Array.from({ length: getItemCount(activity) }, (_, i) => (
            <div
              key={i}
              className={[
                "h-2 flex-1 rounded-full",
                i < state.results.length
                  ? state.results[i]?.is_correct
                    ? "bg-[var(--color-success)]"
                    : "bg-[var(--color-danger)]"
                  : i === state.itemIndex
                    ? "bg-[var(--color-brand-sun)]"
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

        {/* Engine component */}
        <EngineComponent
          activity={activity}
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
