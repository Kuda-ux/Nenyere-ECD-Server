/**
 * HoldExitButton — shared "press and hold to go back" button for kids' pages.
 *
 * Kid-safe: requires holding ~1.5s so toddlers can't accidentally leave an
 * activity, but reliable on tablets thanks to pointer capture (the press
 * stays bound to the button even if the finger drifts) and pointercancel
 * handling. A progress ring shows the hold filling up.
 */
"use client";

import { useRef, useState } from "react";
import { useSound } from "@/hooks/use-sound";

const HOLD_MS = 1500;
const TICK_MS = 50;

type Props = {
  onExit: () => void;
  /** Button background colour */
  color?: string;
  /** Accessible label */
  label?: string;
  /** Icon shown inside the button (emoji or text) */
  icon?: string;
  /** Extra className for positioning */
  className?: string;
};

export function HoldExitButton({
  onExit,
  color = "var(--color-brand-jacaranda)",
  label = "Hold to go back",
  icon = "←",
  className = "",
}: Props) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fired = useRef(false);
  const { unlock, play } = useSound();

  function stopHold() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (!fired.current) setProgress(0);
  }

  function startHold(e: React.PointerEvent<HTMLButtonElement>) {
    // Bind the pointer to this button — finger drift won't fire pointerleave
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture unsupported — hold still works via pointerup
    }
    unlock();
    play("tap");
    fired.current = false;
    setProgress(0);
    let elapsed = 0;
    timer.current = setInterval(() => {
      elapsed += TICK_MS;
      setProgress(Math.min(elapsed / HOLD_MS, 1));
      if (elapsed >= HOLD_MS) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        fired.current = true;
        play("whoosh");
        onExit();
      }
    }, TICK_MS);
  }

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <button
        type="button"
        className="relative flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white shadow-lg transition-transform"
        style={{ backgroundColor: color, transform: progress > 0 ? "scale(0.95)" : undefined }}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={label}
      >
        {icon}
        {progress > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="29"
              fill="none"
              stroke="white"
              strokeWidth="5"
              strokeDasharray={`${progress * 182} 182`}
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      <span
        className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-400)]"
        style={{ fontFamily: "var(--font-kids)" }}
      >
        hold me
      </span>
    </div>
  );
}
