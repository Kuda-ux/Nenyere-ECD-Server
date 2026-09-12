"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSound } from "@/hooks/use-sound";
import {
  getLearners,
  AVATAR_EMOJI,
  AVATAR_COLORS,
  type Learner,
} from "@/lib/learner-store";

const FLOATING_DECORATIONS = [
  { emoji: "🌈", top: "8%", left: "5%", size: "3rem", anim: "anim-float-slow", delay: "anim-delay-2" },
  { emoji: "⭐", top: "15%", left: "88%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-1" },
  { emoji: "🦋", top: "70%", left: "3%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-4" },
  { emoji: "🌸", top: "80%", left: "92%", size: "2rem", anim: "anim-float", delay: "anim-delay-3" },
  { emoji: "☁️", top: "25%", left: "75%", size: "3rem", anim: "anim-float-slow", delay: "anim-delay-5" },
  { emoji: "🎈", top: "60%", left: "85%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-6" },
  { emoji: "🌟", top: "45%", left: "8%", size: "2rem", anim: "anim-wiggle", delay: "" },
  { emoji: "🎵", top: "85%", left: "45%", size: "2rem", anim: "anim-float", delay: "anim-delay-7" },
];

export function LearnerPicker({ deviceLearnerIds }: { deviceLearnerIds?: string[] | null }) {
  const router = useRouter();
  const { play, unlock } = useSound();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    const allLearners = getLearners();
    // Filter to only learners assigned to this device
    const filtered = deviceLearnerIds
      ? allLearners.filter((l) => deviceLearnerIds.includes(l.id))
      : allLearners;
    setLearners(filtered);
    setLoaded(true);
  }

  // Empty state: no learners added yet
  if (loaded && learners.length === 0) {
    return (
      <div className="kids-bg-playful relative flex w-full max-w-2xl flex-col items-center gap-6 overflow-hidden rounded-3xl p-8 text-center">
        <div
          className="anim-float flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          🌟
        </div>
        <h1
          className="text-3xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          No learners on this device!
        </h1>
        <p
          className="text-lg text-[var(--color-ink-500)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {deviceLearnerIds
            ? "Your teacher needs to assign learners to this device from the teacher dashboard. 📋"
            : "Your teacher needs to add learners from the teacher dashboard first. 📋"}
        </p>
        <button
          className="kids-btn text-base text-[var(--color-ink-500)] underline-offset-4 hover:underline"
          onClick={() => { play("tap"); router.push("/"); }}
          style={{ fontFamily: "var(--font-kids)" }}
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  function handleSelect(learner: Learner) {
    unlock();
    play("pop");
    setTimeout(() => router.push(`/kids/dashboard?learner=${learner.id}`), 200);
  }

  return (
    <div className="kids-bg-playful relative flex w-full max-w-4xl flex-col items-center gap-6 overflow-hidden rounded-3xl p-4 sm:gap-8 sm:p-8">
      {/* Floating decorations */}
      {FLOATING_DECORATIONS.map((dec, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute ${dec.anim} ${dec.delay}`}
          style={{ top: dec.top, left: dec.left, fontSize: dec.size, opacity: 0.6 }}
          aria-hidden="true"
        >
          {dec.emoji}
        </span>
      ))}

      {/* Mascot + greeting */}
      <div className="flex flex-col items-center gap-3 text-center anim-bounce-in">
        <div
          className="anim-float flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-lg sm:h-24 sm:w-24 sm:text-6xl"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          🌟
        </div>
        <h1
          className="text-3xl font-bold text-[var(--color-ink-900)] sm:text-4xl"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Who are you?
        </h1>
        <p
          className="text-lg text-[var(--color-ink-500)] sm:text-xl"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Tap your picture to start playing! 🎉
        </p>
      </div>

      {/* Avatar grid */}
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6 md:grid-cols-4">
        {learners.map((learner, i) => {
          const gradient = AVATAR_COLORS[learner.avatar_key] ?? AVATAR_COLORS.star;
          return (
            <button
              key={learner.id}
              onClick={() => handleSelect(learner)}
              className={`kids-card flex flex-col items-center gap-2 border-4 border-transparent p-3 anim-pop-in sm:gap-3 sm:p-6 ${[`anim-delay-1`, `anim-delay-2`, `anim-delay-3`, `anim-delay-4`][i % 4]}`}
              style={{ minHeight: "150px" }}
            >
              <div
                className="anim-float flex h-16 w-16 items-center justify-center rounded-full text-4xl shadow-md transition-transform hover:scale-110 sm:h-24 sm:w-24 sm:text-6xl"
                style={{ background: gradient, animationDelay: `${i * 0.15}s` }}
                aria-hidden="true"
              >
                {AVATAR_EMOJI[learner.avatar_key] ?? "⭐"}
              </div>
              <span
                className="text-xl font-bold text-[var(--color-ink-900)] sm:text-2xl"
                style={{ fontFamily: "var(--font-kids)" }}
              >
                {learner.preferred_name}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white sm:text-sm"
                style={{ backgroundColor: "var(--color-brand-jacaranda)" }}
              >
                {learner.ecd_level.replace("_", " ")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Exit gate */}
      <button
        className="kids-btn mt-4 text-base text-[var(--color-ink-500)] underline-offset-4 hover:underline"
        onClick={() => { play("tap"); router.push("/"); }}
        style={{ fontFamily: "var(--font-kids)" }}
      >
        ← Exit Child Mode
      </button>
    </div>
  );
}
