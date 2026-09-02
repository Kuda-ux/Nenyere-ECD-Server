/**
 * Activity runner state machine.
 * Per docs/activity-engine.md §5: INTRO → INSTRUCTION → ACTIVITY → FEEDBACK → SUMMARY
 *
 * The runner is a pure state machine — no UI. UI components subscribe to
 * state changes and render accordingly.
 */
import type { AnyActivity } from "../schema";
import type { ItemResponse, ItemResult } from "../schema/common";

// ── States ──────────────────────────────────────────────────────────────────
export type RunnerState =
  | { phase: "intro"; activity: AnyActivity }
  | { phase: "instruction"; activity: AnyActivity }
  | { phase: "activity"; activity: AnyActivity; itemIndex: number; responses: ItemResponse[]; results: ItemResult[]; attempts: number }
  | { phase: "feedback"; activity: AnyActivity; lastResult: ItemResult | null; responses: ItemResponse[]; results: ItemResult[] }
  | { phase: "summary"; activity: AnyActivity; responses: ItemResponse[]; results: ItemResult[]; accuracy: number; stars: number; itemsTotal: number; itemsCorrect: number }
  | { phase: "completed"; activity: AnyActivity; responses: ItemResponse[]; results: ItemResult[]; accuracy: number; stars: number; itemsTotal: number; itemsCorrect: number };

// ── Events ──────────────────────────────────────────────────────────────────
export type RunnerEvent =
  | { type: "START" }
  | { type: "INSTRUCTION_DONE" }
  | { type: "ITEM_RESPONSE"; response: ItemResponse; result: ItemResult }
  | { type: "ITEM_SKIP" }
  | { type: "HINT_REQUESTED" }
  | { type: "FEEDBACK_DONE" }
  | { type: "NEXT_ITEM" }
  | { type: "FINISH" }
  | { type: "EXIT" };

// ── Reducer ─────────────────────────────────────────────────────────────────
export function runnerReducer(state: RunnerState, event: RunnerEvent): RunnerState {
  switch (state.phase) {
    // ── INTRO ───────────────────────────────────────────────────────────────
    case "intro": {
      if (event.type === "START") {
        return { phase: "instruction", activity: state.activity };
      }
      if (event.type === "EXIT") {
        return { ...state, phase: "completed" as const, responses: [], results: [], accuracy: 0, stars: 0, itemsTotal: 0, itemsCorrect: 0 };
      }
      return state;
    }

    // ── INSTRUCTION ─────────────────────────────────────────────────────────
    case "instruction": {
      if (event.type === "INSTRUCTION_DONE" || event.type === "START") {
        return {
          phase: "activity",
          activity: state.activity,
          itemIndex: 0,
          responses: [],
          results: [],
          attempts: 0,
        };
      }
      if (event.type === "EXIT") {
        return { ...state, phase: "completed" as const, responses: [], results: [], accuracy: 0, stars: 0, itemsTotal: 0, itemsCorrect: 0 };
      }
      return state;
    }

    // ── ACTIVITY ────────────────────────────────────────────────────────────
    case "activity": {
      if (event.type === "EXIT") {
        return {
          phase: "completed",
          activity: state.activity,
          responses: state.responses,
          results: state.results,
          accuracy: 0,
          stars: 0,
          itemsTotal: state.results.length,
          itemsCorrect: state.results.filter((r) => r.is_correct).length,
        };
      }

      if (event.type === "ITEM_RESPONSE") {
        const responses = [...state.responses, event.response];
        const results = [...state.results, event.result];
        return {
          phase: "feedback",
          activity: state.activity,
          lastResult: event.result,
          responses,
          results,
        };
      }

      if (event.type === "ITEM_SKIP") {
        // Move to next item without recording a response
        const nextIndex = state.itemIndex + 1;
        const itemCount = getItemCount(state.activity);
        if (nextIndex >= itemCount) {
          return computeSummary(state.activity, state.responses, state.results);
        }
        return { ...state, itemIndex: nextIndex, attempts: 0 };
      }

      if (event.type === "HINT_REQUESTED") {
        return { ...state, attempts: state.attempts + 1 };
      }

      return state;
    }

    // ── FEEDBACK ────────────────────────────────────────────────────────────
    case "feedback": {
      if (event.type === "FEEDBACK_DONE" || event.type === "NEXT_ITEM") {
        const nextIndex = state.results.length; // results.length === items completed
        const itemCount = getItemCount(state.activity);
        if (nextIndex >= itemCount) {
          return computeSummary(state.activity, state.responses, state.results);
        }
        return {
          phase: "activity",
          activity: state.activity,
          itemIndex: nextIndex,
          responses: state.responses,
          results: state.results,
          attempts: 0,
        };
      }

      if (event.type === "EXIT") {
        return {
          phase: "completed",
          activity: state.activity,
          responses: state.responses,
          results: state.results,
          accuracy: 0,
          stars: 0,
          itemsTotal: state.results.length,
          itemsCorrect: state.results.filter((r) => r.is_correct).length,
        };
      }

      return state;
    }

    // ── SUMMARY ─────────────────────────────────────────────────────────────
    case "summary": {
      if (event.type === "FINISH") {
        return {
          phase: "completed",
          activity: state.activity,
          responses: state.responses,
          results: state.results,
          accuracy: state.accuracy,
          stars: state.stars,
          itemsTotal: state.itemsTotal,
          itemsCorrect: state.itemsCorrect,
        };
      }
      return state;
    }

    // ── COMPLETED ───────────────────────────────────────────────────────────
    case "completed": {
      return state;
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function getItemCount(activity: AnyActivity): number {
  if ("items" in activity) return activity.items.length;
  if ("pairs" in activity) return activity.pairs.length;
  if ("cards" in activity) return activity.cards.length / 2;
  if ("pieces" in activity) return activity.pieces.length;
  if ("differences" in activity) return activity.differences.length;
  if ("pages" in activity) return activity.pages.filter((p) => p.interaction).length || 1;
  if ("regions" in activity) return activity.regions.length;
  return 1;
}

function computeSummary(
  activity: AnyActivity,
  responses: ItemResponse[],
  results: ItemResult[],
): RunnerState {
  const itemsTotal = results.length;
  const itemsCorrect = results.filter((r) => r.is_correct).length;
  const accuracy = itemsTotal > 0 ? itemsCorrect / itemsTotal : 0;
  const starBands = activity.scoring.star_bands;
  const stars =
    accuracy >= starBands.three ? 3 :
    accuracy >= starBands.two ? 2 : 1;

  return {
    phase: "summary",
    activity,
    responses,
    results,
    accuracy,
    stars,
    itemsTotal,
    itemsCorrect,
  };
}

// ── Initial state ───────────────────────────────────────────────────────────
export function createRunnerState(activity: AnyActivity): RunnerState {
  return { phase: "intro", activity };
}
