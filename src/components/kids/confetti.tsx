"use client";

import { useEffect, useState } from "react";

const CONFETTI_COLORS = [
  "#FFB627", "#FF6B9D", "#4FC3F7", "#4CAF50",
  "#FF6B35", "#9B59D0", "#FFEB3B", "#26D0A8",
  "#FF5252", "#6C5CE7", "#FF9F43", "#E84393",
];

const CONFETTI_SHAPES = ["●", "▲", "■", "★", "♥"];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  shape: string;
  size: number;
}

export function Confetti({ count = 40 }: { count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      size: 12 + Math.random() * 16,
    }));
    setPieces(newPieces);
  }, [count]);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            color: p.color,
            fontSize: `${p.size}px`,
            lineHeight: 1,
          }}
        >
          {p.shape}
        </div>
      ))}
    </>
  );
}
