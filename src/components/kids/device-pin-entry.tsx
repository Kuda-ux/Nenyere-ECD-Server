"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceByPin, recordDeviceUsage, setActiveDevice } from "@/lib/device-store";
import { useSound } from "@/hooks/use-sound";

const FLOATING_DECORATIONS = [
  { emoji: "🌈", top: "8%", left: "5%", size: "3rem", anim: "anim-float-slow", delay: "anim-delay-2" },
  { emoji: "⭐", top: "15%", left: "88%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-1" },
  { emoji: "🦋", top: "70%", left: "3%", size: "2.5rem", anim: "anim-float-slow", delay: "anim-delay-4" },
  { emoji: "🌸", top: "80%", left: "92%", size: "2rem", anim: "anim-float", delay: "anim-delay-3" },
  { emoji: "☁️", top: "25%", left: "75%", size: "3rem", anim: "anim-float-slow", delay: "anim-delay-5" },
  { emoji: "🎈", top: "60%", left: "85%", size: "2.5rem", anim: "anim-float", delay: "anim-delay-6" },
];

export function DevicePinEntry() {
  const router = useRouter();
  const { play } = useSound();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    play("tap");
    const newPin = pin + digit;
    setPin(newPin);
    setError(null);

    if (newPin.length === 4) {
      setTimeout(() => tryPin(newPin), 200);
    }
  }

  function tryPin(enteredPin: string) {
    const device = getDeviceByPin(enteredPin);
    if (device) {
      play("cheer");
      recordDeviceUsage(device.id);
      setActiveDevice(device.id);
      setTimeout(() => router.push("/kids"), 300);
    } else {
      play("wobble");
      setError("Wrong code. Try again!");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin("");
      }, 600);
    }
  }

  function handleBackspace() {
    play("tap");
    setPin(pin.slice(0, -1));
    setError(null);
  }

  return (
    <div className="kids-bg-rainbow relative flex w-full max-w-md flex-col items-center gap-8 overflow-hidden rounded-3xl p-8">
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
          Enter Device Code
        </h1>
        <p
          className="text-lg text-[var(--color-ink-500)]"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          Ask your teacher for the 4-digit code! 🔢
        </p>
      </div>

      {/* PIN display */}
      <div className={`flex gap-4 ${shake ? "anim-wobble" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 text-3xl font-bold shadow-md"
            style={{
              borderColor: i < pin.length ? "var(--color-brand-sun)" : "var(--color-surface-2)",
              background: i < pin.length ? "var(--color-brand-sun)" : "white",
              color: i < pin.length ? "white" : "transparent",
            }}
          >
            {i < pin.length ? "●" : ""}
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p
          className="text-lg font-bold text-red-500 anim-bounce-in"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {error}
        </p>
      )}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="kids-card flex h-16 w-16 items-center justify-center text-2xl font-bold text-[var(--color-ink-900)] shadow-md transition-all hover:scale-110 active:scale-95"
            style={{ fontFamily: "var(--font-kids)" }}
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => router.push("/")}
          className="kids-card flex h-16 w-16 items-center justify-center text-xl font-bold text-[var(--color-ink-500)] shadow-md transition-all hover:scale-110 active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          ✕
        </button>
        <button
          onClick={() => handleDigit("0")}
          className="kids-card flex h-16 w-16 items-center justify-center text-2xl font-bold text-[var(--color-ink-900)] shadow-md transition-all hover:scale-110 active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="kids-card flex h-16 w-16 items-center justify-center text-2xl font-bold text-[var(--color-ink-500)] shadow-md transition-all hover:scale-110 active:scale-95"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
