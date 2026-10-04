import "server-only";

import { and, asc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { products } from "@/lib/db/schema";
import { requireDatabase } from "@/lib/db";
import { assertCurrentShopAccess, type ShopContext } from "@/lib/auth/context";
import { categories, trackingModes } from "@/features/catalog/schemas";

export type CatalogFilters = {
  q?: string;
  category?: string;
  tracking?: string;
  archived?: boolean;
};

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function listProducts(context: ShopContext, filters: CatalogFilters = {}) {
  await assertCurrentShopAccess(context);
  const conditions = [eq(products.shopId, context.shopId)];
  conditions.push(filters.archived ? isNotNull(products.archivedAt) : isNull(products.archivedAt));

  if (filters.category && categories.includes(filters.category as (typeof categories)[number])) {
    conditions.push(eq(products.category, filters.category as (typeof categories)[number]));
  }
  if (filters.tracking && trackingModes.includes(filters.tracking as (typeof trackingModes)[number])) {
    conditions.push(eq(products.trackingMode, filters.tracking as (typeof trackingModes)[number]));
  }
  const q = filters.q?.trim();
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    conditions.push(or(
      ilike(products.name, pattern),
      ilike(products.sku, pattern),
      ilike(products.model, pattern),
      ilike(products.manufacturerPartNumber, pattern),
      ilike(products.barcode, pattern),
    )!);
  }

  return requireDatabase()
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(asc(products.name), asc(products.sku));
}

export async function getProduct(context: ShopContext, productId: string) {
  await assertCurrentShopAccess(context);
  const [product] = await requireDatabase()
    .select()
    .from(products)
    .where(and(
      eq(products.id, productId),
      eq(products.shopId, context.shopId),
    ))
    .limit(1);
  return product ?? null;
}
