/**
 * Memory engine component — Enhanced with 3D card flip animations,
 * themed cards, and playful sound effects.
 * Renders memory_game — flip cards to find matching pairs.
 */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { MemoryActivity, MemoryCard } from "../schema/engines";
import type { ItemResponse, ItemResult } from "../schema/common";
import { ContentImage } from "./content-image";
import { useSound } from "@/hooks/use-sound";

type Props = {
  activity: MemoryActivity;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

type CardState = "hidden" | "revealed" | "matched";

const CARD_BACK_GRADIENTS = [
  "linear-gradient(135deg, #FF6B9D, #FFC4D6)",
  "linear-gradient(135deg, #4FC3F7, #81D4FA)",
  "linear-gradient(135deg, #FFB627, #FFE082)",
  "linear-gradient(135deg, #4CAF50, #A5D6A7)",
  "linear-gradient(135deg, #9B59D0, #D4C5F9)",
  "linear-gradient(135deg, #6C5CE7, #A29BFE)",
];

export function MemoryEngine({ activity, onResult, hintLevel }: Props) {
  const { play: playSound } = useSound();
  const [cardStates, setCardStates] = useState<CardState[]>(
    () => activity.cards.map(() => "hidden" as CardState),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showPreview, setShowPreview] = useState(activity.preview_ms > 0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (activity.preview_ms > 0) {
      setCardStates(activity.cards.map(() => "revealed" as CardState));
      const timer = setTimeout(() => {
        setCardStates(activity.cards.map(() => "hidden" as CardState));
        setShowPreview(false);
      }, activity.preview_ms);
      return () => clearTimeout(timer);
    }
  }, [activity]);

  const handleCardClick = useCallback(
    (index: number) => {
      if (showPreview) return;
      if (cardStates[index] !== "hidden") return;
      if (flipped.length >= 2) return;

      playSound("pop");

      const newFlipped = [...flipped, index];
      setFlipped(newFlipped);

      setCardStates((prev) => {
        const next = [...prev];
        next[index] = "revealed";
        return next;
      });

      if (newFlipped.length === 2) {
        setAttempts((a) => a + 1);
        const [i1, i2] = newFlipped;
        const card1 = activity.cards[i1];
        const card2 = activity.cards[i2];

        if (card1.pair_id === card2.pair_id) {
          // Match!
          setTimeout(() => {
            playSound("correct");
            setCardStates((prev) => {
              const next = [...prev];
              next[i1] = "matched";
              next[i2] = "matched";
              return next;
            });
            setFlipped([]);
            const newMatched = matchedPairs + 1;
            setMatchedPairs(newMatched);

            if (newMatched >= activity.cards.length / 2) {
              const elapsed = Date.now() - startTimeRef.current;
              const response: ItemResponse = {
                item_id: "memory-game",
                client_response_id: crypto.randomUUID(),
                value: { matched_pairs: newMatched, total_attempts: attempts + 1 },
                elapsed_ms: elapsed,
                hint_level: Math.min(hintLevel, 2),
              };
              const result: ItemResult = {
                item_id: "memory-game",
                is_correct: true,
                score: newMatched / (attempts + 1),
                hint_level: Math.min(hintLevel, 2),
              };
              onResult(response, result);
            }
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            playSound("wrong");
            setCardStates((prev) => {
              const next = [...prev];
              next[i1] = "hidden";
              next[i2] = "hidden";
              return next;
            });
            setFlipped([]);
          }, 1000);
        }
      }
    },
    [showPreview, cardStates, flipped, activity, matchedPairs, attempts, onResult, hintLevel, playSound],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Match counter */}
      <div
        className="flex items-center gap-3 rounded-full px-5 py-2 shadow-md"
        style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
      >
        <span className="text-xl">🎯</span>
        <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-kids)" }}>
          {matchedPairs} / {activity.cards.length / 2} pairs
        </span>
      </div>

      {/* Card grid with 3D flip */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${activity.columns}, 1fr)` }}
      >
        {activity.cards.map((card, i) => {
          const state = cardStates[i];
          const isFlipped = state !== "hidden";
          const gradient = CARD_BACK_GRADIENTS[i % CARD_BACK_GRADIENTS.length];

          return (
            <button
              key={i}
              onClick={() => handleCardClick(i)}
              disabled={state !== "hidden" || flipped.length >= 2}
              className={[
                "flip-card relative aspect-square rounded-2xl transition-all",
                state === "matched" ? "opacity-60" : "",
                isFlipped ? "flipped" : "",
              ].join(" ")}
              style={{ minHeight: "90px", minWidth: "90px" }}
              aria-label={isFlipped ? card.text?.en ?? "Card" : "Hidden card"}
            >
              <div className="flip-card-inner relative h-full w-full">
                {/* Card back (hidden state) */}
                <div
                  className="flip-card-front absolute inset-0 flex items-center justify-center rounded-2xl shadow-md"
                  style={{ background: gradient }}
                >
                  <span className="text-4xl drop-shadow-md" aria-hidden="true">❓</span>
                </div>

                {/* Card front (revealed state) */}
                <div
                  className={[
                    "flip-card-back absolute inset-0 flex items-center justify-center rounded-2xl border-4 shadow-md",
                    state === "matched"
                      ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                      : "border-[var(--color-brand-sun)] bg-white",
                  ].join(" ")}
                >
                  <CardContent card={card} />
                  {state === "matched" && (
                    <span className="absolute -right-2 -top-2 text-2xl anim-bounce-in" aria-hidden="true">✅</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CardContent({ card }: { card: MemoryCard }) {
  if (card.image) {
    return <ContentImage src={card.image.en} alt="" containerClassName="h-16 w-16" />;
  }
  if (card.text) {
    return (
      <span className="text-4xl" style={{ fontFamily: "var(--font-kids)" }}>
        {card.text.en}
      </span>
    );
  }
  return null;
}
