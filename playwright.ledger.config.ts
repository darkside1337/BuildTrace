import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", testMatch: /ledger\.spec\.ts/, fullyParallel: false, workers: 1, retries: 0,
  timeout: 45_000, expect: { timeout: 12_000 }, reporter: "list",
  use: { baseURL: "http://localhost:3336", trace: "retain-on-failure" },
  projects: [
    { name: "ledger-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "ledger-mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "node node_modules/next/dist/bin/next start --port 3336", env: { BETTER_AUTH_URL: "http://localhost:3336" }, url: "http://localhost:3336", reuseExistingServer: false, timeout: 30_000 },
});
