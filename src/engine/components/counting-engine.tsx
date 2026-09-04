/**
 * Counting engine component — Enhanced with themed objects, tap sounds,
 * animated counter, and playful visuals.
 * Renders counting, basic_addition, basic_subtraction.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { CountingActivity, CountingItem } from "../schema/counting";
import type { ItemResponse, ItemResult } from "../schema/common";
import { ContentImage } from "./content-image";
import { useSound } from "@/hooks/use-sound";

const NUMBER_GRADIENTS = [
  "linear-gradient(135deg, #FF6B9D, #FFC4D6)",
  "linear-gradient(135deg, #4FC3F7, #81D4FA)",
  "linear-gradient(135deg, #FFB627, #FFE082)",
  "linear-gradient(135deg, #4CAF50, #A5D6A7)",
  "linear-gradient(135deg, #9B59D0, #D4C5F9)",
];

const SHAPE_EMOJI: Record<string, string> = {
  star: "⭐",
  circle: "🔵",
  square: "🟦",
  triangle: "🔺",
  heart: "❤️",
  diamond: "💎",
  apple: "🍎",
  flower: "🌸",
  ball: "⚽",
  cat: "🐱",
  dog: "🐶",
  fish: "🐟",
  bird: "🐦",
  car: "🚗",
  sun: "☀️",
  moon: "🌙",
  leaf: "🍃",
  bug: "🐛",
};

type Props = {
  activity: CountingActivity;
  item: CountingItem;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

export function CountingEngine({ activity, item, onResult, hintLevel }: Props) {
  const { play: playSound } = useSound();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [tappedCount, setTappedCount] = useState(0);
  const [tappedObjects, setTappedObjects] = useState<Set<number>>(new Set());
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const startTimeRef = useRef(Date.now());

  const handleObjectTap = useCallback((index: number) => {
    if (!activity.tap_to_count) return;
    if (tappedObjects.has(index)) return;
    const newSet = new Set(tappedObjects);
    newSet.add(index);
    setTappedObjects(newSet);
    setTappedCount(newSet.size);
    playSound("pop");
  }, [activity.tap_to_count, tappedObjects, playSound]);

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
        setWrongAnswer(answer);
        playSound("wrong");
      } else {
        playSound("correct");
      }

      onResult(response, result);
    },
    [selectedAnswer, item, onResult, hintLevel, tappedCount, playSound],
  );

  const objects = Array.from({ length: item.objects.count }, (_, i) => i);
  const shapeEmoji = item.objects.shape ? SHAPE_EMOJI[item.objects.shape] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Operation display for add/subtract */}
      {item.operation !== "count" && item.operands && (
        <div
          className="flex items-center gap-3 rounded-2xl px-6 py-3 shadow-md anim-slide-in-up"
          style={{ background: "linear-gradient(135deg, #FFF9E6, #FFE082)" }}
        >
          <span className="text-4xl">{item.objects.shape ? (SHAPE_EMOJI[item.objects.shape] ?? "⭐") : "⭐"}</span>
          <span className="text-3xl font-bold text-[var(--color-ink-900)]" style={{ fontFamily: "var(--font-kids)" }}>
            {item.operands[0]} {item.operation === "add" ? "+" : "−"} {item.operands[1]} = ?
          </span>
        </div>
      )}

      {/* Objects to count — themed container */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 rounded-3xl p-8 shadow-inner"
        style={{ background: "linear-gradient(135deg, #F8F9FF, #E3F2FD)" }}
      >
        {objects.map((i) => {
          const isTapped = tappedObjects.has(i);
          return (
            <button
              key={i}
              onClick={() => handleObjectTap(i)}
              disabled={!activity.tap_to_count || isTapped}
              className={[
                "flex items-center justify-center rounded-2xl transition-all",
                isTapped ? "scale-110 anim-pop-scale" : "hover:scale-105",
              ].join(" ")}
              style={{
                width: 60,
                height: 60,
                background: isTapped ? "rgba(76, 175, 80, 0.15)" : "rgba(255, 255, 255, 0.6)",
                border: isTapped ? "3px solid var(--color-success)" : "2px solid transparent",
              }}
            >
              {item.objects.image ? (
                <ContentImage src={item.objects.image!.en} alt="" containerClassName="h-10 w-10" />
              ) : shapeEmoji ? (
                <span className="text-3xl" style={{ filter: isTapped ? "saturate(1.5)" : "none" }}>
                  {shapeEmoji}
                </span>
              ) : item.objects.shape ? (
                <CountShape shape={item.objects.shape} colour={item.objects.colour} tapped={isTapped} />
              ) : (
                <div className="h-8 w-8 rounded-full" style={{ backgroundColor: item.objects.colour ?? "var(--color-brand-sun)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Animated counter */}
      {activity.tap_to_count && (
        <div
          className="flex items-center gap-2 rounded-full px-6 py-2 shadow-md"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          <span className="text-2xl">👆</span>
          <span
            key={tappedCount}
            className="text-3xl font-bold text-white anim-pop-scale"
            style={{ fontFamily: "var(--font-kids)" }}
          >
            {tappedCount}
          </span>
        </div>
      )}

      {/* Number line — themed */}
      {activity.show_number_line && (
        <div className="flex flex-wrap justify-center gap-1 rounded-xl bg-white/60 p-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold transition-all",
                tappedCount === n ? "scale-125 bg-[var(--color-brand-sun)] text-white shadow-md" : "text-[var(--color-ink-600)]",
              ].join(" ")}
              style={{ fontFamily: "var(--font-kids)" }}
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Answer choices — gradient buttons */}
      <div className="flex flex-wrap gap-3">
        {item.options.map((num, idx) => {
          const isCorrectAnswer = num === item.correct_answer;
          const showAsCorrect = showCorrect && isCorrectAnswer;
          const showAsWrong = wrongAnswer === num;
          const gradient = NUMBER_GRADIENTS[idx % NUMBER_GRADIENTS.length];

          return (
            <button
              key={num}
              onClick={() => handleAnswer(num)}
              disabled={selectedAnswer !== null}
              className={[
                "flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-bold transition-all active:scale-95 shadow-md",
                "anim-pop-scale",
                showAsCorrect
                  ? "ring-4 ring-[var(--color-success)] anim-wobble"
                  : showAsWrong
                    ? "ring-4 ring-[var(--color-danger)] anim-shake"
                    : "hover:scale-105 hover:shadow-xl",
              ].join(" ")}
              style={{
                fontFamily: "var(--font-kids)",
                background: showAsCorrect ? "linear-gradient(135deg, #4CAF50, #A5D6A7)" : showAsWrong ? "linear-gradient(135deg, #EF5350, #FFCDD2)" : gradient,
                color: "white",
                animationDelay: `${idx * 0.08}s`,
              }}
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
  const size = 36;
  switch (shape) {
    case "circle":
      return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-2} fill={fill} /></svg>;
    case "square":
      return <svg width={size} height={size}><rect x={2} y={2} width={size-4} height={size-4} fill={fill} rx={4} /></svg>;
    case "triangle":
      return <svg width={size} height={size}><polygon points={`${size/2},2 ${size-2},${size-2} 2,${size-2}`} fill={fill} /></svg>;
    case "star":
      return <svg width={size} height={size}><polygon points="18,2 22,14 34,14 24,22 28,34 18,26 8,34 12,22 2,14 14,14" fill={fill} /></svg>;
    default:
      return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-2} fill={fill} /></svg>;
  }
}
