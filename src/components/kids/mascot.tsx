/**
 * Mascot — Animated SVG star character for activity phases.
 * Reacts with different expressions: idle, happy, thinking, celebrating.
 */
"use client";

import { useEffect, useState } from "react";

type MascotMood = "idle" | "happy" | "thinking" | "celebrating" | "encouraging";

export function Mascot({ mood = "idle", size = 80 }: { mood?: MascotMood; size?: number }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const eyeY = mood === "happy" ? 38 : mood === "thinking" ? 36 : 40;
  const mouthPath = mood === "happy" || mood === "celebrating"
    ? "M 30 52 Q 40 62 50 52"
    : mood === "encouraging"
      ? "M 32 52 Q 40 56 48 52"
      : mood === "thinking"
        ? "M 35 54 L 45 54"
        : "M 32 50 Q 40 54 48 50";

  const cheeksOpacity = mood === "happy" || mood === "celebrating" ? 0.6 : 0.3;

  return (
    <div
      className="anim-float"
      style={{ width: size, height: size, position: "relative" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" width={size} height={size}>
        {/* Glow */}
        <circle cx="40" cy="40" r="36" fill="url(#mascotGlow)" opacity="0.3" />

        {/* Star body */}
        <defs>
          <radialGradient id="mascotGlow">
            <stop offset="0%" stopColor="#FFEB3B" />
            <stop offset="100%" stopColor="#FFB627" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="starBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD93D" />
            <stop offset="100%" stopColor="#FFB627" />
          </linearGradient>
        </defs>

        {/* Star shape */}
        <polygon
          points="40,4 49,28 74,28 54,44 62,70 40,54 18,70 26,44 6,28 31,28"
          fill="url(#starBody)"
          stroke="#FF9F43"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Cheeks */}
        <circle cx="24" cy="48" r="5" fill="#FF6B9D" opacity={cheeksOpacity} />
        <circle cx="56" cy="48" r="5" fill="#FF6B9D" opacity={cheeksOpacity} />

        {/* Eyes */}
        {blink ? (
          <>
            <rect x="28" y={eyeY} width="8" height="2" rx="1" fill="#333" />
            <rect x="44" y={eyeY} width="8" height="2" rx="1" fill="#333" />
          </>
        ) : (
          <>
            <circle cx="32" cy={eyeY} r="4" fill="#333" />
            <circle cx="48" cy={eyeY} r="4" fill="#333" />
            <circle cx="33" cy={eyeY - 1} r="1.5" fill="white" />
            <circle cx="49" cy={eyeY - 1} r="1.5" fill="white" />
          </>
        )}

        {/* Mouth */}
        <path d={mouthPath} fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />

        {/* Sparkles when celebrating */}
        {mood === "celebrating" && (
          <>
            <circle cx="10" cy="20" r="2" fill="#FFEB3B" className="anim-twinkle" />
            <circle cx="70" cy="15" r="2" fill="#FFEB3B" className="anim-twinkle anim-delay-1" />
            <circle cx="72" cy="60" r="2" fill="#FFEB3B" className="anim-twinkle anim-delay-2" />
            <circle cx="8" cy="65" r="2" fill="#FFEB3B" className="anim-twinkle anim-delay-3" />
          </>
        )}
      </svg>

      {/* Celebration confetti */}
      {mood === "celebrating" && (
        <div className="pointer-events-none absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute text-lg anim-confetti"
              style={{
                left: `${20 + i * 12}%`,
                top: "50%",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {["🎉", "⭐", "🌟", "✨", "🎊", "💫"][i]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
