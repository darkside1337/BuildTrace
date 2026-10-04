import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { memberships, shops } from "../db/schema";

export type OwnerBootstrapInput = {
  shopName: string;
  githubId: string;
  googleId: string;
};

export async function bootstrapOwner(
  db: ReturnType<typeof drizzle>,
  input: OwnerBootstrapInput,
) {
  const [shopId] = await db.transaction(async (tx) => {
    const identities = [
      { providerId: "github" as const, providerAccountId: input.githubId },
      { providerId: "google" as const, providerAccountId: input.googleId },
    ];
    const existing = await tx.select({
      shopId: memberships.shopId,
      providerId: memberships.providerId,
      providerAccountId: memberships.providerAccountId,
      role: memberships.role,
    }).from(memberships).where(or(
      and(eq(memberships.providerId, identities[0].providerId),
        eq(memberships.providerAccountId, identities[0].providerAccountId)),
      and(eq(memberships.providerId, identities[1].providerId),
        eq(memberships.providerAccountId, identities[1].providerAccountId)),
    ));

    const existingShopIds = new Set(existing.map((membership) => membership.shopId));
    if (existingShopIds.size > 1) {
      throw new Error("The supplied identities already belong to different shops.");
    }
    if (existing.some((membership) => membership.role !== "owner")) {
      throw new Error("A supplied identity is already provisioned without the Owner role.");
    }

    let shopId = [...existingShopIds][0];
    if (!shopId) {
      const [shop] = await tx.insert(shops)
        .values({ name: input.shopName })
        .returning({ id: shops.id });
      shopId = shop.id;
    }

    const present = new Set(existing.map((membership) =>
      `${membership.providerId}:${membership.providerAccountId}`,
    ));
    const missing = identities.filter((identity) =>
      !present.has(`${identity.providerId}:${identity.providerAccountId}`),
    );
    if (missing.length) {
      await tx.insert(memberships).values(missing.map((identity) => ({
        shopId,
        ...identity,
        role: "owner" as const,
      })));
    }
    return [shopId] as const;
  });
  return shopId;
}
