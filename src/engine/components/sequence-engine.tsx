/**
 * Sequence engine — tap the pictures in the right order.
 * Tablet-friendly, big touch targets, shows progress + numbered slots.
 */
"use client";
import { useState, useMemo, useCallback } from "react";
import type { EngineComponentProps } from "./registry";
import { EmojiText } from "./emoji-text";
import { useSound } from "@/hooks/use-sound";

interface SeqStep {
  id: string;
  label?: { en: string };
  text?: { en: string };
  emoji?: string;
  correct_order?: number;
}

const FALLBACK_STEPS: SeqStep[] = [
  { id: "s1", label: { en: "Seed" }, correct_order: 1, emoji: "🌱" },
  { id: "s2", label: { en: "Sprout" }, correct_order: 2, emoji: "🌿" },
  { id: "s3", label: { en: "Flower" }, correct_order: 3, emoji: "🌸" },
];

export function SequenceEngine({ activity, itemIndex = 0, onResult }: EngineComponentProps) {
  const a = activity as unknown as { items?: Array<{ id: string; steps: SeqStep[] }> };
  const { play: playSound } = useSound();
  const item = a.items?.[itemIndex] ?? a.items?.[0];
  const steps = useMemo<SeqStep[]>(() => item?.steps ?? FALLBACK_STEPS, [item]);

  const [shuffled, setShuffled] = useState<SeqStep[]>(() => [...steps].sort(() => Math.random() - 0.5));
  const [placed, setPlaced] = useState<number>(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const orderOf = useCallback(
    (step: SeqStep) => step.correct_order ?? steps.indexOf(step) + 1,
    [steps],
  );

  const handleStepClick = (step: SeqStep) => {
    const stepOrder = orderOf(step);
    if (stepOrder === placed + 1) {
      playSound("correct");
      const next = placed + 1;
      setPlaced(next);
      if (next === steps.length) {
        const response = {
          item_id: item?.id ?? "sequence",
          client_response_id: crypto.randomUUID(),
          value: { ordered_step_ids: steps.map((s) => s.id), wrong_attempts: wrongAttempts },
          elapsed_ms: Date.now(),
          hint_level: 0,
        };
        const result = { item_id: item?.id ?? "sequence", is_correct: true, score: 1, hint_level: 0 };
        setTimeout(() => onResult(response, result), 800);
      }
    } else {
      playSound("wrong");
      setWrongAttempts((n) => n + 1);
      setWrongId(step.id);
      setTimeout(() => setWrongId(null), 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
        Tap the pictures in the right order! ({placed} / {steps.length})
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {shuffled.map((step) => {
          const stepOrder = orderOf(step);
          const isDone = stepOrder <= placed;
          const isWrong = wrongId === step.id;
          const text = step.label?.en ?? step.text?.en ?? "";
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step)}
              disabled={isDone}
              className={[
                "flex flex-col items-center gap-2 rounded-3xl border-4 p-3 transition-all shadow-md sm:p-5",
                isDone ? "" : "active:scale-95",
                isWrong ? "anim-shake" : "",
              ].join(" ")}
              style={{
                borderColor: isDone ? "#5BA85B" : isWrong ? "#E85D5D" : "#E0E0E0",
                opacity: isDone ? 0.55 : 1,
                backgroundColor: isDone ? "#E8F5E9" : "var(--color-surface-0)",
                minWidth: "clamp(90px, 26vw, 120px)",
                minHeight: "clamp(110px, 30vw, 140px)",
              }}
            >
              <EmojiText text={text} emojiClassName="text-5xl sm:text-6xl" labelClassName="text-sm font-bold text-[var(--color-ink-700)] sm:text-base" />
              {isDone && <span className="text-lg font-bold text-green-600">✓ #{stepOrder}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
