import { afterAll, describe, expect, it, vi } from "vitest";
import { Pool } from "@neondatabase/serverless";
import { getDatabaseEnvironment } from "../../lib/env";

vi.mock("server-only", () => ({}));

const config = getDatabaseEnvironment();
if (!config) {
  throw new Error("Catalog integration checks require matching DATABASE_URL and DATABASE_URL_UNPOOLED values in .env.");
}

const pool = new Pool({
  connectionString: config.DATABASE_URL_UNPOOLED,
  connectionTimeoutMillis: 8_000,
  idleTimeoutMillis: 1_000,
  max: 1,
});

afterAll(async () => pool.end());

describe("catalog query and restore behavior", () => {
  it("keeps filters and manufacturer choices shop-scoped, sorts null prices last, and restores with audit metadata", async () => {
    const suffix = crypto.randomUUID();
    const actorId = crypto.randomUUID();
    const accountId = crypto.randomUUID();
    const accountRowId = crypto.randomUUID();
    const shopId = crypto.randomUUID();
    const foreignShopId = crypto.randomUUID();
    const productIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
    const providerId = "github";
    const client = await pool.connect();

    try {
      await client.query('insert into "user" (id, name, email) values ($1, $2, $3)', [actorId, "Catalog Fixture", `${suffix}@example.invalid`]);
      await client.query('insert into account (id, account_id, provider_id, user_id) values ($1, $2, $3, $4)', [accountRowId, accountId, providerId, actorId]);
      await client.query("insert into shops (id, name) values ($1, $2), ($3, $4)", [shopId, "Catalog fixture", foreignShopId, "Foreign catalog fixture"]);
      await client.query(
        "insert into shop_memberships (id, shop_id, provider_id, provider_account_id, role) values ($1, $2, $3, $4, 'owner')",
        [crypto.randomUUID(), shopId, providerId, accountId],
      );
      await client.query(`insert into products
        (id, shop_id, name, category, manufacturer, model, sku, tracking_mode, reference_sale_price_cents, created_by, updated_by, archived_by, archived_at)
        values
        ($1, $2, 'Alpha', 'ram', 'Zenith', 'A', $5, 'quantity', 1000, $6, $6, null, null),
        ($3, $2, 'Beta', 'ram', 'Acme', 'B', $7, 'quantity', null, $6, $6, null, null),
        ($4, $2, 'Gamma', 'ram', 'Acme', 'C', $8, 'quantity', 2000, $6, $6, $6, now()),
        ($9, $10, 'Outside', 'ram', 'Foreign', 'X', $11, 'quantity', 500, $6, $6, $6, now())`,
      [productIds[0], shopId, productIds[1], productIds[2], `alpha-${suffix}`, actorId, `beta-${suffix}`, `gamma-${suffix}`, productIds[3], foreignShopId, `foreign-${suffix}`]);

      const { listProducts, listManufacturers, getCatalogCounts, getProduct } = await import("../../features/catalog/queries");
      const { restoreProduct } = await import("../../features/catalog/mutations");
      const context = { actorId, shopId, role: "owner" as const };

      const priceSorted = await listProducts(context, { sort: "referenceSalePriceCents", direction: "desc" });
      expect(priceSorted.map((product) => product.id)).toEqual([productIds[0], productIds[1]]);
      expect(priceSorted.at(-1)?.referenceSalePriceCents).toBeNull();
      expect(await listManufacturers(context)).toEqual(["Acme", "Zenith"]);
      expect(await listManufacturers(context, true)).toEqual(["Acme"]);
      expect((await listProducts(context, { manufacturer: "Acme", q: "acme" })).map((product) => product.id)).toEqual([productIds[1]]);
      expect(await getCatalogCounts(context, { manufacturer: "Acme" })).toEqual({ activeCount: 2, archivedCount: 1, filteredCount: 1 });

      expect(await getProduct(context, productIds[3])).toBeNull();
      expect(await restoreProduct(context, productIds[3])).toBeNull();
      expect(await restoreProduct(context, productIds[2])).toEqual({ id: productIds[2] });
      const restored = await getProduct(context, productIds[2]);
      expect(restored).toMatchObject({ archivedAt: null, archivedBy: null, updatedBy: actorId });
      expect(restored?.updatedAt.getTime()).toBeGreaterThan(0);
      expect(await restoreProduct(context, productIds[2])).toBeNull();
      expect(await listProducts(context, { manufacturer: "Foreign" })).toEqual([]);
    } finally {
      await client.query("delete from products where shop_id in ($1, $2)", [shopId, foreignShopId]);
      await client.query("delete from shops where id in ($1, $2)", [shopId, foreignShopId]);
      await client.query("delete from account where id = $1", [accountRowId]);
      await client.query('delete from "user" where id = $1', [actorId]);
      client.release();
    }
  });
});
