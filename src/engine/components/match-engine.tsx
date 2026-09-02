/**
 * Match engine component.
 * Renders matching, shape_matching, colour_identification, classification.
 * Two-column layout: tap left then tap right to connect.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { MatchActivity, MatchPair } from "../schema/match";
import type { ItemResponse, ItemResult } from "../schema/common";
import { ContentImage } from "./content-image";

type Props = {
  activity: MatchActivity;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

export function MatchEngine({ activity, onResult, hintLevel }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const startTimeRef = useRef(Date.now());

  const shuffledRight = useRef<MatchPair[]>(
    activity.shuffle_right
      ? [...activity.pairs].sort(() => Math.random() - 0.5)
      : activity.pairs,
  ).current;

  const handleLeftSelect = useCallback((pairId: string) => {
    if (matched.has(pairId)) return;
    setSelectedLeft(pairId);
    setSelectedRight(null);
    setWrongPair(null);
  }, [matched]);

  const handleRightSelect = useCallback(
    (pairId: string) => {
      if (!selectedLeft || matched.has(pairId)) return;
      setSelectedRight(pairId);

      const isCorrect = selectedLeft === pairId;

      if (isCorrect) {
        const newMatched = new Set(matched);
        newMatched.add(pairId);
        setMatched(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);

        const elapsed = Date.now() - startTimeRef.current;
        const response: ItemResponse = {
          item_id: pairId,
          client_response_id: crypto.randomUUID(),
          value: { left_id: selectedLeft, right_id: pairId },
          elapsed_ms: elapsed,
          hint_level: Math.min(hintLevel, 2),
        };
        const result: ItemResult = {
          item_id: pairId,
          is_correct: true,
          score: 1,
          hint_level: Math.min(hintLevel, 2),
        };
        onResult(response, result);
      } else {
        setWrongPair({ left: selectedLeft, right: pairId });
        setTimeout(() => {
          setWrongPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    },
    [selectedLeft, matched, onResult, hintLevel],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-2xl justify-between gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-3">
          {activity.pairs.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedLeft === pair.id;

            return (
              <button
                key={pair.id}
                onClick={() => handleLeftSelect(pair.id)}
                disabled={isMatched}
                className={[
                  "flex items-center justify-center rounded-2xl border-4 p-4 transition-all active:scale-95",
                  isMatched
                    ? "border-[var(--color-success)] bg-[var(--color-success)]/10 opacity-50"
                    : isSelected
                      ? "border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/10"
                      : "border-[var(--color-surface-2)] bg-white hover:border-[var(--color-brand-sun)]",
                ].join(" ")}
                style={{ minHeight: "80px", minWidth: "100px" }}
              >
                <PairContent side="left" pair={pair} />
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {shuffledRight.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedRight === pair.id;
            const isWrong = wrongPair?.right === pair.id;

            return (
              <button
                key={pair.id}
                onClick={() => handleRightSelect(pair.id)}
                disabled={isMatched}
                className={[
                  "flex items-center justify-center rounded-2xl border-4 p-4 transition-all active:scale-95",
                  isMatched
                    ? "border-[var(--color-success)] bg-[var(--color-success)]/10 opacity-50"
                    : isWrong
                      ? "border-[var(--color-danger)] bg-[var(--color-danger)]/10"
                      : isSelected
                        ? "border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/10"
                        : "border-[var(--color-surface-2)] bg-white hover:border-[var(--color-brand-sun)]",
                ].join(" ")}
                style={{ minHeight: "80px", minWidth: "100px" }}
              >
                <PairContent side="right" pair={pair} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Pair content renderer ───────────────────────────────────────────────────
function PairContent({ side, pair }: { side: "left" | "right"; pair: MatchPair }) {
  const content = pair[side];

  if (content.image) {
    return <ContentImage src={content.image.en} alt="" containerClassName="h-12 w-12" />;
  }
  if (content.text) {
    return (
      <span className="text-lg font-bold" style={{ fontFamily: "var(--font-kids)" }}>
        {content.text.en}
      </span>
    );
  }
  if (content.shape) {
    return <Shape shape={content.shape} colour={content.colour} />;
  }
  if (content.colour) {
    return (
      <div
        className="h-10 w-10 rounded-lg"
        style={{ backgroundColor: content.colour }}
      />
    );
  }
  return null;
}

function Shape({ shape, colour }: { shape: string; colour?: string }) {
  const fill = colour ?? "var(--color-brand-sun)";
  const size = 40;
  switch (shape) {
    case "circle":
      return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-2} fill={fill} /></svg>;
    case "square":
      return <svg width={size} height={size}><rect x={2} y={2} width={size-4} height={size-4} fill={fill} rx={4} /></svg>;
    case "triangle":
      return <svg width={size} height={size}><polygon points={`${size/2},2 ${size-2},${size-2} 2,${size-2}`} fill={fill} /></svg>;
    case "star":
      return <svg width={size} height={size}><polygon points="20,2 24,15 38,15 27,23 31,37 20,28 9,37 13,23 2,15 16,15" fill={fill} /></svg>;
    case "heart":
      return <svg width={size} height={size}><path d="M20 35 C 20 35, 2 23, 2 13 C 2 7, 8 3, 13 3 C 17 3, 20 7, 20 10 C 20 7, 23 3, 27 3 C 32 3, 38 7, 38 13 C 38 23, 20 35, 20 35" fill={fill} /></svg>;
    case "diamond":
      return <svg width={size} height={size}><polygon points={`${size/2},2 ${size-2},${size/2} ${size/2},${size-2} 2,${size/2}`} fill={fill} /></svg>;
    default:
      return null;
  }
}
