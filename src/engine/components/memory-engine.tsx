/**
 * Memory engine component.
 * Renders memory_game — flip cards to find matching pairs.
 */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { MemoryActivity, MemoryCard } from "../schema/engines";
import type { ItemResponse, ItemResult } from "../schema/common";
import { ContentImage } from "./content-image";

type Props = {
  activity: MemoryActivity;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

type CardState = "hidden" | "revealed" | "matched";

export function MemoryEngine({ activity, onResult, hintLevel }: Props) {
  const [cardStates, setCardStates] = useState<CardState[]>(
    () => activity.cards.map(() => "hidden" as CardState),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showPreview, setShowPreview] = useState(activity.preview_ms > 0);
  const startTimeRef = useRef(Date.now());

  // Preview all cards briefly
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

      const newFlipped = [...flipped, index];
      setFlipped(newFlipped);

      // Reveal the card
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
            setCardStates((prev) => {
              const next = [...prev];
              next[i1] = "matched";
              next[i2] = "matched";
              return next;
            });
            setFlipped([]);
            const newMatched = matchedPairs + 1;
            setMatchedPairs(newMatched);

            // Check if all pairs matched
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
          }, 600);
        } else {
          // No match — flip back
          setTimeout(() => {
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
    [showPreview, cardStates, flipped, activity, matchedPairs, attempts, onResult, hintLevel],
  );

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${activity.columns}, 1fr)` }}
    >
      {activity.cards.map((card, i) => {
        const state = cardStates[i];
        const isFlipped = state !== "hidden";

        return (
          <button
            key={i}
            onClick={() => handleCardClick(i)}
            disabled={state !== "hidden" || flipped.length >= 2}
            className={[
              "flex items-center justify-center rounded-2xl border-4 transition-all active:scale-95",
              "aspect-square",
              state === "matched"
                ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                : isFlipped
                  ? "border-[var(--color-brand-sun)] bg-white"
                  : "border-[var(--color-surface-2)] bg-[var(--color-brand-sun)]",
            ].join(" ")}
            style={{ minHeight: "80px" }}
            aria-label={isFlipped ? card.text?.en ?? "Card" : "Hidden card"}
          >
            {isFlipped ? (
              <CardContent card={card} />
            ) : (
              <span className="text-3xl" aria-hidden="true">?</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CardContent({ card }: { card: MemoryCard }) {
  if (card.image) {
    return <ContentImage src={card.image.en} alt="" containerClassName="h-16 w-16" />;
  }
  if (card.text) {
    return (
      <span className="text-xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
        {card.text.en}
      </span>
    );
  }
  return null;
}
