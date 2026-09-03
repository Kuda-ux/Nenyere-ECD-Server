"use client";

import { useRouter } from "next/navigation";
import { useSound } from "@/hooks/use-sound";

type Learner = {
  id: string;
  preferred_name: string;
  first_name: string;
  avatar_key: string;
  ecd_level: string;
};

const AVATAR_EMOJI: Record<string, string> = {
  star: "⭐",
  elephant: "🐘",
  lion: "🦁",
  bird: "🐦",
  fish: "🐟",
  rabbit: "🐰",
  sun: "☀️",
  flower: "🌸",
  tree: "🌳",
  butterfly: "🦋",
};

const AVATAR_COLORS: Record<string, string> = {
  star: "linear-gradient(135deg, #FFB627, #FF9F43)",
  elephant: "linear-gradient(135deg, #4FC3F7, #6C5CE7)",
  lion: "linear-gradient(135deg, #FF9F43, #FF6B35)",
  bird: "linear-gradient(135deg, #26D0A8, #00B894)",
  fish: "linear-gradient(135deg, #4FC3F7, #26D0A8)",
  rabbit: "linear-gradient(135deg, #FF6B9D, #E84393)",
  sun: "linear-gradient(135deg, #FFEB3B, #FFB627)",
  flower: "linear-gradient(135deg, #FF6B9D, #9B59D0)",
  tree: "linear-gradient(135deg, #4CAF50, #00B894)",
  butterfly: "linear-gradient(135deg, #9B59D0, #6C5CE7)",
};

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

export function LearnerPicker() {
  const router = useRouter();
  const { play, unlock } = useSound();

  const learners: Learner[] = [
    { id: "00000000-0000-0000-0000-000000001001", preferred_name: "Tari", first_name: "Tariro", avatar_key: "star", ecd_level: "ECD_A" },
    { id: "00000000-0000-0000-0000-000000001002", preferred_name: "Tina", first_name: "Tinashe", avatar_key: "elephant", ecd_level: "ECD_A" },
    { id: "00000000-0000-0000-0000-000000001003", preferred_name: "Rumbi", first_name: "Rumbidzai", avatar_key: "lion", ecd_level: "ECD_B" },
  ];

  function handleSelect(learner: Learner) {
    unlock();
    play("pop");
    setTimeout(() => router.push(`/kids/dashboard?learner=${learner.id}`), 200);
  }

  return (
    <div className="kids-bg-playful relative flex w-full max-w-4xl flex-col items-center gap-8 overflow-hidden rounded-3xl p-8">
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
          className="anim-float flex h-24 w-24 items-center justify-center rounded-full text-6xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          🌟
        </div>
        <h1
          className="text-4xl font-bold text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Who are you?
        </h1>
        <p
          className="text-xl text-[var(--color-ink-500)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Tap your picture to start playing! 🎉
        </p>
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {learners.map((learner, i) => {
          const gradient = AVATAR_COLORS[learner.avatar_key] ?? AVATAR_COLORS.star;
          return (
            <button
              key={learner.id}
              onClick={() => handleSelect(learner)}
              className={`kids-card flex flex-col items-center gap-3 border-4 border-transparent p-6 anim-pop-in ${[`anim-delay-1`, `anim-delay-2`, `anim-delay-3`, `anim-delay-4`][i % 4]}`}
              style={{ minHeight: "180px", minWidth: "150px" }}
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-md transition-transform hover:scale-110"
                style={{ background: gradient }}
                aria-hidden="true"
              >
                {AVATAR_EMOJI[learner.avatar_key] ?? "⭐"}
              </div>
              <span
                className="text-2xl font-bold text-[var(--color-ink-900)]"
                style={{ fontFamily: "var(--font-kids)" }}
              >
                {learner.preferred_name}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
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
        onClick={() => { play("tap"); router.push("/welcome"); }}
        style={{ fontFamily: "var(--font-kids)" }}
      >
        ← Exit Child Mode
      </button>
    </div>
  );
}
