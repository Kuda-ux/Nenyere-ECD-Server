"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllStories } from "@/lib/activity-catalog";
import { useSound } from "@/hooks/use-sound";
import { HoldExitButton } from "@/components/kids/hold-exit-button";

const STORY_GRADIENTS = [
  "linear-gradient(135deg, #9B59D0, #B388FF)",
  "linear-gradient(135deg, #FF6B9D, #E84393)",
  "linear-gradient(135deg, #4FC3F7, #6C5CE7)",
  "linear-gradient(135deg, #FFB627, #FF9F43)",
  "linear-gradient(135deg, #4CAF50, #00B894)",
  "linear-gradient(135deg, #FF6B35, #FF5252)",
];

const STORY_EMOJIS = ["📚", "🦄", "🐰", "🌅", "🦁", "🐟"];

const FLOATING_DECORATIONS = [
  { emoji: "📖", top: "8%", left: "5%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-2" },
  { emoji: "✨", top: "15%", left: "90%", size: "2rem", anim: "anim-float", delay: "anim-delay-1" },
  { emoji: "🌟", top: "82%", left: "8%", size: "2rem", anim: "anim-wiggle", delay: "" },
  { emoji: "🎈", top: "75%", left: "88%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-3" },
];

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const learnerId = searchParams.get("learner") ?? "";
  const { play } = useSound();
  const stories = getAllStories();

  return (
    <div
      className="kids-bg-candy relative flex min-h-screen flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-kids)" }}
    >
      {/* Floating decorations */}
      {FLOATING_DECORATIONS.map((dec, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute ${dec.anim} ${dec.delay}`}
          style={{ top: dec.top, left: dec.left, fontSize: dec.size, opacity: 0.5 }}
          aria-hidden="true"
        >
          {dec.emoji}
        </span>
      ))}

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        <HoldExitButton
          onExit={() => router.push(`/kids/dashboard?learner=${learnerId}`)}
          label="Hold to go back"
        />
        <div
          className="flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 shadow-lg anim-bounce-in sm:px-5"
          style={{ background: "linear-gradient(135deg, #9B59D0, #B388FF)" }}
        >
          <span className="text-3xl sm:text-4xl" aria-hidden="true">📖</span>
          <h1 className="truncate text-xl font-bold text-white drop-shadow-md sm:text-2xl">Stories</h1>
        </div>
      </div>

      {/* Story shelf */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto kids-scroll px-4 pb-8 pt-4 sm:px-6">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-20 anim-bounce-in">
            <span className="text-7xl anim-float" aria-hidden="true">📚</span>
            <p className="text-xl text-[var(--color-ink-500)]">No stories yet. Coming soon! 🌟</p>
          </div>
        ) : (
          <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {stories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => { play("magic"); router.push(`/kids/play/${story.id}?learner=${learnerId}`); }}
                className={`kids-card flex flex-col items-center gap-3 p-5 anim-pop-in sm:gap-4 sm:p-8`}
                style={{
                  background: STORY_GRADIENTS[i % STORY_GRADIENTS.length],
                  minHeight: "200px",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <span className="text-7xl drop-shadow-lg anim-float sm:text-8xl" style={{ animationDelay: `${i * 0.3}s` }} aria-hidden="true">
                  {STORY_EMOJIS[i % STORY_EMOJIS.length]}
                </span>
                <span className="text-center text-xl font-bold text-white drop-shadow-md sm:text-2xl">
                  {story.title.en}
                </span>
                {story.description && (
                  <span className="text-center text-sm text-white/80 sm:text-base">
                    {story.description.en}
                  </span>
                )}
                <span className="rounded-full bg-white/30 px-4 py-1.5 text-base font-bold text-white">
                  Read me! 🎧
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="kids-bg-candy flex min-h-screen items-center justify-center"><p className="text-xl text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p></div>}>
      <StoriesContent />
    </Suspense>
  );
}
