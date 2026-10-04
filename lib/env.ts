import { z } from "zod";

const postgresUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const { protocol } = new URL(value);
  return protocol === "postgres:" || protocol === "postgresql:";
}, "Expected a PostgreSQL URL");

const databaseEnvironmentSchema = z.object({
  DATABASE_URL: postgresUrl,
  DATABASE_URL_UNPOOLED: postgresUrl,
});

export type DatabaseEnvironment = z.infer<typeof databaseEnvironmentSchema>;

export function getDatabaseEnvironment(
  environment: Record<string, string | undefined> = process.env,
): DatabaseEnvironment | null {
  const result = databaseEnvironmentSchema.safeParse(environment);
  if (!result.success) return null;

  const pooled = new URL(result.data.DATABASE_URL);
  const direct = new URL(result.data.DATABASE_URL_UNPOOLED);
  const pooledHost = pooled.hostname.replace("-pooler.", ".");

  if (
    !pooled.hostname.includes("-pooler") ||
    direct.hostname.includes("-pooler") ||
    pooledHost !== direct.hostname ||
    pooled.pathname !== direct.pathname ||
    pooled.username !== direct.username
  ) {
    return null;
  }

  return result.data;
}
