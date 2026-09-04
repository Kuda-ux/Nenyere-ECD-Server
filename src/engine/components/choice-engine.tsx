/**
 * Choice engine component — Enhanced with gradient cards, bounce animations,
 * themed visuals, and playful interactions.
 * Renders tap_correct, multiple_choice, phonics_recognition, etc.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import type { ChoiceActivity, ChoiceItem } from "../schema/choice";
import type { ItemResponse, ItemResult } from "../schema/common";
import { useAudio } from "../audio/audio-manager";
import { useSound } from "@/hooks/use-sound";
import { ContentImage } from "./content-image";

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #FF6B9D, #FFC4D6)",
  "linear-gradient(135deg, #4FC3F7, #81D4FA)",
  "linear-gradient(135deg, #FFB627, #FFE082)",
  "linear-gradient(135deg, #4CAF50, #A5D6A7)",
  "linear-gradient(135deg, #9B59D0, #D4C5F9)",
  "linear-gradient(135deg, #FF6B6B, #FF9999)",
  "linear-gradient(135deg, #00B894, #55EFC4)",
  "linear-gradient(135deg, #6C5CE7, #A29BFE)",
];

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
  const [wrongId, setWrongId] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());

  const handleSelect = useCallback(
    (choiceItem: ChoiceItem) => {
      if (selectedId) return;

      setSelectedId(choiceItem.id);
      const isCorrect = choiceItem.is_correct;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      playSound(isCorrect ? "correct" : "wrong");

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

      if (!isCorrect && newAttempts < activity.show_correct_after_attempts) {
        setWrongId(choiceItem.id);
        setTimeout(() => {
          setSelectedId(null);
          setWrongId(null);
        }, 900);
        return;
      }

      if (!isCorrect && newAttempts >= activity.show_correct_after_attempts) {
        setShowCorrect(true);
      }

      onResult(response, result);
    },
    [selectedId, attempts, activity, item, onResult, audio, hintLevel, playSound],
  );

  const showHint = hintLevel > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Prompt — themed card */}
      <div
        className="flex flex-col items-center gap-3 rounded-3xl px-8 py-5 shadow-lg anim-slide-in-up"
        style={{ background: "linear-gradient(135deg, #FFF9E6, #FFF3CD)" }}
      >
        {activity.prompt.image && (
          <ContentImage
            src={activity.prompt.image.en}
            alt={activity.prompt.text.en}
            containerClassName="h-32 w-32 rounded-xl"
          />
        )}
        <p
          className="text-center text-2xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {activity.prompt.text.en}
        </p>
      </div>

      {/* Choices — gradient cards with animations */}
      <div
        className={
          activity.layout === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3"
            : activity.layout === "row"
              ? "flex gap-4"
              : "flex flex-wrap gap-4"
        }
      >
        {activity.items.map((choice, idx) => {
          const isSelected = selectedId === choice.id;
          const isCorrectItem = choice.is_correct;
          const showAsCorrect = showCorrect && isCorrectItem;
          const showAsWrong = (isSelected && !isCorrectItem) || wrongId === choice.id;
          const highlight = showHint && isCorrectItem;
          const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice)}
              disabled={!!selectedId}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-3xl p-6 transition-all",
                "active:scale-95 shadow-md",
                "anim-pop-scale",
                showAsCorrect
                  ? "ring-4 ring-[var(--color-success)] anim-wobble"
                  : showAsWrong
                    ? "ring-4 ring-[var(--color-danger)] anim-shake"
                    : highlight
                      ? "ring-4 ring-[var(--color-brand-sun)] anim-pulse-glow"
                      : "hover:scale-105 hover:shadow-xl",
              ].join(" ")}
              style={{
                minHeight: "140px",
                minWidth: "120px",
                background: showAsWrong ? "linear-gradient(135deg, #FFEBEE, #FFCDD2)" : showAsCorrect ? "linear-gradient(135deg, #E8F5E9, #C8E6C9)" : gradient,
                animationDelay: `${idx * 0.08}s`,
              }}
              aria-label={choice.alt?.en ?? choice.stimulus.text?.en ?? "Choice"}
            >
              {choice.stimulus.image && (
                <ContentImage
                  src={choice.stimulus.image.en}
                  alt={choice.alt?.en ?? ""}
                  containerClassName="h-20 w-20"
                />
              )}
              {choice.stimulus.text && (
                <span
                  className="text-3xl font-bold text-white drop-shadow-md"
                  style={{ fontFamily: "var(--font-kids)" }}
                >
                  {choice.stimulus.text.en}
                </span>
              )}
              {choice.stimulus.shape && (
                <Shape shape={choice.stimulus.shape} colour={choice.stimulus.colour} size={56} />
              )}
              {showAsCorrect && (
                <span className="text-3xl anim-bounce-in" aria-hidden="true">✅</span>
              )}
              {showAsWrong && (
                <span className="text-3xl anim-bounce-in" aria-hidden="true">❌</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Shape renderer ──────────────────────────────────────────────────────────
function Shape({ shape, colour, size = 48 }: { shape: string; colour?: string; size?: number }) {
  const fill = colour ?? "#FFFFFF";
  const stroke = "rgba(0,0,0,0.15)";

  switch (shape) {
    case "circle":
      return (
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill={fill} stroke={stroke} strokeWidth="1" />
        </svg>
      );
    case "square":
      return (
        <svg width={size} height={size}>
          <rect x={2} y={2} width={size - 4} height={size - 4} fill={fill} rx={6} stroke={stroke} strokeWidth="1" />
        </svg>
      );
    case "triangle":
      return (
        <svg width={size} height={size}>
          <polygon points={`${size / 2},2 ${size - 2},${size - 2} 2,${size - 2}`} fill={fill} stroke={stroke} strokeWidth="1" />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size}>
          <polygon
            points={`${size/2},2 ${size*0.61},${size*0.38} ${size-2},${size*0.38} ${size*0.68},${size*0.58} ${size*0.77},${size-2} ${size/2},${size*0.72} ${size*0.23},${size-2} ${size*0.32},${size*0.58} 2,${size*0.38} ${size*0.39},${size*0.38}`}
            fill={fill}
            stroke={stroke}
            strokeWidth="1"
          />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size}>
          <path
            d={`M${size/2} ${size*0.88} C ${size/2} ${size*0.88}, 2 ${size*0.58}, 2 ${size*0.33} C 2 ${size*0.17}, ${size*0.17} ${size*0.08}, ${size*0.33} ${size*0.08} C ${size*0.42} ${size*0.08}, ${size/2} ${size*0.17}, ${size/2} ${size*0.25} C ${size/2} ${size*0.17}, ${size*0.58} ${size*0.08}, ${size*0.67} ${size*0.08} C ${size*0.83} ${size*0.08}, ${size-2} ${size*0.17}, ${size-2} ${size*0.33} C ${size-2} ${size*0.58}, ${size/2} ${size*0.88}, ${size/2} ${size*0.88}`}
            fill={fill}
            stroke={stroke}
            strokeWidth="1"
          />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size}>
          <polygon points={`${size/2},2 ${size-2},${size/2} ${size/2},${size-2} 2,${size/2}`} fill={fill} stroke={stroke} strokeWidth="1" />
        </svg>
      );
    default:
      return null;
  }
}
