import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { getDatabaseEnvironment } from "@/lib/env";
import {
  authAccount,
  authSession,
  authUser,
  authVerification,
  memberships,
  products,
  shops,
} from "@/lib/db/schema";

declare global {
  var buildTraceDbPool: Pool | undefined;
}

function createPool(): Pool {
  const config = getDatabaseEnvironment();
  if (!config) throw new Error("Database configuration is unavailable");

  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 5_000,
    max: 2,
    query_timeout: 8_000,
  });

  pool.on("error", () => {
    // The health check reports a safe state to the user without logging driver details.
  });

  return pool;
}

function getPool(): Pool | null {
  if (!getDatabaseEnvironment()) return null;
  return (globalThis.buildTraceDbPool ??= createPool());
}

export function getDatabase() {
  const pool = getPool();
  return pool
    ? drizzle({
        client: pool,
        schema: {
          user: authUser,
          session: authSession,
          account: authAccount,
          verification: authVerification,
          memberships,
          products,
          shops,
        },
      })
    : null;
}

export function requireDatabase() {
  const database = getDatabase();
  if (!database) throw new Error("Database configuration is unavailable");
  return database;
}

export type DatabaseStatus = "setup_required" | "connected" | "unavailable";

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const pool = getPool();
  if (!pool) return "setup_required";

  try {
    await pool.query("select 1");
    return "connected";
  } catch {
    return "unavailable";
  }
}
