"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { getAllBadges, getLearnerStats } from "@/lib/dev-tracker";
import { Confetti } from "@/components/kids/confetti";

function RewardsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const learnerId = params.get("learner") ?? "tari";
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [badges, setBadges] = useState<ReturnType<typeof getAllBadges> | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getLearnerStats> | null>(null);

  useEffect(() => {
    setBadges(getAllBadges(learnerId));
    setStats(getLearnerStats(learnerId));
  }, [learnerId]);

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

  const earnedCount = badges?.filter((b) => b.earned).length ?? 0;

  return (
    <div
      className="kids-bg-sunny relative flex min-h-screen flex-col overflow-hidden"
      style={{ fontFamily: "var(--font-kids)" }}
    >
      {/* Confetti if any badges earned */}
      {earnedCount > 0 && <Confetti count={20} />}

      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          className="relative flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: "var(--color-brand-jacaranda)" }}
          onPointerDown={handleExitHoldStart}
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
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          <span className="text-4xl" aria-hidden="true">🏆</span>
          <h1 className="text-2xl font-bold text-white drop-shadow-md">My Stars</h1>
        </div>
      </div>

      {/* Stars summary */}
      <div className="flex flex-col items-center gap-3 px-6 py-6 anim-bounce-in">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`text-6xl ${s <= (stats?.totalStars ?? 0) ? "anim-star-burst" : ""}`}
              style={{
                color: stats && stats.totalStars >= s ? "var(--color-brand-sun)" : "var(--color-surface-2)",
                animationDelay: `${s * 0.1}s`,
              }}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-2xl font-bold text-[var(--color-ink-900)]">
          {stats ? `${stats.totalStars} stars earned!` : "0 stars earned!"} 🌟
        </p>
        <p className="text-base text-[var(--color-ink-500)]">
          {earnedCount} badge{earnedCount !== 1 ? "s" : ""} collected! 🎖️
        </p>
        {stats && (
          <button
            onClick={() => router.push(`/kids/profile?learner=${learnerId}`)}
            className="kids-btn mt-2 px-6 py-3 text-base shadow-md transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #9B59D0, #6C5CE7)", color: "white" }}
          >
            📊 View My Progress
          </button>
        )}
      </div>

      {/* Badges grid */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto kids-scroll px-6 pb-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(badges ?? []).map((badge, i) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-2 rounded-2xl p-5 shadow-md anim-pop-in ${badge.earned ? "anim-pulse-glow" : ""}`}
              style={{
                background: badge.earned
                  ? "linear-gradient(135deg, #FFB627, #FF9F43)"
                  : "white",
                border: `4px solid ${badge.earned ? "var(--color-brand-sun)" : "var(--color-surface-2)"}`,
                minHeight: "150px",
                minWidth: "130px",
                opacity: badge.earned ? 1 : 0.5,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <span
                className={`text-5xl ${badge.earned ? "anim-wiggle" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
                aria-hidden="true"
              >
                {badge.emoji}
              </span>
              <span
                className="text-center text-base font-bold"
                style={{ color: badge.earned ? "white" : "var(--color-ink-900)" }}
              >
                {badge.label}
              </span>
              <span
                className="text-center text-xs"
                style={{ color: badge.earned ? "white/80" : "var(--color-ink-500)" }}
              >
                {badge.description}
              </span>
              {badge.earned && (
                <span className="rounded-full bg-white/30 px-3 py-0.5 text-xs font-bold text-white">
                  ✓ Earned!
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  return (
    <Suspense fallback={<div className="kids-bg-playful flex min-h-screen items-center justify-center"><p className="text-xl" style={{ fontFamily: "var(--font-kids)" }}>Loading... ⏳</p></div>}>
      <RewardsContent />
    </Suspense>
  );
}
