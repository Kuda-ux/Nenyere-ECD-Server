/**
 * Colouring engine — tap a colour, then tap a region to fill it.
 * Regions are rendered as SVG polygons/paths from activity data so each
 * colouring page is a real picture (sun, garden, house…).
 * accept_any regions = free colouring; correct_colour regions teach colours.
 */
"use client";
import { useState } from "react";
import type { EngineComponentProps } from "./registry";
import { useSound } from "@/hooks/use-sound";

interface Region {
  id: string;
  label?: string;
  /** SVG polygon points ("x,y x,y") or path ("M…") or "circle:cx,cy,r" */
  path: string;
  default_fill?: string;
  correct_colour?: string;
  accept_any?: boolean;
}
interface ColouringActivityData {
  svg_template?: string;
  regions: Region[];
  palette: string[];
  show_guide?: boolean;
}

const FALLBACK_REGIONS: Region[] = [
  { id: "r-sky", path: "0,0 400,0 400,150 0,150", correct_colour: "#87CEEB", accept_any: true },
  { id: "r-sun", path: "circle:320,55,40", correct_colour: "#F2A93B", accept_any: true },
  { id: "r-grass", path: "0,150 400,150 400,300 0,300", correct_colour: "#5BA85B", accept_any: true },
];

function RegionShape({ region, fill, onTap }: { region: Region; fill: string; onTap: () => void }) {
  const common = {
    fill,
    stroke: "#444",
    strokeWidth: 3,
    strokeLinejoin: "round" as const,
    onClick: onTap,
    onPointerDown: onTap,
    style: { cursor: "pointer" as const },
  };
  if (region.path.startsWith("circle:")) {
    const [cx, cy, r] = region.path.slice(7).split(",").map(Number);
    return <circle cx={cx} cy={cy} r={r} {...common} />;
  }
  if (region.path.startsWith("ellipse:")) {
    const [cx, cy, rx, ry] = region.path.slice(8).split(",").map(Number);
    return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...common} />;
  }
  if (region.path.startsWith("M") || region.path.startsWith("m")) {
    return <path d={region.path} {...common} />;
  }
  return <polygon points={region.path} {...common} />;
}

export function ColouringEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as ColouringActivityData;
  const { play: playSound } = useSound();
  const regions = a.regions ?? FALLBACK_REGIONS;
  const palette = a.palette ?? ["#F2A93B", "#3B7DD8", "#5BA85B", "#E85D5D"];
  const showGuide = a.show_guide !== false && regions.some((r) => !r.accept_any);

  const [selectedColour, setSelectedColour] = useState(palette[0]);
  const [colouredRegions, setColouredRegions] = useState<Record<string, string>>({});
  const allColoured = regions.every((r) => colouredRegions[r.id]);

  const handleRegionClick = (regionId: string) => {
    playSound("pop");
    setColouredRegions((prev) => {
      const next = { ...prev, [regionId]: selectedColour };
      if (regions.every((r) => next[r.id])) {
        const score = regions.filter(
          (r) => r.accept_any || !r.correct_colour || r.correct_colour.toLowerCase() === next[r.id].toLowerCase(),
        ).length / regions.length;
        const response = {
          item_id: "colouring",
          client_response_id: crypto.randomUUID(),
          value: { regions: next },
          elapsed_ms: Date.now(),
          hint_level: 0,
        };
        const result = { item_id: "colouring", is_correct: score >= 0.5, score, hint_level: 0 };
        setTimeout(() => onResult(response, result), 900);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>
        Tap a colour, then tap the picture! 🖍️
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {palette.map((c) => (
          <button
            key={c}
            onClick={() => { playSound("tap"); setSelectedColour(c); }}
            className={[
              "h-16 w-16 rounded-full border-4 shadow-md transition-all",
              selectedColour === c ? "scale-110 anim-pulse-glow" : "hover:scale-105 active:scale-95",
            ].join(" ")}
            style={{
              backgroundColor: c,
              borderColor: selectedColour === c ? "#333" : "rgba(0,0,0,0.1)",
            }}
            aria-label={`Colour ${c}`}
          />
        ))}
      </div>
      <svg viewBox="0 0 400 300" className="w-full max-w-lg touch-none rounded-2xl border-4 shadow-inner" style={{ borderColor: "var(--color-brand-jacaranda)", backgroundColor: "white" }}>
        {regions.map((r) => (
          <RegionShape
            key={r.id}
            region={r}
            fill={colouredRegions[r.id] ?? r.default_fill ?? "#FFFFFF"}
            onTap={() => handleRegionClick(r.id)}
          />
        ))}
      </svg>
      {showGuide && !allColoured && (
        <div className="flex flex-wrap justify-center gap-3 text-sm text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>
          {regions.filter((r) => !r.accept_any && r.correct_colour && !colouredRegions[r.id]).map((r) => (
            <span key={r.id} className="flex items-center gap-1">
              <span className="inline-block h-4 w-4 rounded-full border" style={{ backgroundColor: r.correct_colour }} />
              {r.label ?? r.id}
            </span>
          ))}
        </div>
      )}
      {allColoured && (
        <p className="text-2xl font-bold text-green-600 anim-bounce-in" style={{ fontFamily: "var(--font-kids)" }}>
          Beautiful picture! 🎨
        </p>
      )}
    </div>
  );
}
