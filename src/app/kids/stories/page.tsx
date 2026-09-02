"use client";

import { useRouter } from "next/navigation";
import { getAllStories } from "@/lib/activity-catalog";
import { useState, useRef } from "react";

export default function StoriesPage() {
  const router = useRouter();
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
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "var(--color-surface-0)",
        fontFamily: "var(--font-kids)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          className="relative flex h-12 w-12 items-center justify-center rounded-full text-2xl text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-surface-1)]"
          onPointerDown={handleExitHoldStart}
          onPointerUp={handleExitHoldEnd}
          onPointerLeave={handleExitHoldEnd}
          aria-label="Hold to go back"
        >
          ←
          {exitProgress > 0 && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24" cy="24" r="22"
                fill="none"
                stroke="var(--color-brand-sun)"
                strokeWidth="3"
                strokeDasharray={`${exitProgress * 138.2} 138.2`}
              />
            </svg>
          )}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden="true">📖</span>
          <h1 className="text-2xl font-bold text-[var(--color-ink-900)]">Stories</h1>
        </div>
      </div>

      {/* Story shelf */}
      <div className="flex flex-1 items-start justify-center px-6 pb-8 pt-4">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-20">
            <span className="text-6xl" aria-hidden="true">📚</span>
            <p className="text-xl text-[var(--color-ink-500)]">No stories yet. Coming soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {stories.map((story) => (
              <button
                key={story.id}
                onClick={() => router.push(`/kids/play/${story.id}`)}
                className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 transition-all hover:shadow-lg active:scale-95"
                style={{
                  border: "3px solid var(--color-brand-jacaranda)",
                  minHeight: "200px",
                  minWidth: "200px",
                }}
              >
                <span className="text-6xl" aria-hidden="true">📖</span>
                <span className="text-center text-xl font-bold text-[var(--color-ink-900)]">
                  {story.title.en}
                </span>
                {story.description && (
                  <span className="text-center text-sm text-[var(--color-ink-500)]">
                    {story.description.en}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
