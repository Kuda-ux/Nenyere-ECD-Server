"use client";
import { useState } from "react";
import type { EngineComponentProps } from "./registry";

interface Region { id: string; label?: string; default_fill: string; }
interface ColouringActivityData {
  svg_template: string;
  regions: Region[];
  palette: string[];
}

export function ColouringEngine({ activity, onResult }: EngineComponentProps) {
  const a = activity as unknown as ColouringActivityData;
  const regions = a.regions ?? [
    { id: "r1", label: "Sun", default_fill: "#FFFFFF" },
    { id: "r2", label: "Sky", default_fill: "#FFFFFF" },
    { id: "r3", label: "Grass", default_fill: "#FFFFFF" },
  ];
  const palette = a.palette ?? ["#F2A93B", "#3B7DD8", "#5BA85B", "#E85D5D"];
  const [selectedColour, setSelectedColour] = useState(palette[0]);
  const [colouredRegions, setColouredRegions] = useState<Record<string, string>>({});
  const allColoured = regions.every((r) => colouredRegions[r.id]);

  const handleRegionClick = (regionId: string) => {
    setColouredRegions((prev) => {
      const next = { ...prev, [regionId]: selectedColour };
      const done = regions.every((r) => next[r.id]);
      if (done) {
        const response = { item_id: "colouring", client_response_id: crypto.randomUUID(), value: { regions: next }, elapsed_ms: Date.now(), hint_level: 0 };
        const result = { item_id: "colouring", is_correct: true, score: 1, hint_level: 0 };
        onResult(response, result);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-kids)" }}>
        Tap a colour, then tap a shape to colour it!
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {palette.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedColour(c)}
            className="h-10 w-10 rounded-full border-4 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: selectedColour === c ? "#333" : "transparent",
            }}
            aria-label={`Colour ${c}`}
          />
        ))}
      </div>
      <svg viewBox="0 0 400 300" className="w-full max-w-md rounded-2xl border-2" style={{ borderColor: "var(--color-brand-jacaranda)" }}>
        {regions.map((r, i) => {
          const fill = colouredRegions[r.id] ?? r.default_fill;
          const common = { fill, stroke: "#333", strokeWidth: 2, onClick: () => handleRegionClick(r.id), style: { cursor: "pointer" as const } };
          if (i % 3 === 0) return <circle key={r.id} cx={80} cy={60} r={40} {...common} />;
          if (i % 3 === 1) return <rect key={r.id} x={0} y={100} width={400} height={100} {...common} />;
          return <rect key={r.id} x={0} y={200} width={400} height={100} {...common} />;
        })}
      </svg>
      {allColoured && <p className="text-lg font-bold text-green-600">Beautiful! All coloured! 🎨</p>}
    </div>
  );
}
