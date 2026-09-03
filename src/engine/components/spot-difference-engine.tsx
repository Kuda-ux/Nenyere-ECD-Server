"use client";
import { useState } from "react";
import type { EngineComponentProps } from "./registry";

interface DiffZone { id: string; x: number; y: number; radius: number; }

export function SpotDifferenceEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as { differences: DiffZone[] };
  const differences = a.differences ?? [
    { id: "d1", x: 0.3, y: 0.25, radius: 0.06 },
    { id: "d2", x: 0.7, y: 0.5, radius: 0.06 },
    { id: "d3", x: 0.5, y: 0.75, radius: 0.06 },
  ];
  const [found, setFound] = useState<Set<string>>(new Set());

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    for (const diff of differences) {
      const dist = Math.sqrt((x - diff.x) ** 2 + (y - diff.y) ** 2);
      if (dist < diff.radius && !found.has(diff.id)) {
        const next = new Set(found);
        next.add(diff.id);
        setFound(next);
        if (next.size === differences.length) {
          const response = { item_id: "spot-difference", client_response_id: crypto.randomUUID(), value: { found: Array.from(next) }, elapsed_ms: Date.now(), hint_level: 0 };
          const result = { item_id: "spot-difference", is_correct: true, score: 1, hint_level: 0 };
          onResult(response, result);
        }
        return;
      }
    }
  };

  const renderScene = (isRight: boolean) => (
    <svg
      viewBox="0 0 200 200"
      className="w-full rounded-2xl border-2"
      style={{ borderColor: "var(--color-brand-jacaranda)", backgroundColor: "var(--color-surface-0)" }}
      onClick={handleClick}
    >
      <circle cx={60} cy={50} r={25} fill="#F2A93B" />
      <rect x={20} y={120} width={50} height={60} fill="#5BA85B" />
      <rect x={100} y={100} width={60} height={40} fill="#3B7DD8" />
      <circle cx={150} cy={60} r={15} fill="#E85D5D" />
      {isRight && <circle cx={150} cy={90} r={10} fill="#E85D5D" />}
      {isRight && <rect x={30} y={130} width={30} height={10} fill="#9C27B0" />}
      {isRight && <circle cx={60} cy={50} r={25} fill="#F2A93B" stroke="#E85D5D" strokeWidth={3} />}
      {Array.from(found).map((id) => {
        const diff = differences.find((d) => d.id === id);
        if (!diff) return null;
        return (
          <circle
            key={id}
            cx={diff.x * 200}
            cy={diff.y * 200}
            r={diff.radius * 200}
            fill="none"
            stroke="#5BA85B"
            strokeWidth={3}
          />
        );
      })}
    </svg>
  );

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-kids)" }}>
        Find the differences! ({found.size} / {differences.length})
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        <div>
          <p className="text-center text-sm font-medium mb-1">Picture 1</p>
          {renderScene(false)}
        </div>
        <div>
          <p className="text-center text-sm font-medium mb-1">Picture 2</p>
          {renderScene(true)}
        </div>
      </div>
      {found.size === differences.length && (
        <p className="text-lg font-bold text-green-600">You found them all! 🎉</p>
      )}
    </div>
  );
}
