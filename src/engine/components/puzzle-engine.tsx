"use client";
import { useState, useEffect } from "react";
import type { EngineComponentProps } from "./registry";

interface PuzzlePiece { id: string; label: string; correct_row: number; correct_col: number; emoji?: string; }

export function PuzzleEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as { pieces: PuzzlePiece[]; rows: number; cols: number };
  const pieces = a.pieces ?? [
    { id: "p1", label: "Top-Left", correct_row: 0, correct_col: 0, emoji: "🦁" },
    { id: "p2", label: "Top-Right", correct_row: 0, correct_col: 1, emoji: "🐘" },
    { id: "p3", label: "Bottom-Left", correct_row: 1, correct_col: 0, emoji: "🦒" },
    { id: "p4", label: "Bottom-Right", correct_row: 1, correct_col: 1, emoji: "🦓" },
  ];
  const rows = a.rows ?? 2;
  const cols = a.cols ?? 2;
  const [shuffled, setShuffled] = useState<PuzzlePiece[]>([]);
  const [placed, setPlaced] = useState<Record<string, { row: number; col: number }>>({});

  useEffect(() => {
    setShuffled([...pieces].sort(() => Math.random() - 0.5));
  }, [pieces]);

  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const handleSlotClick = (row: number, col: number) => {
    if (!selectedPiece) return;
    const piece = pieces.find((p) => p.id === selectedPiece);
    if (!piece) return;
    const isCorrect = piece.correct_row === row && piece.correct_col === col;
    if (isCorrect) {
      setPlaced((prev) => {
        const next = { ...prev, [selectedPiece]: { row, col } };
        const allPlaced = pieces.every((p) => next[p.id]);
        if (allPlaced) {
          const response = { item_id: "puzzle", client_response_id: crypto.randomUUID(), value: { completed: true }, elapsed_ms: Date.now(), hint_level: 0 };
          const result = { item_id: "puzzle", is_correct: true, score: 1, hint_level: 0 };
          onResult(response, result);
        }
        return next;
      });
    }
    setSelectedPiece(null);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-kids)" }}>
        {selectedPiece ? "Tap the right spot!" : "Tap a piece, then tap where it goes!"}
      </p>
      <div
        className="grid gap-1 rounded-2xl border-2 p-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          borderColor: "var(--color-brand-jacaranda)",
        }}
      >
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const placedPiece = pieces.find((p) => placed[p.id]?.row === row && placed[p.id]?.col === col);
          return (
            <button
              key={idx}
              onClick={() => handleSlotClick(row, col)}
              className="flex h-24 w-24 items-center justify-center rounded-xl border-2 text-4xl"
              style={{
                borderColor: placedPiece ? "#5BA85B" : "#E0E0E0",
                backgroundColor: placedPiece ? "#E8F5E9" : "var(--color-surface-0)",
              }}
            >
              {placedPiece?.emoji ?? ""}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {shuffled.filter((p) => !placed[p.id]).map((piece) => (
          <button
            key={piece.id}
            onClick={() => setSelectedPiece(piece.id)}
            className="flex h-20 w-20 items-center justify-center rounded-xl border-4 text-4xl transition-transform hover:scale-105"
            style={{
              borderColor: selectedPiece === piece.id ? "#F2A93B" : "#E0E0E0",
              backgroundColor: "var(--color-surface-1)",
            }}
          >
            {piece.emoji ?? "❓"}
          </button>
        ))}
      </div>
    </div>
  );
}
