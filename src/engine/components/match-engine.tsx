/**
 * Match engine component — Enhanced with gradient cards, playful animations,
 * and sound feedback.
 * Renders matching, shape_matching, colour_identification, classification.
 * Two-column layout: tap left then tap right to connect.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { MatchActivity, MatchPair } from "../schema/match";
import type { ItemResponse, ItemResult } from "../schema/common";
import { ContentImage } from "./content-image";
import { useSound } from "@/hooks/use-sound";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #FF6B9D, #FFC4D6)",
  "linear-gradient(135deg, #4FC3F7, #81D4FA)",
  "linear-gradient(135deg, #FFB627, #FFE082)",
  "linear-gradient(135deg, #4CAF50, #A5D6A7)",
  "linear-gradient(135deg, #9B59D0, #D4C5F9)",
  "linear-gradient(135deg, #6C5CE7, #A29BFE)",
];

type Props = {
  activity: MatchActivity;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

export function MatchEngine({ activity, onResult, hintLevel }: Props) {
  const { play: playSound } = useSound();
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
    playSound("tap");
    setSelectedLeft(pairId);
    setSelectedRight(null);
    setWrongPair(null);
  }, [matched, playSound]);

  const handleRightSelect = useCallback(
    (pairId: string) => {
      if (!selectedLeft || matched.has(pairId)) return;
      setSelectedRight(pairId);

      const isCorrect = selectedLeft === pairId;

      if (isCorrect) {
        playSound("correct");
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
        playSound("wrong");
        setWrongPair({ left: selectedLeft, right: pairId });
        setTimeout(() => {
          setWrongPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    },
    [selectedLeft, matched, onResult, hintLevel, playSound],
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Match counter */}
      <div
        className="flex items-center gap-3 rounded-full px-5 py-2 shadow-md"
        style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
      >
        <span className="text-xl">🎯</span>
        <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-kids)" }}>
          {matched.size} / {activity.pairs.length} matched
        </span>
      </div>

      <div className="flex w-full max-w-2xl justify-between gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-3">
          {activity.pairs.map((pair, idx) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedLeft === pair.id;
            const isWrong = wrongPair?.left === pair.id;
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

            return (
              <button
                key={pair.id}
                onClick={() => handleLeftSelect(pair.id)}
                disabled={isMatched}
                className={[
                  "flex items-center justify-center rounded-2xl p-4 transition-all active:scale-95 shadow-md",
                  "anim-pop-scale",
                  isMatched
                    ? "opacity-50 ring-4 ring-[var(--color-success)]"
                    : isWrong
                      ? "ring-4 ring-[var(--color-danger)] anim-shake"
                      : isSelected
                        ? "ring-4 ring-[var(--color-brand-sun)] anim-pulse-glow scale-105"
                        : "hover:scale-105 hover:shadow-lg",
                ].join(" ")}
                style={{
                  minHeight: "90px",
                  minWidth: "110px",
                  background: isMatched ? "linear-gradient(135deg, #E8F5E9, #C8E6C9)" : isWrong ? "linear-gradient(135deg, #FFEBEE, #FFCDD2)" : gradient,
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <PairContent side="left" pair={pair} />
                {isMatched && (
                  <span className="absolute -right-2 -top-2 text-2xl anim-bounce-in" aria-hidden="true">✅</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {shuffledRight.map((pair, idx) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedRight === pair.id;
            const isWrong = wrongPair?.right === pair.id;
            const gradient = CARD_GRADIENTS[(idx + 3) % CARD_GRADIENTS.length];

            return (
              <button
                key={pair.id}
                onClick={() => handleRightSelect(pair.id)}
                disabled={isMatched}
                className={[
                  "flex items-center justify-center rounded-2xl p-4 transition-all active:scale-95 shadow-md",
                  "anim-pop-scale",
                  isMatched
                    ? "opacity-50 ring-4 ring-[var(--color-success)]"
                    : isWrong
                      ? "ring-4 ring-[var(--color-danger)] anim-shake"
                      : isSelected
                        ? "ring-4 ring-[var(--color-brand-sun)] anim-pulse-glow scale-105"
                        : "hover:scale-105 hover:shadow-lg",
                ].join(" ")}
                style={{
                  minHeight: "90px",
                  minWidth: "110px",
                  background: isMatched ? "linear-gradient(135deg, #E8F5E9, #C8E6C9)" : isWrong ? "linear-gradient(135deg, #FFEBEE, #FFCDD2)" : gradient,
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <PairContent side="right" pair={pair} />
                {isMatched && (
                  <span className="absolute -right-2 -top-2 text-2xl anim-bounce-in" aria-hidden="true">✅</span>
                )}
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
      <span className="text-2xl font-bold text-white drop-shadow-md" style={{ fontFamily: "var(--font-kids)" }}>
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
        className="h-12 w-12 rounded-xl shadow-inner ring-2 ring-white/50"
        style={{ backgroundColor: content.colour }}
      />
    );
  }
  return null;
}

function Shape({ shape, colour }: { shape: string; colour?: string }) {
  const fill = colour ?? "#FFFFFF";
  const size = 48;
  const stroke = "rgba(0,0,0,0.15)";

  switch (shape) {
    case "circle":
      return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-2} fill={fill} stroke={stroke} strokeWidth="1" /></svg>;
    case "square":
      return <svg width={size} height={size}><rect x={2} y={2} width={size-4} height={size-4} fill={fill} rx={6} stroke={stroke} strokeWidth="1" /></svg>;
    case "triangle":
      return <svg width={size} height={size}><polygon points={`${size/2},2 ${size-2},${size-2} 2,${size-2}`} fill={fill} stroke={stroke} strokeWidth="1" /></svg>;
    case "star":
      return <svg width={size} height={size}><polygon points="24,2 29,18 46,18 32,28 37,44 24,34 11,44 16,28 2,18 19,18" fill={fill} stroke={stroke} strokeWidth="1" /></svg>;
    case "heart":
      return <svg width={size} height={size}><path d="M24 42 C 24 42, 4 28, 4 16 C 4 8, 10 4, 16 4 C 20 4, 24 8, 24 12 C 24 8, 28 4, 32 4 C 38 4, 44 8, 44 16 C 44 28, 24 42, 24 42" fill={fill} stroke={stroke} strokeWidth="1" /></svg>;
    case "diamond":
      return <svg width={size} height={size}><polygon points={`${size/2},2 ${size-2},${size/2} ${size/2},${size-2} 2,${size/2}`} fill={fill} stroke={stroke} strokeWidth="1" /></svg>;
    default:
      return null;
  }
}
