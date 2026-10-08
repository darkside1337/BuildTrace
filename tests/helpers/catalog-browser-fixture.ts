import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import type { Page } from "@playwright/test";
import { getDatabaseEnvironment } from "../../lib/env";
import {
  authAccount,
  authSession,
  authUser,
  authVerification,
  schema,
} from "../../lib/db/schema";

loadEnvConfig(process.cwd());

type SeedProduct = {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  sku: string;
  category: string;
  trackingMode: string;
  salePrice: number | null;
  archived: boolean;
};

export type CatalogBrowserFixture = {
  actorId: string;
  shopId: string;
  foreignShopId: string;
  products: {
    cpu: SeedProduct;
    ram: SeedProduct;
    gpu: SeedProduct;
    archived: SeedProduct;
    foreign: SeedProduct;
  };
  authenticate(page: Page): Promise<void>;
  readProductBySku(sku: string): Promise<{ id: string; shopId: string } | null>;
};

export function catalogFixtureEnvironmentAvailable() {
  return Boolean(
    getDatabaseEnvironment() &&
    process.env.BETTER_AUTH_URL?.trim() &&
    process.env.BETTER_AUTH_SECRET?.trim(),
  );
}

/**
 * Create a test-only Better Auth instance that mirrors the application's
 * session secret, base URL, adapter, schema, and default cookie settings.
 * Better Auth's test-utils plugin creates the session via internalAdapter and
 * signs its cookie with Better Auth's own cookie utility. It registers no
 * public route and is never added to the production auth configuration.
 */
function createSessionAuth(pool: Pool, baseURL: string) {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!baseURL || !secret) return null;

  const database = drizzle({ client: pool });
  return betterAuth({
    appName: "BuildTrace",
    baseURL,
    secret,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: {
        ...schema,
        user: authUser,
        session: authSession,
        account: authAccount,
        verification: authVerification,
      },
    }),
    emailAndPassword: { enabled: false },
    plugins: [testUtils()],
  });
}

async function insertProduct(
  client: PoolClient,
  fixture: { actorId: string; shopId: string },
  product: SeedProduct,
) {
  await client.query(
    `insert into products
      (id, shop_id, name, category, manufacturer, model, sku, tracking_mode,
       reference_sale_price_cents, created_by, updated_by, archived_by, archived_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10,
       case when $11 then $10 else null end,
       case when $11 then now() else null end)`,
    [
      product.id,
      fixture.shopId,
      product.name,
      product.category,
      product.manufacturer,
      product.model,
      product.sku,
      product.trackingMode,
      product.salePrice,
      fixture.actorId,
      product.archived,
    ],
  );
}

/**
 * Owns exactly one uniquely named user, provider account, membership, shop,
 * session, and its products. Cleanup deletes only rows addressed by those
 * generated IDs, in foreign-key order; no shared rows are truncated.
 */
export async function createCatalogBrowserFixture(page: Page, baseURL = "http://localhost:3336"): Promise<{
  fixture: CatalogBrowserFixture;
  cleanup(): Promise<void>;
}> {
  const config = getDatabaseEnvironment();
  if (!config) throw new Error("A valid pooled/direct DATABASE_URL pair is required.");

  const missingAuth = ["BETTER_AUTH_URL", "BETTER_AUTH_SECRET"].filter(
    (name) => !process.env[name]?.trim(),
  );
  if (missingAuth.length) {
    throw new Error(`Missing required test auth configuration: ${missingAuth.join(", ")}.`);
  }

  const pool = new Pool({
    connectionString: config.DATABASE_URL_UNPOOLED,
    connectionTimeoutMillis: 8_000,
    idleTimeoutMillis: 1_000,
    max: 1,
  });
  const sessionAuth = createSessionAuth(pool, baseURL);
  if (!sessionAuth) {
    await pool.end();
    throw new Error("BETTER_AUTH_URL and BETTER_AUTH_SECRET are required for the browser fixture.");
  }

  const suffix = crypto.randomUUID();
  const actorId = crypto.randomUUID();
  const shopId = crypto.randomUUID();
  const foreignShopId = crypto.randomUUID();
  const providerAccountId = `ledger-e2e-${suffix}`;
  const accountId = crypto.randomUUID();
  const products: CatalogBrowserFixture["products"] = {
    cpu: {
      id: crypto.randomUUID(), name: "Ryzen 9 9900X", manufacturer: "Aster",
      model: "Aster 9000", sku: `CPU-${suffix}`, category: "cpu",
      trackingMode: "serialized", salePrice: 34999, archived: false,
    },
    ram: {
      id: crypto.randomUUID(), name: "Vengeance DDR5 32 GB", manufacturer: "Northstar",
      model: "DDR5-6000", sku: `RAM-${suffix}`, category: "ram",
      trackingMode: "quantity", salePrice: 12999, archived: false,
    },
    gpu: {
      id: crypto.randomUUID(), name: "GeForce RTX 5080", manufacturer: "Northstar",
      model: "RTX Fixture", sku: `GPU-${suffix}`, category: "gpu",
      trackingMode: "serialized", salePrice: null, archived: false,
    },
    archived: {
      id: crypto.randomUUID(), name: "Vengeance DDR4 16 GB", manufacturer: "Aster",
      model: "Legacy Fixture", sku: `ARC-${suffix}`, category: "ram",
      trackingMode: "quantity", salePrice: 5999, archived: true,
    },
    foreign: {
      id: crypto.randomUUID(), name: `Foreign Ledger ${suffix}`, manufacturer: "Outside Shop",
      model: "Private Fixture", sku: `OUT-${suffix}`, category: "accessory",
      trackingMode: "quantity", salePrice: 1999, archived: false,
    },
  };

  let userSaved = false;
  try {
    const testContext = await sessionAuth.$context;
    const testUser = testContext.test.createUser({
      id: actorId,
      name: `Ledger fixture ${suffix}`,
      email: `ledger-${suffix}@example.invalid`,
      emailVerified: true,
    });
    await testContext.test.saveUser(testUser);
    userSaved = true;

    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("insert into shops (id, name) values ($1, $2), ($3, $4)", [
        shopId, "Trace validation shop", foreignShopId, `Ledger foreign E2E ${suffix}`,
      ]);
      await client.query(
        `insert into account (id, account_id, provider_id, user_id)
         values ($1, $2, 'github', $3)`,
        [accountId, providerAccountId, actorId],
      );
      await client.query(
        `insert into shop_memberships
          (id, shop_id, provider_id, provider_account_id, role)
         values ($1, $2, 'github', $3, 'owner')`,
        [crypto.randomUUID(), shopId, providerAccountId],
      );
      for (const product of [products.cpu, products.ram, products.gpu, products.archived]) {
        await insertProduct(client, { actorId, shopId }, product);
      }
      await insertProduct(client, { actorId, shopId: foreignShopId }, products.foreign);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    const cookies = await testContext.test.getCookies({ userId: actorId, domain: "localhost" });

    let cleaned = false;
    const cleanup = async () => {
      if (cleaned) return;
      cleaned = true;
      await page.context().clearCookies();
      const cleanupClient = await pool.connect();
      try {
        await cleanupClient.query("begin");
        await cleanupClient.query("delete from products where shop_id = any($1::text[])", [[shopId, foreignShopId]]);
        await cleanupClient.query("delete from shop_memberships where shop_id = any($1::text[])", [[shopId, foreignShopId]]);
        await cleanupClient.query("delete from shops where id = any($1::text[])", [[shopId, foreignShopId]]);
        await cleanupClient.query('delete from "session" where user_id = $1', [actorId]);
        await cleanupClient.query("delete from account where user_id = $1", [actorId]);
        await cleanupClient.query('delete from "user" where id = $1', [actorId]);
        await cleanupClient.query("commit");
      } catch (error) {
        await cleanupClient.query("rollback");
        throw error;
      } finally {
        cleanupClient.release();
        await pool.end();
      }
    };

    const fixture: CatalogBrowserFixture = {
      actorId,
      shopId,
      foreignShopId,
      products,
      async authenticate(targetPage) {
        await targetPage.context().addCookies(cookies);
      },
      async readProductBySku(sku) {
        const result = await pool.query(
          "select id, shop_id as \"shopId\" from products where shop_id = $1 and sku = $2 limit 1",
          [shopId, sku],
        );
        return result.rows[0] ?? null;
      },
    };

    return { fixture, cleanup };
  } catch (error) {
    if (userSaved) {
      const client = await pool.connect();
      try {
        await client.query("begin");
        await client.query("delete from products where shop_id = any($1::text[])", [[shopId, foreignShopId]]);
        await client.query("delete from shop_memberships where shop_id = any($1::text[])", [[shopId, foreignShopId]]);
        await client.query("delete from shops where id = any($1::text[])", [[shopId, foreignShopId]]);
        await client.query('delete from "session" where user_id = $1', [actorId]);
        await client.query("delete from account where user_id = $1", [actorId]);
        await client.query('delete from "user" where id = $1', [actorId]);
        await client.query("commit");
      } catch {
        await client.query("rollback");
      } finally {
        client.release();
      }
    }
    await pool.end();
    throw error;
  }
}
