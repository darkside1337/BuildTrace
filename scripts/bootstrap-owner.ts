import { loadEnvConfig } from "@next/env";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { z } from "zod";
import { getDatabaseEnvironment } from "../lib/env";
import { bootstrapOwner } from "../lib/auth/bootstrap-owner";

loadEnvConfig(process.cwd());

const usage = "Usage: pnpm bootstrap:owner -- --shop-name <name> --github-id <id> --google-id <id>";
const args = process.argv.slice(2).filter((argument) => argument !== "--");
const values = new Map<string, string>();
for (let index = 0; index < args.length; index += 2) {
  const key = args[index];
  const value = args[index + 1];
  if (!key?.startsWith("--") || !value || value.startsWith("--")) {
    throw new Error(usage);
  }
  if (values.has(key)) throw new Error(usage);
  values.set(key, value);
}

const input = z.object({
  shopName: z.string().trim().min(1).max(160),
  githubId: z.string().trim().min(1).max(200),
  googleId: z.string().trim().min(1).max(200),
}).safeParse({
  shopName: values.get("--shop-name"),
  githubId: values.get("--github-id"),
  googleId: values.get("--google-id"),
});

if (!input.success) throw new Error(usage);
const config = getDatabaseEnvironment();
if (!config) throw new Error("A valid pooled and direct Neon URL pair is required.");

const pool = new Pool({ connectionString: config.DATABASE_URL_UNPOOLED, max: 1 });
const db = drizzle({ client: pool });

try {
  const shopId = await bootstrapOwner(db, {
    shopName: input.data.shopName,
    githubId: input.data.githubId,
    googleId: input.data.googleId,
  });
  console.log(`Owner access is ready for shop ${shopId}.`);
} finally {
  await pool.end();
}
