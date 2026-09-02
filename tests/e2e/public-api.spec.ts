/**
 * E2E smoke tests — public pages and API health.
 * Per docs/testing.md §2: basic availability checks.
 */
import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("welcome page loads", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("body")).not.toBeEmpty();
  });
});

test.describe("API endpoints", () => {
  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("nenyere-ecd");
  });

  test("content pack manifest for ECD_A", async ({ request }) => {
    const res = await request.get("/api/packs/ECD_A");
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();
    expect(manifest.ecd_level).toBe("ECD_A");
    expect(manifest.version).toBe("seed-v1");
    expect(Array.isArray(manifest.activities)).toBeTruthy();
    expect(manifest.activities.length).toBeGreaterThan(0);
  });

  test("content pack manifest for ECD_B", async ({ request }) => {
    const res = await request.get("/api/packs/ECD_B");
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();
    expect(manifest.ecd_level).toBe("ECD_B");
    expect(Array.isArray(manifest.activities)).toBeTruthy();
  });

  test("invalid ECD level returns 400", async ({ request }) => {
    const res = await request.get("/api/packs/INVALID");
    expect(res.status()).toBe(400);
  });

  test("sync endpoint accepts valid batch", async ({ request }) => {
    const res = await request.post("/api/sync", {
      data: {
        batch: [
          {
            attempt: {
              client_attempt_id: "test-attempt-1",
              learner_id: "00000000-0000-0000-0000-000000001001",
              activity_id: "00000000-0000-0000-0000-000000000010",
              device_id: "test-device",
              actor_user_id: "test-actor",
              started_at: Date.now() - 60000,
              completed_at: Date.now(),
              status: "completed",
              accuracy: 0.8,
              stars: 2,
              duration_ms: 60000,
              hints_used: 1,
              items_total: 5,
              items_correct: 4,
              client_meta: {},
              synced: 0,
              created_at: Date.now(),
            },
            responses: [],
          },
        ],
      },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.results).toHaveLength(1);
    expect(data.results[0].status).toBe("applied");
  });

  test("sync endpoint rejects empty batch", async ({ request }) => {
    const res = await request.post("/api/sync", {
      data: { batch: [] },
    });
    expect(res.status()).toBe(400);
  });
});
