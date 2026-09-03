/**
 * Choice engine component.
 * Renders tap_correct, multiple_choice, phonics_recognition, etc.
 * Per docs/activity-engine.md §3
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { ChoiceActivity, ChoiceItem } from "../schema/choice";
import type { ItemResponse, ItemResult } from "../schema/common";
import { useAudio } from "../audio/audio-manager";
import { useSound } from "@/hooks/use-sound";
import { ContentImage } from "./content-image";

type Props = {
  activity: ChoiceActivity;
  item: ChoiceItem;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

export function ChoiceEngine({ activity, item, onResult, hintLevel }: Props) {
  const audio = useAudio();
  const { play: playSound } = useSound();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const startTimeRef = useRef(Date.now());

  const handleSelect = useCallback(
    (choiceItem: ChoiceItem) => {
      if (selectedId) return; // Prevent double-tap

      setSelectedId(choiceItem.id);
      const isCorrect = choiceItem.is_correct;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Play synthesized sound feedback
      playSound(isCorrect ? "correct" : "wrong");

      // Play audio if the choice has audio
      if (choiceItem.stimulus.audio) {
        audio.play(choiceItem.stimulus.audio.en);
      }

      const elapsed = Date.now() - startTimeRef.current;

      const response: ItemResponse = {
        item_id: item.id,
        client_response_id: crypto.randomUUID(),
        value: { selected_item_id: choiceItem.id },
        elapsed_ms: elapsed,
        hint_level: Math.min(hintLevel, 2),
      };

      const result: ItemResult = {
        item_id: item.id,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        hint_level: Math.min(hintLevel, 2),
      };

      // If incorrect and under max attempts, allow retry
      if (!isCorrect && newAttempts < activity.show_correct_after_attempts) {
        // Brief delay then reset for retry
        setTimeout(() => {
          setSelectedId(null);
        }, 800);
        return;
      }

      // If incorrect and max attempts reached, show correct answer
      if (!isCorrect && newAttempts >= activity.show_correct_after_attempts) {
        setShowCorrect(true);
      }

      onResult(response, result);
    },
    [selectedId, attempts, activity, item, onResult, audio, hintLevel, playSound],
  );

  // Highlight correct item as hint
  const showHint = hintLevel > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Prompt */}
      <div className="flex flex-col items-center gap-3">
        {activity.prompt.image && (
          <ContentImage
            src={activity.prompt.image.en}
            alt={activity.prompt.text.en}
            containerClassName="h-32 w-32 rounded-xl"
          />
        )}
        <p
          className="text-center text-2xl font-bold"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {activity.prompt.text.en}
        </p>
      </div>

      {/* Choices */}
      <div
        className={
          activity.layout === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3"
            : activity.layout === "row"
              ? "flex gap-4"
              : "flex flex-wrap gap-4"
        }
      >
        {activity.items.map((choice) => {
          const isSelected = selectedId === choice.id;
          const isCorrectItem = choice.is_correct;
          const showAsCorrect = showCorrect && isCorrectItem;
          const showAsWrong = isSelected && !isCorrectItem;
          const highlight = showHint && isCorrectItem;

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice)}
              disabled={!!selectedId}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-2xl border-4 p-6 transition-all",
                "active:scale-95",
                showAsCorrect
                  ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
                  : showAsWrong
                    ? "border-[var(--color-danger)] bg-[var(--color-danger)]/10"
                    : highlight
                      ? "border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/5"
                      : "border-[var(--color-surface-2)] bg-white hover:border-[var(--color-brand-sun)]",
              ].join(" ")}
              style={{ minHeight: "120px", minWidth: "100px" }}
              aria-label={choice.alt?.en ?? choice.stimulus.text?.en ?? "Choice"}
            >
              {choice.stimulus.image && (
                <ContentImage
                  src={choice.stimulus.image.en}
                  alt={choice.alt?.en ?? ""}
                  containerClassName="h-16 w-16"
                />
              )}
              {choice.stimulus.text && (
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: "var(--font-kids)" }}
                >
                  {choice.stimulus.text.en}
                </span>
              )}
              {choice.stimulus.shape && (
                <Shape shape={choice.stimulus.shape} colour={choice.stimulus.colour} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Shape renderer ──────────────────────────────────────────────────────────
function Shape({ shape, colour }: { shape: string; colour?: string }) {
  const fill = colour ?? "var(--color-brand-sun)";
  const size = 48;

  switch (shape) {
    case "circle":
      return (
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill={fill} />
        </svg>
      );
    case "square":
      return (
        <svg width={size} height={size}>
          <rect x={2} y={2} width={size - 4} height={size - 4} fill={fill} rx={4} />
        </svg>
      );
    case "triangle":
      return (
        <svg width={size} height={size}>
          <polygon points={`${size / 2},2 ${size - 2},${size - 2} 2,${size - 2}`} fill={fill} />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size}>
          <polygon
            points="24,2 29,18 46,18 32,28 37,44 24,34 11,44 16,28 2,18 19,18"
            fill={fill}
          />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size}>
          <path
            d="M24 42 C 24 42, 4 28, 4 16 C 4 8, 10 4, 16 4 C 20 4, 24 8, 24 12 C 24 8, 28 4, 32 4 C 38 4, 44 8, 44 16 C 44 28, 24 42, 24 42"
            fill={fill}
          />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size}>
          <polygon points={`${size / 2},2 ${size - 2},${size / 2} ${size / 2},${size - 2} 2,${size / 2}`} fill={fill} />
        </svg>
      );
    default:
      return null;
  }
}
