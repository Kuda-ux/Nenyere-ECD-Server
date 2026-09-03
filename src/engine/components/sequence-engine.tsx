"use client";
import { useState, useEffect } from "react";
import type { EngineComponentProps } from "./registry";

interface SeqStep { id: string; label: { en: string; sn?: string; nd?: string }; correct_order: number; emoji?: string; }

export function SequenceEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as { items: Array<{ id: string; steps: SeqStep[] }> };
  const item = a.items?.[0];
  const steps = item?.steps ?? [
    { id: "s1", label: { en: "Seed", sn: "Mbeu", nd: "Insimbi" }, correct_order: 1, emoji: "🌱" },
    { id: "s2", label: { en: "Sprout", sn: "Mudzi", nd: "Khumula" }, correct_order: 2, emoji: "🌿" },
    { id: "s3", label: { en: "Flower", sn: "Ruva", nd: "Inhlamvu" }, correct_order: 3, emoji: "🌸" },
  ];
  const [shuffled, setShuffled] = useState<SeqStep[]>([]);
  const [placed, setPlaced] = useState<number>(0);

  useEffect(() => {
    setShuffled([...steps].sort(() => Math.random() - 0.5));
  }, [steps]);

  const handleStepClick = (step: SeqStep) => {
    if (step.correct_order === placed + 1) {
      setPlaced((prev) => {
        const next = prev + 1;
        if (next === steps.length) {
          const response = { item_id: item?.id ?? "sequence", client_response_id: crypto.randomUUID(), value: { completed: true }, elapsed_ms: Date.now(), hint_level: 0 };
          const result = { item_id: item?.id ?? "sequence", is_correct: true, score: 1, hint_level: 0 };
          onResult(response, result);
        }
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-kids)" }}>
        Tap the pictures in the right order! ({placed} / {steps.length})
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        {shuffled.map((step) => {
          const isDone = step.correct_order <= placed;
          const isNext = step.correct_order === placed + 1;
          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step)}
              disabled={isDone}
              className="flex flex-col items-center gap-1 rounded-2xl border-4 p-4 transition-all"
              style={{
                borderColor: isDone ? "#5BA85B" : isNext ? "#F2A93B" : "#E0E0E0",
                opacity: isDone ? 0.5 : 1,
                cursor: isDone ? "default" : "pointer",
                backgroundColor: isDone ? "#E8F5E9" : "var(--color-surface-0)",
              }}
            >
              <span className="text-4xl">{step.emoji ?? "❓"}</span>
              <span className="text-sm font-medium">{step.label.en}</span>
              {isDone && <span className="text-xs text-green-600">✓ #{step.correct_order}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
