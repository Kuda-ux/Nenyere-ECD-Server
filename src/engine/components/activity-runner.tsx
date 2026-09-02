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
        <div className="text-5xl" aria-hidden="true">🎉</div>
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
          All done!
        </p>
        <button
          onClick={handleExit}
          className="rounded-xl bg-[var(--color-brand-sun)] px-8 py-3 font-bold text-white active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Back to Play
        </button>
      </div>
    );
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  if (state.phase === "summary") {
    return (
      <div className="flex flex-col items-center gap-6 py-16">
        <div className="text-6xl" aria-hidden="true">
          {state.stars === 3 ? "⭐⭐⭐" : state.stars === 2 ? "⭐⭐" : "⭐"}
        </div>
        <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
          {state.stars === 3 ? "Amazing!" : state.stars === 2 ? "Great job!" : "Good try!"}
        </p>
        <p className="text-lg text-ink-500" style={{ fontFamily: "var(--font-kids)" }}>
          You got {state.itemsCorrect} out of {state.itemsTotal} right!
        </p>
        <div className="flex gap-3">
          <button
            onClick={finish}
            className="rounded-xl bg-[var(--color-brand-sun)] px-8 py-3 font-bold text-white active:scale-95"
            style={{ fontFamily: "var(--font-kids)" }}
          >
            Done ★
          </button>
          <button
            onClick={handleExit}
            className="rounded-xl border-2 border-[var(--color-surface-2)] px-6 py-3 font-semibold active:scale-95"
            style={{ fontFamily: "var(--font-kids)" }}
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
          className="flex h-24 w-24 items-center justify-center rounded-3xl text-5xl"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          ⭐
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
          {activity.title.en}
        </h1>
        {activity.description && (
          <p className="max-w-md text-center text-lg text-ink-500" style={{ fontFamily: "var(--font-kids)" }}>
            {activity.description.en}
          </p>
        )}
        <button
          onClick={start}
          className="rounded-2xl bg-[var(--color-brand-sun)] px-12 py-4 text-xl font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Let&apos;s Play! ▶
        </button>
        <button
          onClick={handleExit}
          className="text-sm text-ink-500 underline-offset-4 hover:underline"
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
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          📢
        </div>
        <p className="max-w-md text-center text-2xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
          {activity.instructions.text.en}
        </p>
        {activity.instructions.demo !== "none" && (
          <p className="text-sm text-ink-500" style={{ fontFamily: "var(--font-kids)" }}>
            Watch how to play!
          </p>
        )}
        <button
          onClick={instructionDone}
          className="rounded-2xl bg-[var(--color-brand-sun)] px-10 py-3 text-lg font-bold text-white active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
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
        <div className="text-6xl" aria-hidden="true">
          {isCorrect ? "✅" : "💪"}
        </div>
        <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
          {pick.text.en}
        </p>
        <button
          onClick={feedbackDone}
          className="rounded-2xl bg-[var(--color-brand-sun)] px-10 py-3 text-lg font-bold text-white active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
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
          onClick={audio.toggleMute}
          className="absolute right-4 top-4 text-2xl"
          aria-label={audio.muted ? "Unmute" : "Mute"}
        >
          {audio.muted ? "🔇" : "🔊"}
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
