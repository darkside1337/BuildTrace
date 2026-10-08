import { defineConfig, devices } from "@playwright/test";

function appServer(mode: string, port: number) {
  return {
    command: `node tests/helpers/e2e-server.mjs ${mode}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  };
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "connected-desktop",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3333" },
      testMatch: /connected\.spec\.ts/,
    },
    {
      name: "connected-mobile",
      use: { ...devices["Pixel 7"], baseURL: "http://localhost:3333" },
      testMatch: /connected\.spec\.ts/,
    },
    {
      name: "setup-required",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3334" },
      testMatch: /error-states\.spec\.ts/,
      metadata: { status: "setup" },
    },
    {
      name: "database-unavailable",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3335" },
      testMatch: /error-states\.spec\.ts/,
      metadata: { status: "unavailable" },
    },
  ],
  webServer: [
    appServer("connected", 3333),
    appServer("setup", 3334),
    appServer("unavailable", 3335),
  ],
});
