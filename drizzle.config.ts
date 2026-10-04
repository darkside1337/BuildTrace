import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { getDatabaseEnvironment } from "./lib/env";

loadEnvConfig(process.cwd());

const databaseEnvironment = getDatabaseEnvironment();

if (!databaseEnvironment) {
  throw new Error(
    "Valid matching pooled DATABASE_URL and direct DATABASE_URL_UNPOOLED PostgreSQL URLs are required for migrations.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: databaseEnvironment.DATABASE_URL_UNPOOLED },
  strict: true,
  verbose: true,
});
