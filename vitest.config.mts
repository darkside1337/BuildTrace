import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
    maxWorkers: 4,
  },
});
