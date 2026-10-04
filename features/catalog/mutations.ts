import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { products } from "@/lib/db/schema";
import { requireDatabase } from "@/lib/db";
import { assertCurrentShopAccess, type ShopContext } from "@/lib/auth/context";
import type { CatalogInput } from "@/features/catalog/schemas";
import type { SaveResult } from "@/features/catalog/types";

function hasSkuConstraint(error: unknown): boolean {
  let current: unknown = error;
  const seen = new Set<object>();
  for (let depth = 0; depth < 5 && current && typeof current === "object"; depth++) {
    if (seen.has(current)) break;
    seen.add(current);
    const record = current as Record<string, unknown>;
    if (record.code === "23505" && record.constraint === "products_shop_sku_unique") return true;
    current = record.cause ?? record.originalError;
  }
  return false;
}

export async function createProduct(context: ShopContext, input: CatalogInput): Promise<SaveResult> {
  await assertCurrentShopAccess(context);
  try {
    const [product] = await requireDatabase().insert(products).values({
      ...input,
      shopId: context.shopId,
      createdBy: context.actorId,
      updatedBy: context.actorId,
    }).returning({ id: products.id });
    return { ok: true, productId: product.id };
  } catch (error) {
    if (hasSkuConstraint(error)) {
      return {
        ok: false,
        message: "A part with this SKU already exists in this shop.",
        fieldErrors: { sku: ["Choose a unique SKU."] },
      };
    }
    throw error;
  }
}

export async function updateProduct(
  context: ShopContext,
  productId: string,
  input: CatalogInput,
): Promise<SaveResult> {
  await assertCurrentShopAccess(context);
  try {
    const [product] = await requireDatabase().update(products).set({
      ...input,
      updatedBy: context.actorId,
      updatedAt: new Date(),
    }).where(and(
      eq(products.id, productId),
      eq(products.shopId, context.shopId),
      isNull(products.archivedAt),
    )).returning({ id: products.id });
    if (!product) return { ok: false, message: "This active part could not be found." };
    return { ok: true, productId: product.id };
  } catch (error) {
    if (hasSkuConstraint(error)) {
      return {
        ok: false,
        message: "A part with this SKU already exists in this shop.",
        fieldErrors: { sku: ["Choose a unique SKU."] },
      };
    }
    throw error;
  }
}

export async function archiveProduct(context: ShopContext, productId: string) {
  await assertCurrentShopAccess(context);
  const [product] = await requireDatabase().update(products).set({
    archivedBy: context.actorId,
    archivedAt: new Date(),
    updatedBy: context.actorId,
    updatedAt: new Date(),
  }).where(and(
    eq(products.id, productId),
    eq(products.shopId, context.shopId),
    isNull(products.archivedAt),
  )).returning({ id: products.id });

  return product ?? null;
}
