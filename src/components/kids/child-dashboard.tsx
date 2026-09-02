"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { DOMAINS, type DomainKey } from "@/lib/activity-catalog";

const DOMAIN_ROUTES: Record<DomainKey, string> = {
  numbers: "/kids/explore/numbers",
  "letters-sounds": "/kids/explore/letters-sounds",
  colours: "/kids/explore/colours",
  shapes: "/kids/explore/shapes",
  "animals-nature": "/kids/explore/animals-nature",
  stories: "/kids/stories",
  puzzles: "/kids/explore/puzzles",
  explore: "/kids/explore/explore",
};

export function ChildDashboard({ learnerId }: { learnerId: string }) {
  const router = useRouter();
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!learnerId) {
    router.push("/kids");
    return null;
  }

  function handleExitHoldStart() {
    setExitProgress(0);
    let elapsed = 0;
    holdTimer.current = setInterval(() => {
      elapsed += 100;
      setExitProgress(elapsed / 2000);
      if (elapsed >= 2000) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        router.push("/kids");
      }
    }, 100);
  }

  function handleExitHoldEnd() {
    if (holdTimer.current) clearInterval(holdTimer.current);
    setExitProgress(0);
  }

  function handleDomainClick(domain: DomainKey) {
    router.push(DOMAIN_ROUTES[domain]);
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: "var(--color-surface-0)",
        fontFamily: "var(--font-kids)",
      }}
    >
      {/* Exit gate — hold 2s */}
      <button
        className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full text-2xl text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-surface-1)]"
        onPointerDown={handleExitHoldStart}
        onPointerUp={handleExitHoldEnd}
        onPointerLeave={handleExitHoldEnd}
        aria-label="Hold to exit"
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

      {/* Greeting */}
      <div className="flex flex-col items-center gap-2 px-6 pt-12 pb-6">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
          style={{ backgroundColor: "var(--color-brand-sun)" }}
          aria-hidden="true"
        >
          ⭐
        </div>
        <h1
          className="text-3xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Let&apos;s play!
        </h1>
      </div>

      {/* Domain tiles */}
      <div className="flex flex-1 items-center justify-center px-6 pb-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {DOMAINS.map((domain) => (
            <button
              key={domain.key}
              onClick={() => handleDomainClick(domain.key)}
              className="flex flex-col items-center gap-3 rounded-2xl p-6 transition-all hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: "white",
                border: `3px solid ${domain.color}`,
                minHeight: "160px",
                minWidth: "140px",
              }}
            >
              <span className="text-5xl" aria-hidden="true">
                {domain.emoji}
              </span>
              <span
                className="text-xl font-bold"
                style={{ color: "var(--color-ink-900)" }}
              >
                {domain.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
