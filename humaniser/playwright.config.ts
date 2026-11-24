import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against the production build. The main server uses the
 * deterministic demo engine (HUMANISER_MOCK=1) so tests are fast, free and
 * repeatable; a second server runs with no API key to test the
 * "not configured" state. Run with: npm run test:e2e
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 4,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3200", trace: "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: [
    {
      command: "npx next start -p 3200",
      port: 3200,
      reuseExistingServer: false,
      env: { HUMANISER_MOCK: "1", HUMANISER_RATE_LIMIT_PER_MIN: "1000", HUMANISER_MAX_CONCURRENT: "50" },
    },
    {
      command: "npx next start -p 3201",
      port: 3201,
      reuseExistingServer: false,
      env: { ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", HUMANISER_MOCK: "0" },
    },
  ],
});
