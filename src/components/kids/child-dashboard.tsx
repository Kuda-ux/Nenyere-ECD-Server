"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { PILLARS, type PillarKey } from "@/lib/activity-catalog";
import { getLearnerStats } from "@/lib/dev-tracker";
import { getLearnerById, AVATAR_EMOJI, AVATAR_COLORS } from "@/lib/learner-store";
import { useSound } from "@/hooks/use-sound";

const PILLAR_ROUTES: Record<PillarKey, string> = {
  cognitive: "/kids/explore/cognitive",
  "pre-writing": "/kids/explore/pre-writing",
  mathematics: "/kids/explore/mathematics",
  literacy: "/kids/explore/literacy",
  "indigenous-language": "/kids/explore/indigenous-language",
  science: "/kids/explore/science",
  "social-studies": "/kids/explore/social-studies",
  "social-emotional": "/kids/explore/social-emotional",
  creativity: "/kids/explore/creativity",
  physical: "/kids/explore/physical",
  stories: "/kids/stories",
  themes: "/kids/explore/themes",
};

const FLOATING_DECORATIONS = [
  { emoji: "⭐", top: "5%", left: "3%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-2" },
  { emoji: "🌈", top: "8%", left: "92%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-1" },
  { emoji: "🦋", top: "88%", left: "5%", size: "2rem", anim: "anim-float-slow", delay: "anim-delay-4" },
  { emoji: "🎈", top: "85%", left: "90%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-3" },
  { emoji: "☁️", top: "12%", left: "70%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-5" },
  { emoji: "🌟", top: "80%", left: "50%", size: "2rem", anim: "anim-wiggle", delay: "" },
];

export function ChildDashboard({ learnerId }: { learnerId: string }) {
  const router = useRouter();
  const { play, unlock } = useSound();
  const [exitProgress, setExitProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stats, setStats] = useState<{ totalStars: number; totalActivities: number } | null>(null);
  const [learnerName, setLearnerName] = useState<string>("");
  const [learnerAvatar, setLearnerAvatar] = useState<string>("star");

  useEffect(() => {
    const s = getLearnerStats(learnerId);
    setStats({ totalStars: s.totalStars, totalActivities: s.totalActivities });
    const learner = getLearnerById(learnerId);
    if (learner) {
      setLearnerName(learner.preferred_name);
      setLearnerAvatar(learner.avatar_key);
    }
  }, [learnerId]);

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

  function handlePillarClick(pillar: PillarKey) {
    play("pop");
    setTimeout(() => router.push(PILLAR_ROUTES[pillar]), 150);
  }

  return (
    <div
      className="kids-bg-playful relative flex min-h-screen flex-col overflow-hidden"
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

      {/* Exit gate — hold 2s */}
      <button
        className="absolute left-4 top-4 z-10 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ backgroundColor: "var(--color-brand-jacaranda)" }}
        onPointerDown={() => { unlock(); handleExitHoldStart(); }}
        onPointerUp={handleExitHoldEnd}
        onPointerLeave={handleExitHoldEnd}
        aria-label="Hold to exit"
      >
        ←
        {exitProgress > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-brand-sun)" strokeWidth="3" strokeDasharray={`${exitProgress * 138.2} 138.2`} />
          </svg>
        )}
      </button>

      {/* Greeting */}
      <div className="flex flex-col items-center gap-2 px-6 pt-14 pb-4 anim-bounce-in">
        <div
          className="anim-float flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-lg"
          style={{ background: AVATAR_COLORS[learnerAvatar] ?? "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          {AVATAR_EMOJI[learnerAvatar] ?? "🌟"}
        </div>
        <h1
          className="text-4xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Hi, {learnerName || "friend"}! 👋
        </h1>
        <p className="text-lg text-[var(--color-ink-500)]">
          What shall we play today? 😊
        </p>

        {/* Stats badges */}
        {stats && (
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => { play("star"); router.push(`/kids/profile?learner=${learnerId}`); }}
              className="kids-btn flex items-center gap-2 px-5 py-2.5 text-base shadow-md transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)", color: "white" }}
            >
              ⭐ {stats.totalStars}
            </button>
            <button
              onClick={() => { play("chime"); router.push(`/kids/profile?learner=${learnerId}`); }}
              className="kids-btn flex items-center gap-2 px-5 py-2.5 text-base shadow-md transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #9B59D0, #6C5CE7)", color: "white" }}
            >
              🎯 {stats.totalActivities}
            </button>
            <button
              onClick={() => { play("tinkle"); router.push(`/kids/rewards?learner=${learnerId}`); }}
              className="kids-btn flex items-center gap-2 px-5 py-2.5 text-base shadow-md transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #FF6B9D, #E84393)", color: "white" }}
            >
              🏆 Badges
            </button>
          </div>
        )}
      </div>

      {/* Pillar tiles */}
      <div className="flex flex-1 items-start justify-center overflow-y-auto kids-scroll px-4 pb-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <button
              key={pillar.key}
              onClick={() => handlePillarClick(pillar.key)}
              className={`kids-card flex flex-col items-center gap-2 border-4 p-4 anim-pop-in`}
              style={{
                borderColor: "transparent",
                background: pillar.gradient,
                minHeight: "140px",
                minWidth: "130px",
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <span className="text-5xl drop-shadow-md anim-float" style={{ animationDelay: `${i * 0.2}s` }} aria-hidden="true">
                {pillar.emoji}
              </span>
              <span
                className="text-lg font-bold text-white drop-shadow-md"
                style={{ fontFamily: "var(--font-kids)" }}
              >
                {pillar.label}
              </span>
              <span className="text-center text-xs text-white/80">
                {pillar.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
