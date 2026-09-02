/**
 * Engine registry — maps engine names to their React components.
 * Per docs/activity-engine.md §3
 */
import type { Engine } from "../schema/common";
import type { AnyActivity } from "../schema";

import { ChoiceEngine } from "./choice-engine";
import { MatchEngine } from "./match-engine";
import { CountingEngine } from "./counting-engine";
import { TraceEngine } from "./trace-engine";
import { MemoryEngine } from "./memory-engine";
import { StoryEngine } from "./story-engine";
import { DragSortEngine } from "./drag-sort-engine";

export type EngineComponentProps = {
  activity: AnyActivity;
  onResult: (response: import("../schema/common").ItemResponse, result: import("../schema/common").ItemResult) => void;
  hintLevel: number;
};

export function getEngineComponent(engine: Engine): React.ComponentType<EngineComponentProps> {
  switch (engine) {
    case "choice":
      return ChoiceEngineWrapper;
    case "match":
      return MatchEngineWrapper;
    case "counting":
      return CountingEngineWrapper;
    case "trace":
      return TraceEngineWrapper;
    case "memory":
      return MemoryEngineWrapper;
    case "story":
      return StoryEngineWrapper;
    case "drag-sort":
      return DragSortEngineWrapper;
    // Engines with placeholder wrappers (to be implemented with full UI)
    case "join-dots":
      return PlaceholderEngine;
    case "colouring":
      return PlaceholderEngine;
    case "sequence":
      return PlaceholderEngine;
    case "puzzle":
      return PlaceholderEngine;
    case "spot-difference":
      return PlaceholderEngine;
    default:
      return PlaceholderEngine;
  }
}

// ── Wrapper components to adapt engine-specific props to common interface ──

function ChoiceEngineWrapper({ activity, onResult, hintLevel }: EngineComponentProps) {
  if (activity.engine !== "choice") return null;
  const item = activity.items[0]; // Runner handles item indexing
  return <ChoiceEngine activity={activity} item={item} onResult={onResult} hintLevel={hintLevel} />;
}

function MatchEngineWrapper({ activity, onResult, hintLevel }: EngineComponentProps) {
  if (activity.engine !== "match") return null;
  return <MatchEngine activity={activity} onResult={onResult} hintLevel={hintLevel} />;
}

function CountingEngineWrapper({ activity, onResult, hintLevel }: EngineComponentProps) {
  if (activity.engine !== "counting") return null;
  const item = activity.items[0];
  return <CountingEngine activity={activity} item={item} onResult={onResult} hintLevel={hintLevel} />;
}

function TraceEngineWrapper({ activity, onResult, hintLevel }: EngineComponentProps) {
  if (activity.engine !== "trace") return null;
  const item = activity.items[0];
  return <TraceEngine activity={activity} item={item} onResult={onResult} hintLevel={hintLevel} />;
}

function MemoryEngineWrapper({ activity, onResult, hintLevel }: EngineComponentProps) {
  if (activity.engine !== "memory") return null;
  return <MemoryEngine activity={activity} onResult={onResult} hintLevel={hintLevel} />;
}

function StoryEngineWrapper({ activity, onResult, hintLevel }: EngineComponentProps) {
  if (activity.engine !== "story") return null;
  return <StoryEngine activity={activity} onResult={onResult} hintLevel={hintLevel} />;
}

function DragSortEngineWrapper({ activity, onResult, hintLevel }: EngineComponentProps) {
  if (activity.engine !== "drag-sort") return null;
  return (
    <DragSortEngine
      activity={activity}
      hintLevel={hintLevel}
      onResult={(responses) => {
        // Convert drag-sort responses to a single result
        const items_total = activity.items.length;
        let items_correct = 0;
        for (const r of responses) {
          const item = activity.items.find((i) => i.id === r.item_id);
          if (item && item.correct_slot_id === r.placed_slot_id) items_correct++;
        }
        const response = {
          item_id: "drag-sort",
          client_response_id: crypto.randomUUID(),
          value: { responses },
          elapsed_ms: Date.now(),
          hint_level: Math.min(hintLevel, 2),
        };
        const result = {
          item_id: "drag-sort",
          is_correct: items_correct === items_total,
          score: items_total > 0 ? items_correct / items_total : 0,
          hint_level: Math.min(hintLevel, 2),
        };
        onResult(response, result);
      }}
    />
  );
}

function PlaceholderEngine({ activity }: EngineComponentProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
        style={{ backgroundColor: "var(--color-surface-1)" }}
      >
        🚧
      </div>
      <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-kids)" }}>
        {activity.engine} engine coming soon!
      </p>
      <p className="text-sm text-ink-500">
        This activity type is being developed.
      </p>
    </div>
  );
}
