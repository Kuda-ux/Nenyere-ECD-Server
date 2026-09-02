/**
 * Scoring parity tests — verify TS scoring functions match the SQL
 * `apply_attempt` logic in supabase/migrations/0007_functions.sql.
 *
 * The SQL function computes:
 *   accuracy = items_correct / items_total
 *   stars = CASE
 *     WHEN accuracy >= star_bands.three THEN 3
 *     WHEN accuracy >= star_bands.two THEN 2
 *     ELSE 1
 *   END
 *
 * These tests ensure the TS scoring functions produce identical results.
 */
import { describe, it, expect } from "vitest";
import { scoreChoice } from "../schema/choice";
import { scoreMatch } from "../schema/match";
import { scoreCounting } from "../schema/counting";
import { scoreDragSort } from "../schema/drag-sort";
import { scoreTrace } from "../schema/trace";
import { scoreMemory, scoreStory } from "../schema/engines";
import type { ChoiceActivity, ChoiceItem } from "../schema/choice";
import type { MatchActivity, MatchPair } from "../schema/match";
import type { CountingActivity, CountingItem } from "../schema/counting";
import type { DragSortActivity, SortSlot, SortItem } from "../schema/drag-sort";
import type { TraceActivity, TraceItem } from "../schema/trace";
import type { MemoryActivity, StoryActivity } from "../schema/engines";

// ── Shared test fixtures ────────────────────────────────────────────────────

const baseScoring = {
  method: "per_item" as const,
  star_bands: { one: 0, two: 0.6, three: 0.9 },
  count_hints_as_partial: false,
  max_attempts_per_item: null,
};

const baseFields = {
  id: "00000000-0000-0000-0000-000000000001",
  schema_version: 1 as const,
  title: { en: "Test Activity" },
  ecd_level: "ECD_A" as const,
  difficulty: "easy" as const,
  learning_area: "mathematics" as const,
  skills: ["00000000-0000-0000-0000-000000000010"],
  curriculum_refs: [],
  instructions: { text: { en: "Do the thing" }, audio: { en: "audio/instruction.mp3" }, demo: "none" as const },
  assets: [],
  language: "en" as const,
  estimated_duration_s: 60,
  feedback: {
    correct: [{ text: { en: "Good!" } }],
    encourage: [{ text: { en: "Try again!" } }],
    celebration: "stars" as const,
  },
  hints: { after_incorrect: 2, highlight_after: 3, show_demo: false },
  tags: [],
};

// ── Choice scoring ──────────────────────────────────────────────────────────

describe("scoreChoice — parity with SQL apply_attempt", () => {
  const items: ChoiceItem[] = [
    { id: "i1", stimulus: { shape: "star" }, is_correct: true },
    { id: "i2", stimulus: { shape: "circle" }, is_correct: false },
    { id: "i3", stimulus: { shape: "square" }, is_correct: false },
  ];

  const activity: ChoiceActivity = {
    ...baseFields,
    type: "tap_correct",
    engine: "choice",
    scoring: baseScoring,
    items,
    prompt: { text: { en: "Find the star" }, audio: { en: "" } },
    layout: "grid",
    show_correct_after_attempts: 3,
  };

  it("returns 3 stars when all correct (accuracy = 1.0 >= 0.9)", () => {
    const result = scoreChoice(activity, [
      { item_id: "i1", is_correct: true, hint_level: 0 },
      { item_id: "i2", is_correct: true, hint_level: 0 },
      { item_id: "i3", is_correct: true, hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(1.0);
    expect(result.stars).toBe(3);
    expect(result.items_total).toBe(3);
    expect(result.items_correct).toBe(3);
  });

  it("returns 2 stars when 2/3 correct (accuracy = 0.667 >= 0.6)", () => {
    const result = scoreChoice(activity, [
      { item_id: "i1", is_correct: true, hint_level: 0 },
      { item_id: "i2", is_correct: true, hint_level: 0 },
      { item_id: "i3", is_correct: false, hint_level: 0 },
    ]);
    expect(result.accuracy).toBeCloseTo(0.6667, 2);
    expect(result.stars).toBe(2);
    expect(result.items_correct).toBe(2);
  });

  it("returns 1 star when 1/3 correct (accuracy = 0.333 < 0.6)", () => {
    const result = scoreChoice(activity, [
      { item_id: "i1", is_correct: true, hint_level: 0 },
      { item_id: "i2", is_correct: false, hint_level: 0 },
      { item_id: "i3", is_correct: false, hint_level: 0 },
    ]);
    expect(result.accuracy).toBeCloseTo(0.3333, 2);
    expect(result.stars).toBe(1);
  });

  it("returns 1 star when 0 correct (accuracy = 0)", () => {
    const result = scoreChoice(activity, [
      { item_id: "i1", is_correct: false, hint_level: 0 },
      { item_id: "i2", is_correct: false, hint_level: 0 },
      { item_id: "i3", is_correct: false, hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(0);
    expect(result.stars).toBe(1);
  });

  it("handles empty responses gracefully", () => {
    const result = scoreChoice(activity, []);
    expect(result.accuracy).toBe(0);
    expect(result.stars).toBe(1);
    expect(result.items_total).toBe(3);
  });
});

// ── Match scoring ───────────────────────────────────────────────────────────

describe("scoreMatch — parity with SQL apply_attempt", () => {
  const pairs: MatchPair[] = [
    { id: "p1", left: { shape: "circle" }, right: { shape: "circle" } },
    { id: "p2", left: { shape: "star" }, right: { shape: "star" } },
    { id: "p3", left: { shape: "square" }, right: { shape: "square" } },
    { id: "p4", left: { shape: "heart" }, right: { shape: "heart" } },
    { id: "p5", left: { shape: "triangle" }, right: { shape: "triangle" } },
  ];

  const activity: MatchActivity = {
    ...baseFields,
    type: "matching",
    engine: "match",
    scoring: baseScoring,
    pairs,
    layout: "two_column",
    shuffle_right: true,
  };

  it("returns 3 stars at 100% (5/5 >= 0.9)", () => {
    const result = scoreMatch(activity, pairs.map((p) => ({
      pair_id: p.id, is_correct: true, hint_level: 0,
    })));
    expect(result.accuracy).toBe(1.0);
    expect(result.stars).toBe(3);
  });

  it("returns 2 stars at 80% (4/5 = 0.8 >= 0.6)", () => {
    const result = scoreMatch(activity, [
      ...pairs.slice(0, 4).map((p) => ({ pair_id: p.id, is_correct: true, hint_level: 0 })),
      { pair_id: "p5", is_correct: false, hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(0.8);
    expect(result.stars).toBe(2);
  });

  it("returns 1 star at 20% (1/5 = 0.2 < 0.6)", () => {
    const result = scoreMatch(activity, [
      { pair_id: "p1", is_correct: true, hint_level: 0 },
      ...pairs.slice(1).map((p) => ({ pair_id: p.id, is_correct: false, hint_level: 0 })),
    ]);
    expect(result.accuracy).toBe(0.2);
    expect(result.stars).toBe(1);
  });
});

// ── Counting scoring ────────────────────────────────────────────────────────

describe("scoreCounting — parity with SQL apply_attempt", () => {
  const items: CountingItem[] = [
    { id: "c1", objects: { shape: "circle", colour: "red", count: 3, arrangement: "row" }, options: [2, 3, 4], correct_answer: 3, operation: "count" },
    { id: "c2", objects: { shape: "star", colour: "blue", count: 5, arrangement: "row" }, options: [4, 5, 6], correct_answer: 5, operation: "count" },
  ];

  const activity: CountingActivity = {
    ...baseFields,
    type: "counting",
    engine: "counting",
    scoring: baseScoring,
    items,
    tap_to_count: true,
    show_number_line: true,
    show_counter: true,
  };

  it("returns 3 stars when all correct", () => {
    const result = scoreCounting(activity, [
      { item_id: "c1", answer: 3, hint_level: 0 },
      { item_id: "c2", answer: 5, hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(1.0);
    expect(result.stars).toBe(3);
  });

  it("returns 1 star when 0/2 correct", () => {
    const result = scoreCounting(activity, [
      { item_id: "c1", answer: 2, hint_level: 0 },
      { item_id: "c2", answer: 4, hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(0);
    expect(result.stars).toBe(1);
  });
});

// ── Drag-sort scoring ───────────────────────────────────────────────────────

describe("scoreDragSort — parity with SQL apply_attempt", () => {
  const slots: SortSlot[] = [
    { id: "s1", label: { en: "Red" }, accepts_item_ids: ["it1"] },
    { id: "s2", label: { en: "Blue" }, accepts_item_ids: ["it2"] },
    { id: "s3", label: { en: "Green" }, accepts_item_ids: ["it3"] },
  ];
  const items: SortItem[] = [
    { id: "it1", colour: "red", correct_slot_id: "s1" },
    { id: "it2", colour: "blue", correct_slot_id: "s2" },
    { id: "it3", colour: "green", correct_slot_id: "s3" },
  ];

  const activity: DragSortActivity = {
    ...baseFields,
    type: "sorting",
    engine: "drag-sort",
    scoring: baseScoring,
    slots,
    items,
    layout: "bins",
    allow_rearrange: true,
  };

  it("returns 3 stars when all placed correctly", () => {
    const result = scoreDragSort(activity, [
      { item_id: "it1", placed_slot_id: "s1", hint_level: 0 },
      { item_id: "it2", placed_slot_id: "s2", hint_level: 0 },
      { item_id: "it3", placed_slot_id: "s3", hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(1.0);
    expect(result.stars).toBe(3);
  });

  it("returns 2 stars when 2/3 correct", () => {
    const result = scoreDragSort(activity, [
      { item_id: "it1", placed_slot_id: "s1", hint_level: 0 },
      { item_id: "it2", placed_slot_id: "s3", hint_level: 0 },
      { item_id: "it3", placed_slot_id: "s3", hint_level: 0 },
    ]);
    expect(result.accuracy).toBeCloseTo(0.6667, 2);
    expect(result.stars).toBe(2);
  });
});

// ── Trace scoring ───────────────────────────────────────────────────────────

describe("scoreTrace — coverage-based scoring", () => {
  const items: TraceItem[] = [
    {
      id: "t1",
      strokes: [{ id: "sk1", points: [{ x: 0.5, y: 0.5 }, { x: 0.6, y: 0.6 }], colour: "#F2A93B", width: 8, is_guide: true }],
      tolerance: 0.05,
      min_coverage: 0.7,
    },
  ];

  const activity: TraceActivity = {
    ...baseFields,
    type: "tracing",
    engine: "trace",
    scoring: { ...baseScoring, method: "coverage" },
    items,
    canvas_width: 400,
    canvas_height: 300,
    brush_colours: ["#F2A93B", "#E85D5D", "#5BA85B"],
    show_starting_dot: true,
    show_dotted_guide: true,
  };

  it("returns 3 stars when coverage is high", () => {
    const result = scoreTrace(activity, [
      { item_id: "t1", coverage: 0.95, deviation: 0.02, hint_level: 0 },
    ]);
    expect(result.items_total).toBe(1);
    expect(result.items_correct).toBe(1);
    expect(result.stars).toBe(3);
  });
});

// ── Memory scoring ──────────────────────────────────────────────────────────

describe("scoreMemory — attempts-based scoring", () => {
  const activity: MemoryActivity = {
    ...baseFields,
    type: "memory_game",
    engine: "memory",
    scoring: baseScoring,
    cards: [
      { id: "m1", pair_id: "pair-a" },
      { id: "m2", pair_id: "pair-a" },
      { id: "m3", pair_id: "pair-b" },
      { id: "m4", pair_id: "pair-b" },
    ],
    columns: 2,
    preview_ms: 2000,
  };

  it("returns 3 stars when all matched with perfect attempts", () => {
    const result = scoreMemory(activity, [
      { matched: true, attempts: 1, hint_level: 0 },
      { matched: true, attempts: 1, hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(1.0);
    expect(result.stars).toBe(3);
  });
});

// ── Story scoring ───────────────────────────────────────────────────────────

describe("scoreStory — interaction-based scoring", () => {
  const activity: StoryActivity = {
    ...baseFields,
    type: "story_interaction",
    engine: "story",
    scoring: { ...baseScoring, method: "completion" },
    pages: [
      { id: "pg1", image: { en: "img/pg1.png" }, narration: { en: "audio/pg1.mp3" }, text: { en: "Once upon a time..." } },
      { id: "pg2", image: { en: "img/pg2.png" }, narration: { en: "audio/pg2.mp3" }, text: { en: "The end." }, interaction: { type: "tap_correct", choices: [{ id: "ch1", text: { en: "Yes" }, is_correct: true }] } },
    ],
    auto_advance: false,
    auto_advance_delay_ms: 2000,
  };

  it("returns 3 stars when all interactions correct", () => {
    const result = scoreStory(activity, [
      { page_id: "pg2", is_correct: true, hint_level: 0 },
    ]);
    expect(result.accuracy).toBe(1.0);
    expect(result.stars).toBe(3);
  });
});

// ── Star band edge cases ────────────────────────────────────────────────────

describe("Star band edge cases", () => {
  const items: ChoiceItem[] = [
    { id: "a", stimulus: { shape: "circle" }, is_correct: true },
    { id: "b", stimulus: { shape: "star" }, is_correct: false },
    { id: "c", stimulus: { shape: "square" }, is_correct: false },
    { id: "d", stimulus: { shape: "heart" }, is_correct: false },
    { id: "e", stimulus: { shape: "diamond" }, is_correct: false },
    { id: "f", stimulus: { shape: "triangle" }, is_correct: false },
    { id: "g", stimulus: { shape: "circle" }, is_correct: false },
    { id: "h", stimulus: { shape: "star" }, is_correct: false },
    { id: "i", stimulus: { shape: "square" }, is_correct: false },
    { id: "j", stimulus: { shape: "heart" }, is_correct: false },
  ];

  const activity: ChoiceActivity = {
    ...baseFields,
    type: "tap_correct",
    engine: "choice",
    scoring: baseScoring,
    items,
    prompt: { text: { en: "Find the circle" }, audio: { en: "" } },
    layout: "grid",
    show_correct_after_attempts: 3,
  };

  it("exactly 0.9 → 3 stars (boundary)", () => {
    const responses = items.map((_, i) => ({
      item_id: items[i].id,
      is_correct: i < 9,
      hint_level: 0,
    }));
    const result = scoreChoice(activity, responses);
    expect(result.accuracy).toBe(0.9);
    expect(result.stars).toBe(3);
  });

  it("exactly 0.6 → 2 stars (boundary)", () => {
    const responses = items.map((_, i) => ({
      item_id: items[i].id,
      is_correct: i < 6,
      hint_level: 0,
    }));
    const result = scoreChoice(activity, responses);
    expect(result.accuracy).toBe(0.6);
    expect(result.stars).toBe(2);
  });

  it("just below 0.9 → 2 stars", () => {
    const responses = items.map((_, i) => ({
      item_id: items[i].id,
      is_correct: i < 8,
      hint_level: 0,
    }));
    const result = scoreChoice(activity, responses);
    expect(result.accuracy).toBe(0.8);
    expect(result.stars).toBe(2);
  });

  it("just below 0.6 → 1 star", () => {
    const responses = items.map((_, i) => ({
      item_id: items[i].id,
      is_correct: i < 5,
      hint_level: 0,
    }));
    const result = scoreChoice(activity, responses);
    expect(result.accuracy).toBe(0.5);
    expect(result.stars).toBe(1);
  });
});
