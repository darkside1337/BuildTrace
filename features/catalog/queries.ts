import "server-only";

import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { products } from "@/lib/db/schema";
import { requireDatabase } from "@/lib/db";
import { assertCurrentShopAccess, type ShopContext } from "@/lib/auth/context";
import { categories, productIdSchema, trackingModes } from "@/features/catalog/schemas";

export const catalogSortFields = ["name", "manufacturer", "referenceSalePriceCents"] as const;
export type CatalogSort = (typeof catalogSortFields)[number];
export type CatalogDirection = "asc" | "desc";

export type CatalogFilters = {
  q?: string;
  category?: string;
  tracking?: string;
  manufacturer?: string;
  archived?: boolean;
  sort?: string;
  direction?: string;
};

export type CatalogCounts = {
  activeCount: number;
  archivedCount: number;
  filteredCount: number;
};

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function conditionsFor(context: ShopContext, filters: CatalogFilters = {}) {
  const conditions = [eq(products.shopId, context.shopId)];
  conditions.push(filters.archived ? isNotNull(products.archivedAt) : isNull(products.archivedAt));

  if (filters.category && categories.includes(filters.category as (typeof categories)[number])) {
    conditions.push(eq(products.category, filters.category as (typeof categories)[number]));
  }
  if (filters.tracking && trackingModes.includes(filters.tracking as (typeof trackingModes)[number])) {
    conditions.push(eq(products.trackingMode, filters.tracking as (typeof trackingModes)[number]));
  }
  if (filters.manufacturer?.trim()) {
    conditions.push(eq(products.manufacturer, filters.manufacturer.trim()));
  }
  const q = filters.q?.trim();
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    conditions.push(or(
      ilike(products.name, pattern),
      ilike(products.sku, pattern),
      ilike(products.model, pattern),
      ilike(products.manufacturer, pattern),
      ilike(products.manufacturerPartNumber, pattern),
      ilike(products.barcode, pattern),
    )!);
  }
  return conditions;
}

function orderingFor(filters: CatalogFilters) {
  const sort = catalogSortFields.includes(filters.sort as CatalogSort)
    ? filters.sort as CatalogSort
    : "name";
  const direction: CatalogDirection = filters.direction === "desc" ? "desc" : "asc";
  const order = direction === "desc" ? desc : asc;

  if (sort === "referenceSalePriceCents") {
    return [
      // PostgreSQL's default puts nulls first for descending order. Keep unknown prices last either way.
      asc(sql`case when ${products.referenceSalePriceCents} is null then 1 else 0 end`),
      order(products.referenceSalePriceCents),
      asc(sql`lower(${products.name})`),
      asc(products.sku),
      asc(products.id),
    ];
  }

  if (sort === "manufacturer") {
    return [
      order(sql`lower(${products.manufacturer})`),
      asc(sql`lower(${products.name})`),
      asc(products.sku),
      asc(products.id),
    ];
  }

  return [
    order(sql`lower(${products.name})`),
    asc(sql`lower(${products.manufacturer})`),
    asc(products.sku),
    asc(products.id),
  ];
}

export async function listProducts(context: ShopContext, filters: CatalogFilters = {}) {
  await assertCurrentShopAccess(context);
  return requireDatabase()
    .select()
    .from(products)
    .where(and(...conditionsFor(context, filters)))
    .orderBy(...orderingFor(filters));
}

export async function listManufacturers(context: ShopContext, archived = false): Promise<string[]> {
  await assertCurrentShopAccess(context);
  const rows = await requireDatabase()
    .select({ manufacturer: products.manufacturer })
    .from(products)
    .where(and(
      eq(products.shopId, context.shopId),
      archived ? isNotNull(products.archivedAt) : isNull(products.archivedAt),
    ))
    .groupBy(products.manufacturer)
    .orderBy(asc(sql`lower(${products.manufacturer})`), asc(products.manufacturer));
  return rows.map((row) => row.manufacturer);
}

export async function getCatalogCounts(
  context: ShopContext,
  filters: CatalogFilters = {},
): Promise<CatalogCounts> {
  await assertCurrentShopAccess(context);
  const database = requireDatabase();
  const [totals, filtered] = await Promise.all([
    database.select({
      activeCount: sql<number>`count(*) filter (where ${products.archivedAt} is null)::int`,
      archivedCount: sql<number>`count(*) filter (where ${products.archivedAt} is not null)::int`,
    }).from(products).where(eq(products.shopId, context.shopId)),
    database.select({ count: count() })
      .from(products)
      .where(and(...conditionsFor(context, filters))),
  ]);
  return {
    activeCount: totals[0]?.activeCount ?? 0,
    archivedCount: totals[0]?.archivedCount ?? 0,
    filteredCount: filtered[0]?.count ?? 0,
  };
}

export async function getProduct(context: ShopContext, productId: string) {
  await assertCurrentShopAccess(context);
  const parsedId = productIdSchema.safeParse(productId);
  if (!parsedId.success) return null;
  const [product] = await requireDatabase()
    .select()
    .from(products)
    .where(and(
      eq(products.id, parsedId.data),
      eq(products.shopId, context.shopId),
    ))
    .limit(1);
  return product ?? null;
}
