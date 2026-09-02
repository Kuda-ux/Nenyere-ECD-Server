/**
 * Counting engine component.
 * Renders counting, basic_addition, basic_subtraction.
 * Shows objects to count and number choices.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { CountingActivity, CountingItem } from "../schema/counting";
import type { ItemResponse, ItemResult } from "../schema/common";
import { ContentImage } from "./content-image";

type Props = {
  activity: CountingActivity;
  item: CountingItem;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

export function CountingEngine({ activity, item, onResult, hintLevel }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [tappedCount, setTappedCount] = useState(0);
  const [tappedObjects, setTappedObjects] = useState<Set<number>>(new Set());
  const startTimeRef = useRef(Date.now());

  const handleObjectTap = useCallback((index: number) => {
    if (!activity.tap_to_count) return;
    if (tappedObjects.has(index)) return;
    const newSet = new Set(tappedObjects);
    newSet.add(index);
    setTappedObjects(newSet);
    setTappedCount(newSet.size);
  }, [activity.tap_to_count, tappedObjects]);

  const handleAnswer = useCallback(
    (answer: number) => {
      if (selectedAnswer !== null) return;
      setSelectedAnswer(answer);
      const isCorrect = answer === item.correct_answer;

      const elapsed = Date.now() - startTimeRef.current;
      const response: ItemResponse = {
        item_id: item.id,
        client_response_id: crypto.randomUUID(),
        value: { answer, tapped_count: tappedCount },
        elapsed_ms: elapsed,
        hint_level: Math.min(hintLevel, 2),
      };
      const result: ItemResult = {
        item_id: item.id,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        hint_level: Math.min(hintLevel, 2),
      };

      if (!isCorrect) {
        setShowCorrect(true);
      }

      onResult(response, result);
    },
    [selectedAnswer, item, onResult, hintLevel, tappedCount],
  );

  // Render objects
  const objects = Array.from({ length: item.objects.count }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Operation display for add/subtract */}
      {item.operation !== "count" && item.operands && (
        <div
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {item.operands[0]} {item.operation === "add" ? "+" : "−"} {item.operands[1]} = ?
        </div>
      )}

      {/* Objects to count */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white p-6">
        {objects.map((i) => (
          <button
            key={i}
            onClick={() => handleObjectTap(i)}
            disabled={!activity.tap_to_count || tappedObjects.has(i)}
            className={[
              "flex h-12 w-12 items-center justify-center rounded-lg transition-all",
              tappedObjects.has(i) ? "scale-110 opacity-60" : "hover:scale-105",
            ].join(" ")}
          >
            {item.objects.image ? (
              <ContentImage src={item.objects.image!.en} alt="" containerClassName="h-10 w-10" />
            ) : item.objects.shape ? (
              <CountShape shape={item.objects.shape} colour={item.objects.colour} tapped={tappedObjects.has(i)} />
            ) : (
              <div className="h-8 w-8 rounded-full" style={{ backgroundColor: item.objects.colour ?? "var(--color-brand-sun)" }} />
            )}
          </button>
        ))}
      </div>

      {/* Counter */}
      {activity.show_counter && activity.tap_to_count && (
        <div
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {tappedCount}
        </div>
      )}

      {/* Number line */}
      {activity.show_number_line && (
        <div className="flex gap-1">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <span key={n} className="flex h-8 w-8 items-center justify-center text-sm font-semibold">
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Answer choices */}
      <div className="flex flex-wrap gap-3">
        {item.options.map((num) => {
          const isSelected = selectedAnswer === num;
          const isCorrectAnswer = num === item.correct_answer;
          const showAsCorrect = showCorrect && isCorrectAnswer;
          const showAsWrong = isSelected && !isCorrectAnswer;

          return (
            <button
              key={num}
              onClick={() => handleAnswer(num)}
              disabled={selectedAnswer !== null}
              className={[
                "flex h-16 w-16 items-center justify-center rounded-2xl border-4 text-2xl font-bold transition-all active:scale-95",
                showAsCorrect
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                  : showAsWrong
                    ? "border-[var(--color-danger)] bg-[var(--color-danger)]/10"
                    : "border-[var(--color-surface-2)] bg-white hover:border-[var(--color-brand-sun)]",
              ].join(" ")}
              style={{ fontFamily: "var(--font-kids)" }}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CountShape({ shape, colour, tapped }: { shape: string; colour?: string; tapped: boolean }) {
  const fill = tapped ? "var(--color-success)" : (colour ?? "var(--color-brand-sun)");
  const size = 32;
  switch (shape) {
    case "circle":
      return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-2} fill={fill} /></svg>;
    case "square":
      return <svg width={size} height={size}><rect x={2} y={2} width={size-4} height={size-4} fill={fill} rx={4} /></svg>;
    case "triangle":
      return <svg width={size} height={size}><polygon points={`${size/2},2 ${size-2},${size-2} 2,${size-2}`} fill={fill} /></svg>;
    case "star":
      return <svg width={size} height={size}><polygon points="16,2 19,12 30,12 21,19 24,30 16,23 8,30 11,19 2,12 13,12" fill={fill} /></svg>;
    default:
      return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-2} fill={fill} /></svg>;
  }
}
