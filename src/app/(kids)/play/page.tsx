/**
 * Sample activity play page — demonstrates the ActivityRunner with a
 * sample choice activity. This will be replaced by dynamic activity
 * loading from Supabase in the next phase.
 */
"use client";

import { useState } from "react";
import { ActivityRunner } from "@/engine";
import type { AnyActivity } from "@/engine";
import { useRouter } from "next/navigation";

const SAMPLE_ACTIVITY: AnyActivity = {
  id: "00000000-0000-0000-0000-000000000001",
  schema_version: 1,
  type: "tap_correct",
  engine: "choice",
  title: { en: "Find the Star!" },
  description: { en: "Tap the star shape" },
  ecd_level: "ECD_A",
  difficulty: "easy",
  learning_area: "mathematics",
  skills: ["00000000-0000-0000-0000-000000000001"],
  curriculum_refs: [],
  instructions: {
    text: { en: "Tap the star!" },
    audio: { en: "" },
    demo: "none",
  },
  assets: [],
  language: "en",
  estimated_duration_s: 60,
  feedback: {
    correct: [{ text: { en: "You found it!" } }, { text: { en: "Excellent!" } }, { text: { en: "Great job!" } }],
    encourage: [{ text: { en: "Let's try again." } }, { text: { en: "Great try!" } }],
    celebration: "stars",
  },
  hints: {
    after_incorrect: 2,
    highlight_after: 3,
    show_demo: false,
  },
  tags: [],
  scoring: {
    method: "per_item",
    star_bands: { one: 0, two: 0.6, three: 0.9 },
    count_hints_as_partial: false,
    max_attempts_per_item: null,
  },
  items: [
    {
      id: "item-1",
      stimulus: { shape: "star" },
      is_correct: true,
    },
    {
      id: "item-2",
      stimulus: { shape: "circle" },
      is_correct: false,
    },
    {
      id: "item-3",
      stimulus: { shape: "square" },
      is_correct: false,
    },
  ],
  prompt: {
    text: { en: "Find the star!" },
    audio: { en: "" },
  },
  layout: "grid",
  show_correct_after_attempts: 3,
};

export default function PlayPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-surface-1)]">
        <div className="text-6xl" aria-hidden="true">🎉</div>
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
          Activity complete!
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-xl bg-[var(--color-brand-sun)] px-8 py-3 font-bold text-white active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Back to Play
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-1)]">
      <ActivityRunner
        activity={SAMPLE_ACTIVITY}
        onExit={() => router.push("/dashboard")}
        onComplete={() => setCompleted(true)}
      />
    </div>
  );
}
