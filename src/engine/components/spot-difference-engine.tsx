/**
 * Spot-difference engine — two pictures side by side, tap the differences.
 * Renders a sunny garden scene (sun, house, tree, ball). The right picture
 * has small changes; zones come from activity.differences (cx, cy, radius).
 * Tablet-first: pointer events with a generous tap tolerance.
 */
"use client";
import { useState } from "react";
import type { EngineComponentProps } from "./registry";
import { useSound } from "@/hooks/use-sound";

interface DiffZone { id: string; cx?: number; cy?: number; x?: number; y?: number; radius: number; }

const FALLBACK_DIFFS: DiffZone[] = [
  { id: "d1", cx: 0.3, cy: 0.25, radius: 0.17 },   // sun ring
  { id: "d2", cx: 0.75, cy: 0.45, radius: 0.08 },  // extra ball
  { id: "d3", cx: 0.21, cy: 0.66, radius: 0.1 },   // stripe on tree
];

export function SpotDifferenceEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as { differences?: DiffZone[]; tap_tolerance?: number };
  const { play: playSound } = useSound();
  const differences = a.differences ?? FALLBACK_DIFFS;
  const tolerance = a.tap_tolerance ?? 1.2;
  const [found, setFound] = useState<Set<string>>(new Set());
  const [missPos, setMissPos] = useState<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    for (const diff of differences) {
      const dx = diff.cx ?? diff.x ?? 0;
      const dy = diff.cy ?? diff.y ?? 0;
      const dist = Math.sqrt((x - dx) ** 2 + (y - dy) ** 2);
      if (dist < diff.radius * tolerance && !found.has(diff.id)) {
        playSound("correct");
        const next = new Set(found);
        next.add(diff.id);
        setFound(next);
        if (next.size === differences.length) {
          const response = {
            item_id: "spot-difference",
            client_response_id: crypto.randomUUID(),
            value: { found: Array.from(next) },
            elapsed_ms: Date.now(),
            hint_level: 0,
          };
          const result = { item_id: "spot-difference", is_correct: true, score: 1, hint_level: 0 };
          setTimeout(() => onResult(response, result), 900);
        }
        return;
      }
    }
    playSound("tap");
    setMissPos({ x, y });
    setTimeout(() => setMissPos(null), 500);
  };

  const renderScene = (isRight: boolean) => (
    <svg
      viewBox="0 0 200 200"
      className="w-full touch-none rounded-2xl border-4 shadow-md"
      style={{ borderColor: "var(--color-brand-jacaranda)", backgroundColor: "#E3F2FD" }}
      onPointerDown={handlePointerDown}
    >
      {/* Sky + ground */}
      <rect x={0} y={150} width={200} height={50} fill="#A5D6A7" />
      {/* Sun */}
      <circle cx={60} cy={50} r={30} fill="#F2A93B" />
      {isRight && <circle cx={60} cy={50} r={30} fill="#F2A93B" stroke="#E85D5D" strokeWidth={5} />}
      {/* Tree */}
      <rect x={38} y={120} width={10} height={40} fill="#8D6E63" />
      <circle cx={43} cy={108} r={28} fill="#5BA85B" />
      {isRight && <rect x={25} y={125} width={35} height={12} fill="#9C27B0" rx={4} />}
      {/* House */}
      <rect x={95} y={95} width={65} height={45} fill="#3B7DD8" rx={8} />
      <polygon points="90,95 128,70 165,95" fill="#E85D5D" />
      <rect x={118} y={115} width={18} height={25} fill="#FFE082" rx={3} />
      {/* Ball */}
      <circle cx={150} cy={60} r={18} fill="#E85D5D" />
      {isRight && <circle cx={150} cy={90} r={12} fill="#E85D5D" />}
      {/* Miss marker */}
      {missPos && (
        <circle cx={missPos.x * 200} cy={missPos.y * 200} r={10} fill="none" stroke="#E85D5D" strokeWidth={3} opacity={0.6} />
      )}
      {/* Found markers */}
      {Array.from(found).map((id) => {
        const diff = differences.find((d) => d.id === id);
        if (!diff) return null;
        const dx = diff.cx ?? diff.x ?? 0;
        const dy = diff.cy ?? diff.y ?? 0;
        return (
          <circle
            key={id}
            cx={dx * 200}
            cy={dy * 200}
            r={diff.radius * 200 + 8}
            fill="none"
            stroke="#5BA85B"
            strokeWidth={5}
            strokeDasharray="10 6"
          />
        );
      })}
    </svg>
  );

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
        Find the differences! ({found.size} / {differences.length}) 👀
      </p>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-center text-base font-bold" style={{ fontFamily: "var(--font-kids)" }}>Picture 1</p>
          {renderScene(false)}
        </div>
        <div>
          <p className="mb-1 text-center text-base font-bold" style={{ fontFamily: "var(--font-kids)" }}>Picture 2</p>
          {renderScene(true)}
        </div>
      </div>
      {found.size === differences.length && (
        <p className="text-2xl font-bold text-green-600 anim-bounce-in" style={{ fontFamily: "var(--font-kids)" }}>
          You found them all! 🎉
        </p>
      )}
    </div>
  );
}
