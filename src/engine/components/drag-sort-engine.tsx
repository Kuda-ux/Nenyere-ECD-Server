/**
 * Drag-sort engine component — Enhanced with gradient cards, tap-to-place
 * for tablets, sound feedback, and playful animations.
 * Renders sorting, sequence_ordering, pattern_completion.
 */
"use client";

import { useState, useCallback } from "react";
import type { DragSortActivity, SortItem } from "../schema/drag-sort";
import { ContentImage } from "./content-image";
import { useSound } from "@/hooks/use-sound";

const SLOT_GRADIENTS = [
  "linear-gradient(135deg, #FFF9E6, #FFE082)",
  "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
  "linear-gradient(135deg, #F3E5F5, #E1BEE7)",
  "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
];

const SHAPE_EMOJI: Record<string, string> = {
  star: "⭐",
  circle: "🔵",
  square: "🟦",
  triangle: "🔺",
  heart: "❤️",
  diamond: "💎",
};

type Props = {
  activity: DragSortActivity;
  onResult: (responses: Array<{ item_id: string; placed_slot_id: string; hint_level: number }>) => void;
  hintLevel: number;
};

export function DragSortEngine({ activity, onResult, hintLevel }: Props) {
  const { play: playSound } = useSound();
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleDragStart = useCallback((itemId: string) => {
    setDraggedItem(itemId);
  }, []);

  const handleDrop = useCallback(
    (slotId: string) => {
      const itemToPlace = draggedItem || selectedItem;
      if (!itemToPlace) return;

      playSound("pop");
      setPlacements((prev) => ({ ...prev, [itemToPlace]: slotId }));
      setDraggedItem(null);
      setSelectedItem(null);

      const newPlacements = { ...placements, [itemToPlace]: slotId };
      if (Object.keys(newPlacements).length === activity.items.length) {
        playSound("correct");
        const responses = activity.items.map((item) => ({
          item_id: item.id,
          placed_slot_id: newPlacements[item.id],
          hint_level: Math.min(hintLevel, 2),
        }));
        onResult(responses);
      }
    },
    [draggedItem, selectedItem, placements, activity.items, onResult, hintLevel, playSound],
  );

  const handleItemTap = useCallback((itemId: string) => {
    playSound("tap");
    setSelectedItem(itemId);
  }, [playSound]);

  const handleSlotTap = useCallback(
    (slotId: string) => {
      if (!selectedItem && !draggedItem) return;
      handleDrop(slotId);
    },
    [selectedItem, draggedItem, handleDrop],
  );

  const unplacedItems = activity.items.filter((item) => !(item.id in placements));

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Items tray — themed */}
      {unplacedItems.length > 0 && (
        <div
          className="flex flex-wrap gap-3 rounded-3xl p-5 shadow-md"
          style={{ background: "linear-gradient(135deg, #F8F9FF, #E3F2FD)" }}
        >
          <p className="w-full text-center text-sm font-bold text-[var(--color-ink-500)]" style={{ fontFamily: "var(--font-kids)" }}>
            👆 Tap a shape, then tap a box!
          </p>
          {unplacedItems.map((item) => (
            <button
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onClick={() => handleItemTap(item.id)}
              className={[
                "flex items-center justify-center rounded-2xl p-3 transition-all active:scale-95 shadow-md",
                "anim-pop-scale",
                selectedItem === item.id
                  ? "ring-4 ring-[var(--color-brand-sun)] anim-pulse-glow scale-110"
                  : "hover:scale-105 hover:shadow-lg",
              ].join(" ")}
              style={{
                minHeight: "70px",
                minWidth: "70px",
                background: "white",
              }}
            >
              <ItemContent item={item} />
            </button>
          ))}
        </div>
      )}

      {/* Slots — themed with gradients */}
      <div className={activity.layout === "sequence" ? "flex gap-3" : "grid grid-cols-2 gap-4 sm:grid-cols-3"}>
        {activity.slots.map((slot, idx) => {
          const placedItems = activity.items.filter((item) => placements[item.id] === slot.id);
          const gradient = SLOT_GRADIENTS[idx % SLOT_GRADIENTS.length];
          const hasItemToPlace = draggedItem || selectedItem;

          return (
            <div
              key={slot.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(slot.id)}
              onClick={() => handleSlotTap(slot.id)}
              className={[
                "flex min-h-[110px] min-w-[110px] flex-col items-center justify-center gap-2 rounded-2xl border-4 p-4 transition-all",
                hasItemToPlace
                  ? "border-[var(--color-brand-sun)] border-dashed anim-pulse-glow cursor-pointer"
                  : placedItems.length > 0
                    ? "border-[var(--color-success)]"
                    : "border-dashed border-[var(--color-surface-2)]",
              ].join(" ")}
              style={{ background: gradient }}
            >
              {slot.label && (
                <span className="text-base font-bold text-[var(--color-ink-700)]" style={{ fontFamily: "var(--font-kids)" }}>
                  {slot.label.en}
                </span>
              )}
              {slot.image && <ContentImage src={slot.image.en} alt="" containerClassName="h-10 w-10" />}
              {placedItems.map((item) => (
                <div key={item.id} className="rounded-xl ring-2 ring-[var(--color-success)] p-2 bg-white/80 anim-bounce-in">
                  <ItemContent item={item} />
                  <span className="absolute -right-1 -top-1 text-lg">✅</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ItemContent({ item }: { item: SortItem }) {
  if (item.image) return <ContentImage src={item.image.en} alt="" containerClassName="h-10 w-10" />;
  if (item.text) return <span className="text-xl font-bold" style={{ fontFamily: "var(--font-kids)" }}>{item.text.en}</span>;
  if (item.shape) {
    const emoji = SHAPE_EMOJI[item.shape];
    if (emoji) return <span className="text-3xl">{emoji}</span>;
    return <SimpleShape shape={item.shape} colour={item.colour} />;
  }
  if (item.colour) return <div className="h-10 w-10 rounded-xl shadow-inner" style={{ backgroundColor: item.colour }} />;
  return null;
}

function SimpleShape({ shape, colour }: { shape: string; colour?: string }) {
  const fill = colour ?? "var(--color-brand-sun)";
  const s = 36;
  switch (shape) {
    case "circle": return <svg width={s} height={s}><circle cx={s/2} cy={s/2} r={s/2-2} fill={fill} /></svg>;
    case "square": return <svg width={s} height={s}><rect x={2} y={2} width={s-4} height={s-4} fill={fill} rx={6} /></svg>;
    case "triangle": return <svg width={s} height={s}><polygon points={`${s/2},2 ${s-2},${s-2} 2,${s-2}`} fill={fill} /></svg>;
    case "star": return <svg width={s} height={s}><polygon points="18,2 22,14 34,14 24,22 28,34 18,26 8,34 12,22 2,14 14,14" fill={fill} /></svg>;
    default: return null;
  }
}
