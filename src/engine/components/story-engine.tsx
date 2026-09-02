/**
 * Story engine component.
 * Renders story_interaction — page-by-page narration with optional interactions.
 */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { StoryActivity } from "../schema/engines";
import type { ItemResponse, ItemResult } from "../schema/common";
import { useAudio } from "../audio/audio-manager";
import { ContentImage } from "./content-image";

type Props = {
  activity: StoryActivity;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

export function StoryEngine({ activity, onResult, hintLevel }: Props) {
  const audio = useAudio();
  const [pageIndex, setPageIndex] = useState(0);
  const [interactionResults, setInteractionResults] = useState<ItemResult[]>([]);
  const startTimeRef = useRef(Date.now());

  const page = activity.pages[pageIndex];
  const isLastPage = pageIndex >= activity.pages.length - 1;

  // Play narration when page changes
  useEffect(() => {
    if (page.narration) {
      audio.play(page.narration.en);
    }
  }, [pageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = useCallback(() => {
    if (isLastPage) {
      // Submit final result
      const elapsed = Date.now() - startTimeRef.current;
      const correctCount = interactionResults.filter((r) => r.is_correct).length;
      const response: ItemResponse = {
        item_id: "story",
        client_response_id: crypto.randomUUID(),
        value: { pages_visited: pageIndex + 1, interactions: interactionResults.length },
        elapsed_ms: elapsed,
        hint_level: Math.min(hintLevel, 2),
      };
      const result: ItemResult = {
        item_id: "story",
        is_correct: correctCount >= interactionResults.length / 2,
        score: interactionResults.length > 0 ? correctCount / interactionResults.length : 1,
        hint_level: Math.min(hintLevel, 2),
      };
      onResult(response, result);
    } else {
      setPageIndex((i) => i + 1);
    }
  }, [isLastPage, interactionResults, pageIndex, onResult, hintLevel]);

  const handleInteraction = useCallback(
    (pageId: string, isCorrect: boolean) => {
      const result: ItemResult = {
        item_id: pageId,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        hint_level: Math.min(hintLevel, 2),
      };
      setInteractionResults((prev) => [...prev, result]);

      // Advance after a brief delay
      setTimeout(() => {
        if (isLastPage) {
          handleNext();
        } else {
          setPageIndex((i) => i + 1);
        }
      }, 1200);
    },
    [hintLevel, isLastPage, handleNext],
  );

  return (
    <div className="flex max-w-2xl flex-col items-center gap-4">
      {/* Story image */}
      <div className="relative w-full overflow-hidden rounded-2xl border-4 border-[var(--color-surface-2)]">
        <ContentImage
          src={page.image.en}
          alt={page.text?.en ?? `Page ${pageIndex + 1}`}
          containerClassName="aspect-video w-full"
        />
        {/* Hotspots */}
        {page.interaction?.type === "tap_hotspot" && page.interaction.hotspots?.map((spot) => (
          <button
            key={spot.id}
            onClick={() => {
              if (spot.response_audio) audio.play(spot.response_audio.en);
            }}
            className="absolute rounded-full border-2 border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/20 transition-all hover:bg-[var(--color-brand-sun)]/40"
            style={{
              left: `${spot.cx * 100}%`,
              top: `${spot.cy * 100}%`,
              width: `${spot.radius * 200}px`,
              height: `${spot.radius * 200}px`,
              transform: "translate(-50%, -50%)",
            }}
            aria-label={spot.response_text?.en ?? "Hotspot"}
          />
        ))}
      </div>

      {/* Story text */}
      {page.text && (
        <p
          className="text-center text-lg"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {page.text.en}
        </p>
      )}

      {/* Interaction: tap_correct */}
      {page.interaction?.type === "tap_correct" && page.interaction.choices && (
        <div className="flex flex-col gap-2">
          {page.interaction.prompt && (
            <p className="text-center text-lg font-semibold" style={{ fontFamily: "var(--font-kids)" }}>
              {page.interaction.prompt.en}
            </p>
          )}
          <div className="flex gap-3">
            {page.interaction.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleInteraction(page.id, choice.is_correct)}
                className="rounded-xl border-4 border-[var(--color-surface-2)] bg-white px-6 py-3 font-semibold transition-all hover:border-[var(--color-brand-sun)] active:scale-95"
                style={{ fontFamily: "var(--font-kids)" }}
              >
                {choice.text.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next button */}
      {!page.interaction && (
        <button
          onClick={handleNext}
          className="rounded-xl bg-[var(--color-brand-sun)] px-8 py-3 font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {isLastPage ? "Finish Story ★" : "Next →"}
        </button>
      )}

      {/* Page indicator */}
      <div className="flex gap-1.5">
        {activity.pages.map((_, i) => (
          <div
            key={i}
            className={[
              "h-2 w-2 rounded-full",
              i === pageIndex ? "bg-[var(--color-brand-sun)]" : "bg-[var(--color-surface-2)]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
