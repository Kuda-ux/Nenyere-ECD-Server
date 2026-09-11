/**
 * Puzzle engine — tap a piece, then tap the slot where it belongs.
 * Ghost hints (faded emoji in empty slots) help young children succeed.
 */
"use client";
import { useState, useMemo } from "react";
import type { EngineComponentProps } from "./registry";
import { useSound } from "@/hooks/use-sound";

interface PuzzlePiece { id: string; label?: string; correct_row: number; correct_col: number; emoji?: string; }

const FALLBACK_PIECES: PuzzlePiece[] = [
  { id: "p1", correct_row: 0, correct_col: 0, emoji: "🦁" },
  { id: "p2", correct_row: 0, correct_col: 1, emoji: "🐘" },
  { id: "p3", correct_row: 1, correct_col: 0, emoji: "🦒" },
  { id: "p4", correct_row: 1, correct_col: 1, emoji: "🦓" },
];

export function PuzzleEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as { pieces?: PuzzlePiece[]; rows?: number; cols?: number; show_ghost?: boolean };
  const { play: playSound } = useSound();
  const pieces = useMemo<PuzzlePiece[]>(() => a.pieces ?? FALLBACK_PIECES, [a.pieces]);
  const rows = a.rows ?? 2;
  const cols = a.cols ?? 2;
  const showGhost = a.show_ghost !== false;

  const [shuffled] = useState<PuzzlePiece[]>(() => [...pieces].sort(() => Math.random() - 0.5));
  const [placed, setPlaced] = useState<Record<string, { row: number; col: number }>>({});
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [wrongSlot, setWrongSlot] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const handleSlotClick = (row: number, col: number) => {
    if (!selectedPiece) return;
    const piece = pieces.find((p) => p.id === selectedPiece);
    if (!piece) return;
    const isCorrect = piece.correct_row === row && piece.correct_col === col;
    if (isCorrect) {
      playSound("correct");
      const next = { ...placed, [selectedPiece]: { row, col } };
      setPlaced(next);
      setSelectedPiece(null);
      if (pieces.every((p) => next[p.id])) {
        const response = {
          item_id: "puzzle",
          client_response_id: crypto.randomUUID(),
          value: { completed: true, wrong_attempts: wrongAttempts },
          elapsed_ms: Date.now(),
          hint_level: 0,
        };
        const result = { item_id: "puzzle", is_correct: true, score: 1, hint_level: 0 };
        setTimeout(() => onResult(response, result), 800);
      }
    } else {
      playSound("wrong");
      setWrongAttempts((n) => n + 1);
      setWrongSlot(`${row}-${col}`);
      setTimeout(() => setWrongSlot(null), 600);
      setSelectedPiece(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 p-4">
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
        {selectedPiece ? "Tap where it goes! 👆" : "Tap a piece, then tap its home! 🧩"}
      </p>
      <div
        className="grid gap-2 rounded-3xl border-4 p-3 shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          borderColor: "var(--color-brand-jacaranda)",
          background: "linear-gradient(135deg, #F8F9FF, #E3F2FD)",
        }}
      >
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const placedPiece = pieces.find((p) => placed[p.id]?.row === row && placed[p.id]?.col === col);
          const ghostPiece = showGhost ? pieces.find((p) => p.correct_row === row && p.correct_col === col) : undefined;
          const isWrong = wrongSlot === `${row}-${col}`;
          return (
            <button
              key={idx}
              onClick={() => handleSlotClick(row, col)}
              className={[
                "flex h-28 w-28 items-center justify-center rounded-2xl border-4 text-6xl transition-all sm:h-32 sm:w-32",
                isWrong ? "anim-shake" : "",
                selectedPiece && !placedPiece ? "hover:scale-105" : "",
              ].join(" ")}
              style={{
                borderColor: placedPiece ? "#5BA85B" : isWrong ? "#E85D5D" : selectedPiece ? "#F2A93B" : "#D0D0D0",
                borderStyle: placedPiece ? "solid" : "dashed",
                backgroundColor: placedPiece ? "#E8F5E9" : "white",
              }}
            >
              {placedPiece ? (
                <span className="anim-pop-scale">{placedPiece.emoji}</span>
              ) : ghostPiece ? (
                <span style={{ opacity: 0.22, filter: "grayscale(0.6)" }}>{ghostPiece.emoji}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {shuffled.filter((p) => !placed[p.id]).map((piece) => (
          <button
            key={piece.id}
            onClick={() => { playSound("tap"); setSelectedPiece(piece.id); }}
            className={[
              "flex h-24 w-24 items-center justify-center rounded-2xl border-4 text-6xl shadow-md transition-all",
              selectedPiece === piece.id ? "anim-pulse-glow scale-110" : "hover:scale-105 active:scale-95",
            ].join(" ")}
            style={{
              borderColor: selectedPiece === piece.id ? "#F2A93B" : "#E0E0E0",
              backgroundColor: "white",
            }}
          >
            {piece.emoji ?? "❓"}
          </button>
        ))}
      </div>
    </div>
  );
}
