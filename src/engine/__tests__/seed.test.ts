/**
 * Seed content validation tests — ensure all seed activities and stories
 * pass Zod schema validation and content quality lints.
 */
import { describe, it, expect } from "vitest";
import { safeValidateActivity, lintActivity } from "../schema";
import { seedActivities, seedStories } from "../seed/activities";

describe("Seed activities — schema validation", () => {
  for (const activity of seedActivities) {
    it(`${activity.type} (${activity.title.en}) passes schema validation`, () => {
      const result = safeValidateActivity(activity);
      if (!result.success) {
        console.error(JSON.stringify(result.error?.issues ?? [], null, 2));
      }
      expect(result.success).toBe(true);
    });
  }
});

describe("Seed stories — schema validation", () => {
  for (const story of seedStories) {
    it(`story (${story.title.en}) passes schema validation`, () => {
      const result = safeValidateActivity(story);
      if (!result.success) {
        console.error(JSON.stringify(result.error?.issues ?? [], null, 2));
      }
      expect(result.success).toBe(true);
    });
  }
});

describe("Seed activities — content quality lints", () => {
  for (const activity of [...seedActivities, ...seedStories]) {
    it(`${activity.title.en} passes content lints`, () => {
      const errors = lintActivity(activity);
      // Lints should return no errors for well-formed seed content
      // (images use placeholder paths, no image stimuli without alt)
      expect(errors).toHaveLength(0);
    });
  }
});

describe("Seed content — coverage", () => {
  it("has at least 25 activities", () => {
    expect(seedActivities.length).toBeGreaterThanOrEqual(25);
  });

  it("has at least 3 stories", () => {
    expect(seedStories.length).toBeGreaterThanOrEqual(3);
  });

  it("covers all 5 learning areas", () => {
    const areas = new Set(seedActivities.map((a) => a.learning_area));
    expect(areas.has("mathematics")).toBe(true);
    expect(areas.has("english_language")).toBe(true);
    expect(areas.has("science_and_technology")).toBe(true);
    expect(areas.has("social_sciences")).toBe(true);
    expect(areas.has("physical_education_and_arts")).toBe(true);
  });

  it("covers both ECD levels", () => {
    const levels = new Set([...seedActivities, ...seedStories].map((a) => a.ecd_level));
    expect(levels.has("ECD_A")).toBe(true);
    expect(levels.has("ECD_B")).toBe(true);
  });

  it("covers multiple activity types", () => {
    const types = new Set(seedActivities.map((a) => a.type));
    expect(types.size).toBeGreaterThanOrEqual(8);
  });

  it("covers multiple engines", () => {
    const engines = new Set(seedActivities.map((a) => a.engine));
    expect(engines.has("choice")).toBe(true);
    expect(engines.has("match")).toBe(true);
    expect(engines.has("counting")).toBe(true);
    expect(engines.has("drag-sort")).toBe(true);
    expect(engines.has("trace")).toBe(true);
    expect(engines.has("memory")).toBe(true);
  });
});
