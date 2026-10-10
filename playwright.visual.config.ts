import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e", testMatch: ["visual.spec.ts", "media.spec.ts", "swipe.spec.ts"], workers: 1, timeout: 60000,
  use: { baseURL: "http://127.0.0.1:3101", channel: "chrome", trace: "retain-on-failure" },
  webServer: [
    { command: "node e2e/fixtures/server.mjs", url: "http://127.0.0.1:3100/api/v1/properties", reuseExistingServer: false },
    { command: "npm start -- -p 3101", url: "http://127.0.0.1:3101", reuseExistingServer: false, env: { HOMES_BUILD_PROFILE: "local", NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:3100/api/v1", NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3101" } },
  ],
});
