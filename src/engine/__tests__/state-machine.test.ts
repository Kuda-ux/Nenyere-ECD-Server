/**
 * State machine tests — verify phase transitions and event handling.
 */
import { describe, it, expect } from "vitest";
import { createRunnerState, runnerReducer, type RunnerState } from "../runner/state-machine";
import type { AnyActivity } from "../schema";

const baseActivity: AnyActivity = {
  id: "00000000-0000-0000-0000-000000000001",
  schema_version: 1,
  type: "tap_correct",
  engine: "choice",
  title: { en: "Test" },
  ecd_level: "ECD_A",
  difficulty: "easy",
  learning_area: "mathematics",
  skills: ["00000000-0000-0000-0000-000000000010"],
  curriculum_refs: [],
  instructions: { text: { en: "Tap!" }, audio: { en: "audio/instruction.mp3" }, demo: "none" },
  assets: [],
  language: "en",
  estimated_duration_s: 60,
  feedback: {
    correct: [{ text: { en: "Good!" } }],
    encourage: [{ text: { en: "Try!" } }],
    celebration: "stars",
  },
  scoring: {
    method: "per_item",
    star_bands: { one: 0, two: 0.6, three: 0.9 },
    count_hints_as_partial: false,
    max_attempts_per_item: null,
  },
  hints: { after_incorrect: 2, highlight_after: 3, show_demo: false },
  tags: [],
  items: [
    { id: "i1", stimulus: { shape: "star" }, is_correct: true },
    { id: "i2", stimulus: { shape: "circle" }, is_correct: false },
  ],
  prompt: { text: { en: "Find star" }, audio: { en: "audio/prompt.mp3" } },
  layout: "grid",
  show_correct_after_attempts: 3,
} as AnyActivity;

describe("createRunnerState", () => {
  it("creates initial state in intro phase", () => {
    const state = createRunnerState(baseActivity);
    expect(state.phase).toBe("intro");
    expect(state.activity).toBe(baseActivity);
  });
});

describe("runnerReducer — phase transitions", () => {
  it("START: intro → instruction", () => {
    const state = createRunnerState(baseActivity);
    const next = runnerReducer(state, { type: "START" });
    expect(next.phase).toBe("instruction");
  });

  it("INSTRUCTION_DONE: instruction → activity", () => {
    const state: RunnerState = { phase: "instruction", activity: baseActivity };
    const next = runnerReducer(state, { type: "INSTRUCTION_DONE" });
    expect(next.phase).toBe("activity");
    if (next.phase === "activity") {
      expect(next.itemIndex).toBe(0);
      expect(next.results).toEqual([]);
      expect(next.attempts).toBe(0);
    }
  });

  it("ITEM_RESPONSE: activity → feedback (first item)", () => {
    const state: RunnerState = {
      phase: "activity", activity: baseActivity, itemIndex: 0,
      responses: [], results: [], attempts: 1,
    };
    const next = runnerReducer(state, {
      type: "ITEM_RESPONSE",
      response: {
        item_id: "i1",
        client_response_id: "00000000-0000-0000-0000-0000000000aa",
        value: {},
        elapsed_ms: 5000,
        hint_level: 0,
      },
      result: {
        item_id: "i1",
        is_correct: true,
        score: 1,
        hint_level: 0,
      },
    });
    expect(next.phase).toBe("feedback");
    if (next.phase === "feedback") {
      expect(next.results).toHaveLength(1);
      expect(next.results[0].is_correct).toBe(true);
      expect(next.lastResult?.is_correct).toBe(true);
    }
  });

  it("FEEDBACK_DONE: feedback → activity (next item)", () => {
    const state: RunnerState = {
      phase: "feedback", activity: baseActivity,
      lastResult: { item_id: "i1", is_correct: true, score: 1, hint_level: 0 },
      responses: [], results: [{ item_id: "i1", is_correct: true, score: 1, hint_level: 0 }],
    };
    const next = runnerReducer(state, { type: "FEEDBACK_DONE" });
    expect(next.phase).toBe("activity");
    if (next.phase === "activity") {
      expect(next.itemIndex).toBe(1);
    }
  });

  it("FEEDBACK_DONE: feedback → summary (last item)", () => {
    const state: RunnerState = {
      phase: "feedback", activity: baseActivity,
      lastResult: { item_id: "i2", is_correct: false, score: 0, hint_level: 0 },
      responses: [],
      results: [
        { item_id: "i1", is_correct: true, score: 1, hint_level: 0 },
        { item_id: "i2", is_correct: false, score: 0, hint_level: 0 },
      ],
    };
    const next = runnerReducer(state, { type: "FEEDBACK_DONE" });
    expect(next.phase).toBe("summary");
    if (next.phase === "summary") {
      expect(next.itemsTotal).toBe(2);
      expect(next.itemsCorrect).toBe(1);
      expect(next.accuracy).toBe(0.5);
      expect(next.stars).toBe(1);
    }
  });

  it("FINISH: summary → completed", () => {
    const state: RunnerState = {
      phase: "summary", activity: baseActivity,
      results: [{ item_id: "i1", is_correct: true, score: 1, hint_level: 0 }],
      responses: [],
      accuracy: 1, stars: 3, itemsTotal: 1, itemsCorrect: 1,
    };
    const next = runnerReducer(state, { type: "FINISH" });
    expect(next.phase).toBe("completed");
  });

  it("EXIT: any phase → completed", () => {
    const state = createRunnerState(baseActivity);
    const next = runnerReducer(state, { type: "EXIT" });
    expect(next.phase).toBe("completed");
  });
});

describe("runnerReducer — star calculation in summary", () => {
  it("3 stars when accuracy >= 0.9", () => {
    const state: RunnerState = {
      phase: "feedback", activity: baseActivity,
      lastResult: { item_id: "i2", is_correct: true, score: 1, hint_level: 0 },
      responses: [],
      results: [
        { item_id: "i1", is_correct: true, score: 1, hint_level: 0 },
        { item_id: "i2", is_correct: true, score: 1, hint_level: 0 },
      ],
    };
    const next = runnerReducer(state, { type: "FEEDBACK_DONE" });
    expect(next.phase).toBe("summary");
    if (next.phase === "summary") {
      expect(next.stars).toBe(3);
    }
  });

  it("2 stars when accuracy >= 0.6 but < 0.9 (3/5)", () => {
    const activity5: AnyActivity = {
      ...baseActivity,
      items: Array.from({ length: 5 }, (_, i) => ({
        id: `i${i}`,
        stimulus: { shape: "circle" as const },
        is_correct: i === 0,
      })),
    } as AnyActivity;

    const state: RunnerState = {
      phase: "feedback", activity: activity5,
      lastResult: { item_id: "i4", is_correct: false, score: 0, hint_level: 0 },
      responses: [],
      results: [
        { item_id: "i0", is_correct: true, score: 1, hint_level: 0 },
        { item_id: "i1", is_correct: true, score: 1, hint_level: 0 },
        { item_id: "i2", is_correct: true, score: 1, hint_level: 0 },
        { item_id: "i3", is_correct: false, score: 0, hint_level: 0 },
        { item_id: "i4", is_correct: false, score: 0, hint_level: 0 },
      ],
    };
    const next = runnerReducer(state, { type: "FEEDBACK_DONE" });
    expect(next.phase).toBe("summary");
    if (next.phase === "summary") {
      expect(next.accuracy).toBe(0.6);
      expect(next.stars).toBe(2);
    }
  });
});
