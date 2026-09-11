/**
 * Join-dots engine — connect numbered dots in order to reveal a picture.
 * Tablet-first: uses pointer events (touch, pen, mouse) with pointer capture,
 * and also supports tap-to-connect (tap the next numbered dot) which is
 * easier for 4–6 year olds than a continuous drag.
 */
"use client";
import { useState, useRef, useCallback } from "react";
import type { EngineComponentProps } from "./registry";
import { useSound } from "@/hooks/use-sound";

interface DotPoint { id: string; x: number; y: number; label?: string; number?: number; }

export function JoinDotsEngine({ activity, itemIndex = 0, onResult }: EngineComponentProps) {
  const a = activity as unknown as {
    items: Array<{
      id: string;
      dots: DotPoint[];
      correct_sequence?: string[];
      reveal_label?: { en?: string };
      reveal_image?: { en?: string };
    }>;
    show_numbers?: boolean;
    line_colour?: string;
  };
  const { play: playSound } = useSound();
  const item = a.items?.[itemIndex] ?? a.items?.[0];
  const showNumbers = a.show_numbers !== false;
  const lineColour = a.line_colour ?? "#F2A93B";

  const dots: DotPoint[] = item?.dots ?? [
    { id: "d1", x: 0.2, y: 0.2, number: 1 },
    { id: "d2", x: 0.8, y: 0.2, number: 2 },
    { id: "d3", x: 0.8, y: 0.8, number: 3 },
    { id: "d4", x: 0.2, y: 0.8, number: 4 },
  ];

  // Resolve the intended order: explicit correct_sequence > number > label-as-int
  const orderedIds: string[] = item?.correct_sequence?.length
    ? item.correct_sequence
    : [...dots]
        .sort((d1, d2) => {
          const n1 = d1.number ?? parseInt(d1.label ?? "0", 10);
          const n2 = d2.number ?? parseInt(d2.label ?? "0", 10);
          return n1 - n2;
        })
        .map((d) => d.id);

  const [connected, setConnected] = useState<number>(0);
  const [lines, setLines] = useState<Array<{ from: DotPoint; to: DotPoint }>>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DotPoint | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [done, setDone] = useState(false);

  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  }, []);

  const finishItem = useCallback(() => {
    setDone(true);
    playSound("celebrate");
    const response = {
      item_id: item?.id ?? "join-dots",
      client_response_id: crypto.randomUUID(),
      value: { sequence: orderedIds },
      elapsed_ms: Date.now(),
      hint_level: 0,
    };
    const result = { item_id: item?.id ?? "join-dots", is_correct: true, score: 1, hint_level: 0 };
    setTimeout(() => onResult(response, result), 1200);
  }, [item, orderedIds, onResult, playSound]);

  const connectTo = useCallback((dot: DotPoint) => {
    if (dot.id !== orderedIds[connected]) return false;
    const from = dots.find((d) => d.id === orderedIds[connected - 1]);
    if (from) {
      setLines((prev) => [...prev, { from, to: dot }]);
    }
    playSound("pop");
    const next = connected + 1;
    setConnected(next);
    if (next >= orderedIds.length) {
      finishItem();
    }
    return true;
  }, [orderedIds, connected, dots, playSound, finishItem]);

  const handleDotDown = useCallback((e: React.PointerEvent, dot: DotPoint) => {
    e.preventDefault();
    if (dot.id !== orderedIds[connected]) return;
    try { svgRef.current?.setPointerCapture(e.pointerId); } catch { /* noop */ }
    setIsDragging(true);
    setDragStart(dot);
  }, [orderedIds, connected]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !svgRef.current) return;
    setPointerPos(svgPoint(e.clientX, e.clientY));
  }, [isDragging, svgPoint]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setPointerPos(null);
  }, []);

  // Tap-to-connect: tapping the next dot (without dragging) connects it
  const handleDotTap = useCallback((dot: DotPoint) => {
    if (isDragging && dragStart) {
      // Coming from a drag-release on this dot
      if (dot.id === orderedIds[connected]) connectTo(dot);
      endDrag();
      return;
    }
    connectTo(dot);
  }, [isDragging, dragStart, orderedIds, connected, connectTo, endDrag]);

  const revealText = item?.reveal_label?.en;
  const revealEmoji = item?.reveal_image?.en;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
        {done ? "Beautiful!" : `Connect the dots in order! (${connected} / ${orderedIds.length})`}
      </p>
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full max-w-md touch-none select-none rounded-2xl border-4"
        style={{ borderColor: "var(--color-brand-jacaranda)", backgroundColor: "var(--color-surface-0)" }}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {lines.map((line, i) => (
          <line key={i} x1={line.from.x * 400} y1={line.from.y * 400} x2={line.to.x * 400} y2={line.to.y * 400} stroke={lineColour} strokeWidth={6} strokeLinecap="round" />
        ))}
        {isDragging && dragStart && pointerPos && (
          <line x1={dragStart.x * 400} y1={dragStart.y * 400} x2={pointerPos.x * 400} y2={pointerPos.y * 400} stroke={lineColour} strokeWidth={4} strokeLinecap="round" strokeDasharray="8 6" opacity={0.7} />
        )}
        {done && revealEmoji && (
          <text x={200} y={215} textAnchor="middle" fontSize={140} className="anim-pop-scale">{revealEmoji}</text>
        )}
        {!done && dots.map((dot, orderIdx) => {
          const seqIdx = orderedIds.indexOf(dot.id);
          const isNext = seqIdx === connected;
          const isDoneDot = seqIdx >= 0 && seqIdx < connected;
          const numLabel = dot.number ?? dot.label ?? String(orderIdx + 1);
          return (
            <g key={dot.id}
              onPointerDown={(e) => handleDotDown(e, dot)}
              onPointerUp={() => handleDotTap(dot)}
              style={{ cursor: isNext ? "pointer" : "default" }}
            >
              {/* generous invisible hit target for small fingers */}
              <circle cx={dot.x * 400} cy={dot.y * 400} r={36} fill="transparent" />
              <circle
                cx={dot.x * 400}
                cy={dot.y * 400}
                r={isNext ? 30 : 22}
                fill={isDoneDot ? "#5BA85B" : isNext ? "#F2A93B" : "#E0E0E0"}
                stroke={isNext ? "#B47B00" : "#888"}
                strokeWidth={isNext ? 4 : 2}
              />
              {showNumbers && (
                <text x={dot.x * 400} y={dot.y * 400 + 8} textAnchor="middle" fontSize={24} fontWeight="bold" fill={isNext || isDoneDot ? "#fff" : "#555"} pointerEvents="none">
                  {numLabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {done && (
        <p className="text-2xl font-bold text-[var(--color-success)] anim-bounce-in" style={{ fontFamily: "var(--font-kids)" }}>
          {revealText ? `You made a ${revealText}!` : "You did it!"} 🎉
        </p>
      )}
    </div>
  );
}
