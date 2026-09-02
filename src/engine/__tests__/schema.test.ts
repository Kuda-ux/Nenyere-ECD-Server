/**
 * Schema validation tests — verify Zod schemas accept valid activities
 * and reject invalid ones.
 */
import { describe, it, expect } from "vitest";
import { validateActivity, safeValidateActivity, lintActivity, getEngineForType, type AnyActivity } from "../schema";
import { ChoiceActivitySchema } from "../schema/choice";
import { MatchActivitySchema } from "../schema/match";

const validChoiceActivity = {
  id: "00000000-0000-0000-0000-000000000001",
  schema_version: 1,
  type: "tap_correct",
  engine: "choice",
  title: { en: "Find the Star" },
  description: { en: "Tap the correct shape" },
  ecd_level: "ECD_A",
  difficulty: "easy",
  learning_area: "mathematics",
  skills: ["00000000-0000-0000-0000-000000000010"],
  curriculum_refs: [],
  instructions: { text: { en: "Tap the star!" }, audio: { en: "audio/instruction.mp3" }, demo: "none" },
  assets: [],
  language: "en",
  estimated_duration_s: 60,
  feedback: {
    correct: [{ text: { en: "You found it!" } }],
    encourage: [{ text: { en: "Try again!" } }],
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
  prompt: { text: { en: "Find the star" }, audio: { en: "audio/prompt.mp3" } },
  layout: "grid",
  show_correct_after_attempts: 3,
};

describe("ChoiceActivitySchema", () => {
  it("accepts a valid choice activity", () => {
    const result = ChoiceActivitySchema.safeParse(validChoiceActivity);
    expect(result.success).toBe(true);
  });

  it("rejects activity with fewer than 2 items", () => {
    const result = ChoiceActivitySchema.safeParse({
      ...validChoiceActivity,
      items: [{ id: "i1", stimulus: { shape: "star" }, is_correct: true }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects activity with more than 6 items", () => {
    const result = ChoiceActivitySchema.safeParse({
      ...validChoiceActivity,
      items: Array.from({ length: 7 }, (_, i) => ({
        id: `i${i}`,
        stimulus: { shape: "circle" },
        is_correct: i === 0,
      })),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid engine", () => {
    const result = ChoiceActivitySchema.safeParse({
      ...validChoiceActivity,
      engine: "match",
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const result = ChoiceActivitySchema.parse({
      ...validChoiceActivity,
      layout: undefined,
      show_correct_after_attempts: undefined,
    });
    expect(result.layout).toBe("grid");
    expect(result.show_correct_after_attempts).toBe(3);
  });
});

describe("MatchActivitySchema", () => {
  const validMatchActivity = {
    ...validChoiceActivity,
    type: "matching",
    engine: "match",
    pairs: [
      { id: "p1", left: { shape: "circle" }, right: { shape: "circle" } },
      { id: "p2", left: { shape: "star" }, right: { shape: "star" } },
    ],
    layout: "two_column",
    shuffle_right: true,
  };
  delete (validMatchActivity as Record<string, unknown>).items;
  delete (validMatchActivity as Record<string, unknown>).prompt;
  delete (validMatchActivity as Record<string, unknown>).show_correct_after_attempts;

  it("accepts a valid match activity", () => {
    const result = MatchActivitySchema.safeParse(validMatchActivity);
    expect(result.success).toBe(true);
  });

  it("rejects activity with fewer than 2 pairs", () => {
    const result = MatchActivitySchema.safeParse({
      ...validMatchActivity,
      pairs: [{ id: "p1", left: { shape: "circle" }, right: { shape: "circle" } }],
    });
    expect(result.success).toBe(false);
  });
});

describe("validateActivity", () => {
  it("returns parsed activity for valid input", () => {
    const result = validateActivity(validChoiceActivity);
    expect(result.type).toBe("tap_correct");
    expect(result.engine).toBe("choice");
  });

  it("throws for invalid input", () => {
    expect(() =>
      validateActivity({ ...validChoiceActivity, id: "not-a-uuid" }),
    ).toThrow();
  });
});

describe("safeValidateActivity", () => {
  it("returns success=true for valid input", () => {
    const result = safeValidateActivity(validChoiceActivity);
    expect(result.success).toBe(true);
  });

  it("returns success=false for invalid input", () => {
    const result = safeValidateActivity({ ...validChoiceActivity, schema_version: 2 });
    expect(result.success).toBe(false);
  });
});

describe("getEngineForType", () => {
  it("maps tap_correct → choice", () => {
    expect(getEngineForType("tap_correct")).toBe("choice");
  });

  it("maps matching → match", () => {
    expect(getEngineForType("matching")).toBe("match");
  });

  it("maps counting → counting", () => {
    expect(getEngineForType("counting")).toBe("counting");
  });

  it("maps sorting → drag-sort", () => {
    expect(getEngineForType("sorting")).toBe("drag-sort");
  });

  it("maps tracing → trace", () => {
    expect(getEngineForType("tracing")).toBe("trace");
  });

  it("maps memory_game → memory", () => {
    expect(getEngineForType("memory_game")).toBe("memory");
  });

  it("maps story_interaction → story", () => {
    expect(getEngineForType("story_interaction")).toBe("story");
  });
});

describe("lintActivity", () => {
  it("returns no errors for valid activity with alt text", () => {
    const activity = {
      ...validChoiceActivity,
      items: [
        { id: "i1", stimulus: { image: { en: "star.png" } }, is_correct: true, alt: { en: "A star" } },
        { id: "i2", stimulus: { shape: "circle" }, is_correct: false },
      ],
    };
    const errors = lintActivity(activity as AnyActivity);
    expect(errors).toHaveLength(0);
  });

  it("returns error for image stimulus missing alt text", () => {
    const activity = {
      ...validChoiceActivity,
      items: [
        { id: "i1", stimulus: { image: { en: "star.png" } }, is_correct: true },
        { id: "i2", stimulus: { shape: "circle" }, is_correct: false },
      ],
    };
    const errors = lintActivity(activity as AnyActivity);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("alt");
  });
});
