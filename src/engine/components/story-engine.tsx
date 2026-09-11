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
  const [, setInteractionResults] = useState<ItemResult[]>([]);
  const resultsRef = useRef<ItemResult[]>([]);
  const startTimeRef = useRef(Date.now());
  const submittedRef = useRef(false);

  const page = activity.pages[pageIndex];
  const isLastPage = pageIndex >= activity.pages.length - 1;

  // Play narration when page changes
  useEffect(() => {
    if (page.narration) {
      audio.play(page.narration.en);
    }
  }, [pageIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitStory = useCallback((results: ItemResult[], pagesVisited: number) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const elapsed = Date.now() - startTimeRef.current;
    const correctCount = results.filter((r) => r.is_correct).length;
    const response: ItemResponse = {
      item_id: "story",
      client_response_id: crypto.randomUUID(),
      value: { pages_visited: pagesVisited, interactions: results.length },
      elapsed_ms: elapsed,
      hint_level: Math.min(hintLevel, 2),
    };
    const result: ItemResult = {
      item_id: "story",
      is_correct: correctCount >= results.length / 2,
      score: results.length > 0 ? correctCount / results.length : 1,
      hint_level: Math.min(hintLevel, 2),
    };
    onResult(response, result);
  }, [onResult, hintLevel]);

  const handleNext = useCallback(() => {
    if (isLastPage) {
      submitStory(resultsRef.current, activity.pages.length);
    } else {
      setPageIndex((i) => i + 1);
    }
  }, [isLastPage, activity.pages.length, submitStory]);

  const handleInteraction = useCallback(
    (pageId: string, isCorrect: boolean) => {
      const result: ItemResult = {
        item_id: pageId,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        hint_level: Math.min(hintLevel, 2),
      };
      const next = [...resultsRef.current, result];
      resultsRef.current = next;
      setInteractionResults(next);

      // Advance after a brief delay — use `next` (not stale state) for scoring
      setTimeout(() => {
        if (isLastPage) {
          submitStory(next, activity.pages.length);
        } else {
          setPageIndex((i) => i + 1);
        }
      }, 1200);
    },
    [hintLevel, isLastPage, activity.pages.length, submitStory],
  );

  return (
    <div className="flex max-w-3xl flex-col items-center gap-5">
      {/* Story image */}
      <div className="relative w-full overflow-hidden rounded-3xl border-4 border-[var(--color-brand-sun)] shadow-xl">
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
            className="absolute rounded-full border-4 border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/20 transition-all hover:bg-[var(--color-brand-sun)]/40"
            style={{
              left: `${spot.cx * 100}%`,
              top: `${spot.cy * 100}%`,
              width: `${spot.radius * 240}px`,
              height: `${spot.radius * 240}px`,
              transform: "translate(-50%, -50%)",
            }}
            aria-label={spot.response_text?.en ?? "Hotspot"}
          />
        ))}
      </div>

      {/* Story text */}
      {page.text && (
        <p
          className="text-center text-xl font-medium leading-relaxed"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {page.text.en}
        </p>
      )}

      {/* Interaction: tap_correct */}
      {page.interaction?.type === "tap_correct" && page.interaction.choices && (
        <div className="flex flex-col gap-3">
          {page.interaction.prompt && (
            <p className="text-center text-xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
              {page.interaction.prompt.en}
            </p>
          )}
          <div className="flex gap-4">
            {page.interaction.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleInteraction(page.id, choice.is_correct)}
                className="rounded-2xl border-4 border-[var(--color-surface-2)] bg-white px-8 py-4 text-lg font-bold transition-all hover:border-[var(--color-brand-sun)] hover:scale-105 active:scale-95 shadow-md"
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
          className="kids-btn px-10 py-4 text-lg text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)", fontFamily: "var(--font-kids)" }}
        >
          {isLastPage ? "Finish Story ★" : "Next →"}
        </button>
      )}

      {/* Page indicator */}
      <div className="flex gap-2">
        {activity.pages.map((_, i) => (
          <div
            key={i}
            className={[
              "h-3 w-3 rounded-full transition-all",
              i === pageIndex ? "bg-[var(--color-brand-sun)] scale-125" : "bg-[var(--color-surface-2)]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
