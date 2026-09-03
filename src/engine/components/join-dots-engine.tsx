"use client";
import { useState, useRef, useCallback } from "react";
import type { EngineComponentProps } from "./registry";

interface DotPoint { id: string; x: number; y: number; number: number; }

export function JoinDotsEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as { items: Array<{ id: string; dots: DotPoint[] }> };
  const item = a.items?.[0];
  const dots = item?.dots ?? [
    { id: "d1", x: 0.2, y: 0.2, number: 1 },
    { id: "d2", x: 0.8, y: 0.2, number: 2 },
    { id: "d3", x: 0.8, y: 0.8, number: 3 },
    { id: "d4", x: 0.2, y: 0.8, number: 4 },
  ];
  const [connected, setConnected] = useState<number>(0);
  const [lines, setLines] = useState<Array<{ from: DotPoint; to: DotPoint }>>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DotPoint | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleDotDown = useCallback((dot: DotPoint) => {
    if (dot.number !== connected + 1) return;
    setIsDragging(true);
    setDragStart(dot);
  }, [connected]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  }, [isDragging]);

  const handleDotUp = useCallback((dot: DotPoint) => {
    if (!isDragging || !dragStart) return;
    if (dot.number === dragStart.number + 1) {
      setLines((prev) => [...prev, { from: dragStart, to: dot }]);
      setConnected(dot.number);
      if (dot.number === dots.length) {
        const response = { item_id: item?.id ?? "join-dots", client_response_id: crypto.randomUUID(), value: { completed: true }, elapsed_ms: Date.now(), hint_level: 0 };
        const result = { item_id: item?.id ?? "join-dots", is_correct: true, score: 1, hint_level: 0 };
        onResult(response, result);
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setMousePos(null);
  }, [isDragging, dragStart, dots.length, item, onResult]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-kids)" }}>
        Connect the dots in order: {connected} / {dots.length}
      </p>
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full max-w-md rounded-2xl border-2"
        style={{ borderColor: "var(--color-brand-jacaranda)", backgroundColor: "var(--color-surface-0)" }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => { setIsDragging(false); setDragStart(null); setMousePos(null); }}
      >
        {lines.map((line, i) => (
          <line key={i} x1={line.from.x * 400} y1={line.from.y * 400} x2={line.to.x * 400} y2={line.to.y * 400} stroke="#F2A93B" strokeWidth={4} strokeLinecap="round" />
        ))}
        {isDragging && dragStart && mousePos && (
          <line x1={dragStart.x * 400} y1={dragStart.y * 400} x2={mousePos.x * 400} y2={mousePos.y * 400} stroke="#F2A93B" strokeWidth={3} strokeLinecap="round" strokeDasharray="6 4" opacity={0.6} />
        )}
        {dots.map((dot) => {
          const isNext = dot.number === connected + 1;
          const isDone = dot.number <= connected;
          return (
            <g key={dot.id}
              onMouseDown={() => handleDotDown(dot)}
              onMouseUp={() => handleDotUp(dot)}
              style={{ cursor: isNext ? "pointer" : "default" }}
            >
              <circle cx={dot.x * 400} cy={dot.y * 400} r={isNext ? 20 : 16} fill={isDone ? "#5BA85B" : isNext ? "#F2A93B" : "#E0E0E0"} stroke="#333" strokeWidth={2} />
              <text x={dot.x * 400} y={dot.y * 400 + 5} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#333">{dot.number}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
