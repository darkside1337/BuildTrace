import { afterAll, describe, expect, it } from "vitest";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { getDatabaseEnvironment } from "../../lib/env";
import { bootstrapOwner } from "../../lib/auth/bootstrap-owner";

const config = getDatabaseEnvironment();
if (!config) {
  throw new Error(
    "Database integration checks require matching DATABASE_URL and DATABASE_URL_UNPOOLED values in .env.",
  );
}

const pool = new Pool({
  connectionString: config.DATABASE_URL_UNPOOLED,
  connectionTimeoutMillis: 8_000,
  idleTimeoutMillis: 1_000,
  max: 1,
});
const db = drizzle({ client: pool });

afterAll(async () => {
  await pool.end();
});

describe("shared Neon database integration", () => {
  it("executes a read-only connection smoke check", async () => {
    const result = await pool.query("select 1 as healthy");
    expect(result.rows[0]?.healthy).toBe(1);
  });

  it("rolls back a temporary fixture without leaving database records", async () => {
    const client = await pool.connect();

    try {
      await client.query("begin");
      await client.query(
        "create temporary table buildtrace_phase00_probe (token text primary key)",
      );
      await client.query(
        "insert into buildtrace_phase00_probe (token) values ($1)",
        ["phase-00-smoke"],
      );
      const inserted = await client.query(
        "select token from buildtrace_phase00_probe",
      );
      expect(inserted.rows).toEqual([{ token: "phase-00-smoke" }]);

      await client.query("rollback");
      const table = await client.query(
        "select to_regclass('pg_temp.buildtrace_phase00_probe') as table_name",
      );
      expect(table.rows[0]?.table_name).toBeNull();
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  });

  it("enforces shop SKU uniqueness and records the server actor", async () => {
    const client = await pool.connect();
    const suffix = crypto.randomUUID();
    const userId = `phase1-user-${suffix}`;
    const shopId = `phase1-shop-${suffix}`;
    const productId = `phase1-product-${suffix}`;

    try {
      await client.query("begin");
      await client.query('insert into "user" (id, name, email) values ($1, $2, $3)', [userId, "Fixture Owner", `${suffix}@example.invalid`]);
      await client.query('insert into shops (id, name) values ($1, $2)', [shopId, "Phase 1 rollback fixture"]);
      await client.query(`insert into products
        (id, shop_id, name, category, manufacturer, model, sku, tracking_mode, created_by, updated_by)
        values ($1, $2, $3, 'ram', 'Fixture', 'DDR5', $4, 'quantity', $5, $5)`,
      [productId, shopId, "Fixture memory", `sku-${suffix}`, userId]);

      const audit = await client.query('select created_by, updated_by from products where id = $1', [productId]);
      expect(audit.rows[0]).toEqual({ created_by: userId, updated_by: userId });

      let duplicateError: { code?: string; constraint?: string } | undefined;
      try {
        await client.query(`insert into products
          (id, shop_id, name, category, manufacturer, model, sku, tracking_mode, created_by, updated_by)
          values ($1, $2, $3, 'ram', 'Fixture', 'DDR5', $4, 'quantity', $5, $5)`,
        [`duplicate-${suffix}`, shopId, "Duplicate memory", `sku-${suffix}`, userId]);
      } catch (error) {
        duplicateError = error as { code?: string; constraint?: string };
      }
      expect(duplicateError?.code).toBe("23505");
      expect(duplicateError?.constraint).toBe("products_shop_sku_unique");
    } finally {
      await client.query("rollback");
      client.release();
    }
  });

  it("rejects quantity tracking for serial-required categories", async () => {
    const client = await pool.connect();
    const suffix = crypto.randomUUID();
    try {
      await client.query("begin");
      await client.query('insert into "user" (id, name, email) values ($1, $2, $3)', [`phase1-user-${suffix}`, "Fixture Owner", `${suffix}@example.invalid`]);
      await client.query('insert into shops (id, name) values ($1, $2)', [`phase1-shop-${suffix}`, "Phase 1 rollback fixture"]);
      await expect(client.query(`insert into products
        (id, shop_id, name, category, manufacturer, model, sku, tracking_mode, created_by, updated_by)
        values ($1, $2, $3, 'gpu', 'Fixture', 'GPU', $4, 'quantity', $5, $5)`,
      [`phase1-product-${suffix}`, `phase1-shop-${suffix}`, "Fixture GPU", `sku-${suffix}`, `phase1-user-${suffix}`])).rejects.toMatchObject({
        code: "23514",
        constraint: "products_serial_required_check",
      });
    } finally {
      await client.query("rollback");
      client.release();
    }
  });

  it("bootstraps the same Owner identities idempotently", async () => {
    const suffix = crypto.randomUUID();
    const githubId = `phase1-${suffix}`;
    const googleId = `phase1-${suffix}`;
    let shopId: string | undefined;
    try {
      shopId = await bootstrapOwner(db, { shopName: "Phase 1 bootstrap fixture", githubId, googleId });
      const rerunShopId = await bootstrapOwner(db, { shopName: "Changed name must not replace shop", githubId, googleId });
      expect(rerunShopId).toBe(shopId);
      const result = await pool.query(
        "select provider_id, provider_account_id, role from shop_memberships where shop_id = $1 order by provider_id",
        [shopId],
      );
      expect(result.rows).toEqual([
        { provider_id: "github", provider_account_id: githubId, role: "owner" },
        { provider_id: "google", provider_account_id: googleId, role: "owner" },
      ]);
    } finally {
      if (shopId) await pool.query("delete from shops where id = $1", [shopId]);
    }
  });
});
