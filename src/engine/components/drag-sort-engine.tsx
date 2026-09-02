/**
 * Drag-sort engine component.
 * Renders sorting, sequence_ordering, pattern_completion.
 * Drag items into correct slots.
 */
"use client";

import { useState, useCallback } from "react";
import type { DragSortActivity, SortItem } from "../schema/drag-sort";
import { ContentImage } from "./content-image";

type Props = {
  activity: DragSortActivity;
  onResult: (responses: Array<{ item_id: string; placed_slot_id: string; hint_level: number }>) => void;
  hintLevel: number;
};

export function DragSortEngine({ activity, onResult, hintLevel }: Props) {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = useCallback((itemId: string) => {
    setDraggedItem(itemId);
  }, []);

  const handleDrop = useCallback(
    (slotId: string) => {
      if (!draggedItem) return;
      setPlacements((prev) => ({ ...prev, [draggedItem]: slotId }));
      setDraggedItem(null);

      // Check if all items placed
      const newPlacements = { ...placements, [draggedItem]: slotId };
      if (Object.keys(newPlacements).length === activity.items.length) {
        const responses = activity.items.map((item) => ({
          item_id: item.id,
          placed_slot_id: newPlacements[item.id],
          hint_level: Math.min(hintLevel, 2),
        }));
        onResult(responses);
      }
    },
    [draggedItem, placements, activity.items, onResult, hintLevel],
  );

  // For touch devices: tap-to-select then tap-to-place
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleItemTap = useCallback((itemId: string) => {
    setSelectedItem(itemId);
  }, []);

  const handleSlotTap = useCallback(
    (slotId: string) => {
      if (!selectedItem) return;
      handleDrop(slotId);
      setSelectedItem(null);
    },
    [selectedItem, handleDrop],
  );

  const unplacedItems = activity.items.filter((item) => !(item.id in placements));

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Items tray */}
      {unplacedItems.length > 0 && (
        <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4">
          {unplacedItems.map((item) => (
            <button
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onClick={() => handleItemTap(item.id)}
              className={[
                "flex items-center justify-center rounded-xl border-4 p-3 transition-all active:scale-95",
                selectedItem === item.id
                  ? "border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/10"
                  : "border-[var(--color-surface-2)] bg-white",
              ].join(" ")}
              style={{ minHeight: "60px", minWidth: "60px" }}
            >
              <ItemContent item={item} />
            </button>
          ))}
        </div>
      )}

      {/* Slots */}
      <div className={activity.layout === "sequence" ? "flex gap-2" : "grid grid-cols-2 gap-4 sm:grid-cols-3"}>
        {activity.slots.map((slot) => {
          const placedItems = activity.items.filter((item) => placements[item.id] === slot.id);

          return (
            <div
              key={slot.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(slot.id)}
              onClick={() => handleSlotTap(slot.id)}
              className={[
                "flex min-h-[100px] min-w-[100px] flex-col items-center justify-center gap-2 rounded-2xl border-4 border-dashed p-4 transition-colors",
                draggedItem || selectedItem
                  ? "border-[var(--color-brand-sun)] bg-[var(--color-brand-sun)]/5"
                  : "border-[var(--color-surface-2)] bg-white",
              ].join(" ")}
            >
              {slot.label && (
                <span className="text-sm font-semibold text-ink-500">{slot.label.en}</span>
              )}
              {slot.image && <ContentImage src={slot.image.en} alt="" containerClassName="h-8 w-8" />}
              {placedItems.map((item) => (
                <div key={item.id} className="rounded-lg border-2 border-[var(--color-success)] p-2">
                  <ItemContent item={item} />
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
  if (item.text) return <span className="font-bold" style={{ fontFamily: "var(--font-kids)" }}>{item.text.en}</span>;
  if (item.shape) return <SimpleShape shape={item.shape} colour={item.colour} />;
  if (item.colour) return <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: item.colour }} />;
  return null;
}

function SimpleShape({ shape, colour }: { shape: string; colour?: string }) {
  const fill = colour ?? "var(--color-brand-sun)";
  const s = 32;
  switch (shape) {
    case "circle": return <svg width={s} height={s}><circle cx={s/2} cy={s/2} r={s/2-2} fill={fill} /></svg>;
    case "square": return <svg width={s} height={s}><rect x={2} y={2} width={s-4} height={s-4} fill={fill} rx={4} /></svg>;
    case "triangle": return <svg width={s} height={s}><polygon points={`${s/2},2 ${s-2},${s-2} 2,${s-2}`} fill={fill} /></svg>;
    case "star": return <svg width={s} height={s}><polygon points="16,2 19,12 30,12 21,19 24,30 16,23 8,30 11,19 2,12 13,12" fill={fill} /></svg>;
    default: return null;
  }
}
