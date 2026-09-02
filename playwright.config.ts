import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration — E2E smoke tests.
 * Per docs/testing.md §2: 13 critical flows + offline.
 * Desktop Chromium + Android tablet emulation (Galaxy Tab S4-class 1024×768).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  timeout: 30000,
  expect: { timeout: 10000 },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "tablet-android",
      use: {
        ...devices["Galaxy Tab S4"],
        isMobile: true,
        hasTouch: true,
        viewport: { width: 1024, height: 768 },
      },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
