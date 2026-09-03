"use client";

import Link from "next/link";
import { useSound } from "@/hooks/use-sound";

export default function WelcomePage() {
  const { play, unlock } = useSound();

  return (
    <main className="kids-bg-sunset relative flex min-h-screen flex-col items-center justify-center gap-12 overflow-hidden px-6 py-16">
      {/* Floating decorations */}
      <span className="pointer-events-none absolute anim-float-slow anim-delay-2" style={{ top: "10%", left: "5%", fontSize: "3rem", opacity: 0.5 }} aria-hidden="true">🌈</span>
      <span className="pointer-events-none absolute anim-float anim-delay-1" style={{ top: "15%", left: "88%", fontSize: "2.5rem", opacity: 0.5 }} aria-hidden="true">⭐</span>
      <span className="pointer-events-none absolute anim-float-slow anim-delay-4" style={{ top: "75%", left: "8%", fontSize: "2.5rem", opacity: 0.5 }} aria-hidden="true">🦋</span>
      <span className="pointer-events-none absolute anim-float anim-delay-3" style={{ top: "80%", left: "88%", fontSize: "3rem", opacity: 0.5 }} aria-hidden="true">🎈</span>

      <div className="flex flex-col items-center gap-4 text-center anim-bounce-in">
        <div
          className="anim-float flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-xl"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
          aria-hidden="true"
        >
          🌟
        </div>
        <h1
          className="text-3xl font-bold tracking-tight text-[var(--color-ink-900)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Welcome to Nenyere ECD!
        </h1>
        <p
          className="max-w-sm text-base text-[var(--color-ink-700)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Choose how you want to sign in. 😊
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4 anim-slide-up anim-delay-2">
        <Link
          href="/login"
          onClick={() => { unlock(); play("pop"); }}
          className="kids-btn flex items-center justify-center gap-2 px-6 py-4 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #FFB627, #FF9F43)" }}
        >
          👩‍🏫 Sign in as Teacher / Admin
        </Link>
        <Link
          href="/login?mode=device"
          onClick={() => { unlock(); play("chime"); }}
          className="kids-btn flex items-center justify-center gap-2 px-6 py-4 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #4FC3F7, #6C5CE7)" }}
        >
          📱 Sign in as Classroom Device
        </Link>
        <Link
          href="/kids"
          onClick={() => { unlock(); play("pop"); }}
          className="kids-btn flex items-center justify-center gap-2 px-6 py-4 text-lg text-white shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #4CAF50, #00B894)" }}
        >
          🎨 Child Mode (Play directly)
        </Link>
      </div>

      <Link
        href="/"
        onClick={() => play("tap")}
        className="text-base text-[var(--color-ink-500)] underline-offset-4 hover:underline"
        style={{ fontFamily: "var(--font-kids)" }}
      >
        ← Back to home
      </Link>
    </main>
  );
}
