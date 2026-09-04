"use client";

import Link from "next/link";
import { useSound } from "@/hooks/use-sound";

const FLOATING_EMOJIS = [
  { emoji: "🌈", top: "10%", left: "5%", size: "3rem", anim: "anim-float-slow", delay: "anim-delay-2" },
  { emoji: "⭐", top: "20%", left: "88%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-1" },
  { emoji: "🦋", top: "70%", left: "8%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-4" },
  { emoji: "🎈", top: "75%", left: "90%", size: "3rem", anim: "anim-float", delay: "anim-delay-3" },
  { emoji: "📚", top: "15%", left: "75%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-5" },
  { emoji: "🎨", top: "80%", left: "45%", size: "2rem", anim: "anim-wiggle", delay: "" },
  { emoji: "🌟", top: "40%", left: "10%", size: "2rem", anim: "anim-float", delay: "anim-delay-6" },
  { emoji: "🎵", top: "50%", left: "85%", size: "2rem", anim: "anim-float-slow", delay: "anim-delay-7" },
];

export default function HomePage() {
  const { play, unlock } = useSound();

  return (
    <main className="kids-bg-rainbow relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16">
      {/* Floating decorations */}
      {FLOATING_EMOJIS.map((dec, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute ${dec.anim} ${dec.delay}`}
          style={{ top: dec.top, left: dec.left, fontSize: dec.size, opacity: 0.5 }}
          aria-hidden="true"
        >
          {dec.emoji}
        </span>
      ))}

      <div className="flex flex-col items-center gap-4 text-center anim-bounce-in">
        <div
          className="anim-float flex h-24 w-24 items-center justify-center rounded-full text-6xl shadow-xl"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          🌟
        </div>
        <h1
          className="text-4xl font-bold tracking-tight text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Nenyere ECD
        </h1>
        <p
          className="max-w-md text-lg text-[var(--color-ink-700)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Fun, colourful learning for little stars! 🎉
          <br />
          Made with love for Nenyere Day Care Centre.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row anim-slide-up anim-delay-2">
        <Link
          href="/welcome"
          onClick={() => { unlock(); play("pop"); }}
          className="kids-btn px-8 py-4 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          👋 Welcome / Sign In
        </Link>
        <Link
          href="/kids"
          onClick={() => { unlock(); play("pop"); }}
          className="kids-btn px-8 py-4 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #4CAF50, #00B894)" }}
        >
          🎨 Child Mode
        </Link>
        <Link
          href="/privacy"
          onClick={() => play("tap")}
          className="kids-btn border-4 px-8 py-4 text-lg text-[var(--color-ink-700)] shadow-md transition-all hover:scale-105"
          style={{ borderColor: "var(--color-brand-jacaranda)", backgroundColor: "white" }}
        >
          🔒 Privacy
        </Link>
      </div>

      <p className="text-sm text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>
        Tap a button to begin! 🌟
      </p>
    </main>
  );
}
