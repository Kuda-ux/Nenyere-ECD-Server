/**
 * E2E smoke tests — accessibility checks on adult portal pages.
 * Per docs/testing.md §2: @axe-core/playwright on adult pages.
 * Uses Axe to verify WCAG 2.2 AA compliance on public pages.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility — public pages", () => {
  test("home page has no critical axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });

  test("welcome page has no critical axe violations", async ({ page }) => {
    await page.goto("/welcome");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });

  test("privacy page has no critical axe violations", async ({ page }) => {
    await page.goto("/privacy");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });
});

test.describe("Accessibility — child mode", () => {
  test("learner picker has no critical axe violations", async ({ page }) => {
    await page.goto("/kids");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });

  test("child dashboard has no critical axe violations", async ({ page }) => {
    await page.goto("/kids/dashboard?learner=00000000-0000-0000-0000-000000001001");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  });
});
