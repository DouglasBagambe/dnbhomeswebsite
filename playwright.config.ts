import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["visual.spec.ts", "media.spec.ts"],
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:3001", trace: "on-first-retry", navigationTimeout: 20_000 },
  webServer: {
    command: "npm start -- -p 3001",
    env: { HOMES_BUILD_PROFILE: "local", HOMES_E2E: "1", NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3001", NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:9/api/v1" },
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "mobile", use: { ...devices["Pixel 5"], channel: "chrome" } },
  ],
});
