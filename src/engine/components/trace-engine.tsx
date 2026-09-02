/**
 * Trace engine component.
 * Renders tracing activities (letters, shapes, lines).
 * Uses pointer events to capture child's stroke and compares to guide path.
 * Per docs/activity-engine.md §7 (pre-writing trace algorithm)
 */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { TraceActivity, TraceItem } from "../schema/trace";
import type { ItemResponse, ItemResult } from "../schema/common";

type Props = {
  activity: TraceActivity;
  item: TraceItem;
  onResult: (response: ItemResponse, result: ItemResult) => void;
  hintLevel: number;
};

type Point = { x: number; y: number };

export function TraceEngine({ activity, item, onResult, hintLevel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userPoints, setUserPoints] = useState<Point[]>([]);
  const [completedStrokes, setCompletedStrokes] = useState<number>(0);
  const [currentStroke, setCurrentStroke] = useState(0);
  const startTimeRef = useRef(Date.now());

  const stroke = item.strokes[currentStroke];

  // Draw guide path on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw completed strokes in solid colour
    for (let i = 0; i < completedStrokes && i < item.strokes.length; i++) {
      drawPath(ctx, item.strokes[i].points, w, h, item.strokes[i].colour, item.strokes[i].width, false);
    }

    // Draw current guide as dotted
    if (stroke) {
      drawPath(ctx, stroke.points, w, h, stroke.colour, stroke.width, true);
      // Draw starting dot
      if (activity.show_starting_dot && stroke.points.length > 0) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 8, 0, Math.PI * 2);
        ctx.fillStyle = stroke.colour;
        ctx.fill();
      }
    }

    // Draw user's current stroke
    if (userPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(userPoints[0].x * w, userPoints[0].y * h);
      for (let i = 1; i < userPoints.length; i++) {
        ctx.lineTo(userPoints[i].x * w, userPoints[i].y * h);
      }
      ctx.strokeStyle = stroke?.colour ?? "#F2A93B";
      ctx.lineWidth = stroke?.width ?? 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }, [completedStrokes, userPoints, stroke, activity.show_starting_dot, item.strokes]);

  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pt = getCanvasPoint(e);
    setUserPoints([pt]);
  }, [getCanvasPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getCanvasPoint(e);
    setUserPoints((prev) => [...prev, pt]);
  }, [isDrawing, getCanvasPoint]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || userPoints.length < 2) {
      setIsDrawing(false);
      return;
    }
    setIsDrawing(false);

    // Compute coverage and deviation against current guide stroke
    const guide = stroke.points;
    let covered = 0;
    let totalDeviation = 0;

    for (const gp of guide) {
      let minDist = Infinity;
      for (const up of userPoints) {
        const d = Math.hypot(gp.x - up.x, gp.y - up.y);
        if (d < minDist) minDist = d;
      }
      if (minDist <= item.tolerance * 2) covered++;
      totalDeviation += minDist;
    }

    const coverage = covered / guide.length;
    const avgDeviation = totalDeviation / guide.length;

    // Accept stroke if coverage >= min_coverage
    if (coverage >= item.min_coverage) {
      const newCompleted = completedStrokes + 1;
      setCompletedStrokes(newCompleted);
      setUserPoints([]);

      // If all strokes done, submit result
      if (newCompleted >= item.strokes.length) {
        const elapsed = Date.now() - startTimeRef.current;
        const response: ItemResponse = {
          item_id: item.id,
          client_response_id: crypto.randomUUID(),
          value: { coverage, deviation: avgDeviation, strokes_completed: newCompleted },
          elapsed_ms: elapsed,
          hint_level: Math.min(hintLevel, 2),
        };
        const result: ItemResult = {
          item_id: item.id,
          is_correct: coverage >= item.min_coverage && avgDeviation <= item.tolerance,
          score: coverage * (avgDeviation <= item.tolerance ? 1 : 0.5),
          hint_level: Math.min(hintLevel, 2),
        };
        onResult(response, result);
      } else {
        setCurrentStroke(newCompleted);
      }
    } else {
      // Reset stroke — encourage retry
      setUserPoints([]);
    }
  }, [isDrawing, userPoints, stroke, item, completedStrokes, onResult, hintLevel]);

  return (
    <div className="flex flex-col items-center gap-4">
      {item.label && (
        <p
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-kids)" }}
        >
          {item.label.en}
        </p>
      )}

      <canvas
        ref={canvasRef}
        width={activity.canvas_width}
        height={activity.canvas_height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="touch-none rounded-2xl border-4 border-[var(--color-surface-2)] bg-white"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      {/* Brush colour picker */}
      <div className="flex gap-2">
        {activity.brush_colours.map((colour) => (
          <div
            key={colour}
            className="h-8 w-8 rounded-full border-2 border-[var(--color-surface-2)]"
            style={{ backgroundColor: colour }}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2">
        {item.strokes.map((_, i) => (
          <div
            key={i}
            className={[
              "h-3 w-8 rounded-full",
              i < completedStrokes ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-2)]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

// ── Helper: draw a path on canvas ───────────────────────────────────────────
function drawPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  w: number,
  h: number,
  colour: string,
  width: number,
  dotted: boolean,
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x * w, points[0].y * h);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * w, points[i].y * h);
  }
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (dotted) {
    ctx.setLineDash([8, 8]);
    ctx.globalAlpha = 0.4;
  } else {
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}
