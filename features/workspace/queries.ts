import "server-only";
import { eq } from "drizzle-orm";
import { assertCurrentShopAccess, type ShopContext } from "@/lib/auth/context";
import { requireDatabase } from "@/lib/db";
import { shops } from "@/lib/db/schema";

export async function getWorkspaceDisplay(context: ShopContext) {
  await assertCurrentShopAccess(context);
  const [shop] = await requireDatabase().select({ name: shops.name }).from(shops).where(eq(shops.id, context.shopId)).limit(1);
  if (!shop) throw new Error("Workspace unavailable");
  return { name: shop.name, role: context.role };
}
