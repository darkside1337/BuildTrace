import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const mode = process.argv[2];
const ports = { connected: 3333, setup: 3334, unavailable: 3335 };
const port = ports[mode];

if (!port) {
  throw new Error("Use connected, setup, or unavailable as the E2E server mode.");
}

createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
const env = { ...process.env };
env.NEXT_DIST_DIR = `.next-e2e-${mode}`;

if (mode === "setup") {
  env.DATABASE_URL = "";
  env.DATABASE_URL_UNPOOLED = "";
}

if (mode === "unavailable") {
  env.DATABASE_URL =
    "postgresql://phase00:do-not-use@ep-buildtrace-e2e-pooler.invalid/neondb?sslmode=require";
  env.DATABASE_URL_UNPOOLED =
    "postgresql://phase00:do-not-use@ep-buildtrace-e2e.invalid/neondb?sslmode=require";
}

const nextCli = resolve("node_modules/next/dist/bin/next");
const server = spawn(
  process.execPath,
  [nextCli, "dev", "--webpack", "--port", String(port)],
  {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code) => process.exit(code ?? 1));
