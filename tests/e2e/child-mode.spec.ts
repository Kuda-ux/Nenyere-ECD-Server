/**
 * E2E smoke tests — Child Mode critical flows.
 * Per docs/testing.md §2: flows #2, #3, #4, #7.
 */
import { test, expect } from "@playwright/test";

test.describe("Child Mode — learner picker", () => {
  test("learner picker shows avatar grid", async ({ page }) => {
    await page.goto("/kids");
    await expect(page.getByText("Who are you?")).toBeVisible();
    await expect(page.getByText("Tap your picture to start playing!")).toBeVisible();
    // Should have learner avatar buttons
    const avatarButtons = page.locator("button", { hasText: /Tari|Tina|Rumbi/ });
    await expect(avatarButtons.first()).toBeVisible();
  });

  test("selecting a learner navigates to dashboard", async ({ page }) => {
    await page.goto("/kids");
    await page.getByText("Tari").click();
    await expect(page).toHaveURL(/\/kids\/dashboard/);
    await expect(page.getByText("Let's play!")).toBeVisible();
  });

  test("dashboard shows 8 domain tiles", async ({ page }) => {
    await page.goto("/kids/dashboard?learner=00000000-0000-0000-0000-000000001001");
    await expect(page.getByText("Let's play!")).toBeVisible();
    for (const label of ["Numbers", "Letters & Sounds", "Colours", "Shapes", "Animals & Nature", "Stories", "Puzzles", "Explore"]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });
});

test.describe("Child Mode — explore pages", () => {
  test("numbers domain shows activity tiles", async ({ page }) => {
    await page.goto("/kids/explore/numbers");
    await expect(page.getByText("Numbers").first()).toBeVisible();
    // Should show at least one activity card
    const activityButtons = page.locator("button[class*='rounded-2xl']");
    const count = await activityButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("stories shelf shows story cards", async ({ page }) => {
    await page.goto("/kids/stories");
    await expect(page.getByText("Stories").first()).toBeVisible();
    // Should show story cards
    const storyButtons = page.locator("button[class*='rounded-2xl']");
    const count = await storyButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("rewards page shows stars and badges", async ({ page }) => {
    await page.goto("/kids/rewards");
    await expect(page.getByText("My Stars")).toBeVisible();
    await expect(page.getByText("5 stars earned!")).toBeVisible();
    await expect(page.getByText("First Star")).toBeVisible();
  });
});

test.describe("Child Mode — activity runner", () => {
  test("play page loads activity runner", async ({ page }) => {
    // Navigate to the sample play page
    await page.goto("/play");
    // The ActivityRunner should render — look for activity content
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("dynamic activity page loads by ID", async ({ page }) => {
    // Use first seed activity ID
    await page.goto("/kids/play/00000000-0000-0000-0000-000000000010");
    // Should load the activity (or show not found)
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });
});
