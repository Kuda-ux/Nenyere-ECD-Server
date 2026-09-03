"use client";

import { useRouter } from "next/navigation";
import { getAllStories } from "@/lib/activity-catalog";
import { useState, useRef } from "react";
import { useSound } from "@/hooks/use-sound";

const STORY_GRADIENTS = [
  "linear-gradient(135deg, #9B59D0, #B388FF)",
  "linear-gradient(135deg, #FF6B9D, #E84393)",
  "linear-gradient(135deg, #4FC3F7, #6C5CE7)",
  "linear-gradient(135deg, #FFB627, #FF9F43)",
  "linear-gradient(135deg, #4CAF50, #00B894)",
  "linear-gradient(135deg, #FF6B35, #FF5252)",
];

const STORY_EMOJIS = ["📚", "🦄", "🐰", "🌅", "🦁", " river"];

const FLOATING_DECORATIONS = [
  { emoji: "📖", top: "8%", left: "5%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-2" },
  { emoji: "✨", top: "15%", left: "90%", size: "2rem", anim: "anim-float", delay: "anim-delay-1" },
  { emoji: "🌟", top: "82%", left: "8%", size: "2rem", anim: "anim-wiggle", delay: "" },
  { emoji: "🎈", top: "75%", left: "88%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-3" },
];

export default function StoriesPage() {
  const router = useRouter();
  const { play, unlock } = useSound();
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stories = getAllStories();

  function handleExitHoldStart() {
    setExitProgress(0);
    let elapsed = 0;
    holdTimer.current = setInterval(() => {
      elapsed += 100;
      setExitProgress(elapsed / 2000);
      if (elapsed >= 2000) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        router.push("/kids/dashboard");
      }
    }, 100);
  }

  function handleExitHoldEnd() {
    if (holdTimer.current) clearInterval(holdTimer.current);
    setExitProgress(0);
  }

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
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: "var(--color-brand-jacaranda)" }}
          onPointerDown={() => { unlock(); handleExitHoldStart(); }}
          onPointerUp={handleExitHoldEnd}
          onPointerLeave={handleExitHoldEnd}
          aria-label="Hold to go back"
        >
          ←
          {exitProgress > 0 && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-brand-sun)" strokeWidth="3" strokeDasharray={`${exitProgress * 138.2} 138.2`} />
            </svg>
          )}
        </button>
        <div
          className="flex items-center gap-3 rounded-2xl px-5 py-3 shadow-lg anim-bounce-in"
          style={{ background: "linear-gradient(135deg, #9B59D0, #B388FF)" }}
        >
          <span className="text-4xl" aria-hidden="true">📖</span>
          <h1 className="text-2xl font-bold text-white drop-shadow-md">Stories</h1>
        </div>
      </div>

      {/* Story shelf */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto kids-scroll px-6 pb-8 pt-4">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-20 anim-bounce-in">
            <span className="text-7xl anim-float" aria-hidden="true">📚</span>
            <p className="text-xl text-[var(--color-ink-500)]">No stories yet. Coming soon! 🌟</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {stories.map((story, i) => (
              <button
                key={story.id}
                onClick={() => { play("magic"); router.push(`/kids/play/${story.id}`); }}
                className={`kids-card flex flex-col items-center gap-4 p-8 anim-pop-in`}
                style={{
                  background: STORY_GRADIENTS[i % STORY_GRADIENTS.length],
                  minHeight: "220px",
                  minWidth: "200px",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <span className="text-7xl drop-shadow-lg anim-float" style={{ animationDelay: `${i * 0.3}s` }} aria-hidden="true">
                  {STORY_EMOJIS[i % STORY_EMOJIS.length]}
                </span>
                <span className="text-center text-xl font-bold text-white drop-shadow-md">
                  {story.title.en}
                </span>
                {story.description && (
                  <span className="text-center text-sm text-white/80">
                    {story.description.en}
                  </span>
                )}
                <span className="rounded-full bg-white/30 px-4 py-1 text-sm font-bold text-white">
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
