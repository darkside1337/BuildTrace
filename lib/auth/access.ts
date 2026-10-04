import "server-only";

import { and, eq } from "drizzle-orm";
import { authAccount, memberships } from "@/lib/db/schema";
import { requireDatabase } from "@/lib/db";

export type ShopRole = "owner" | "staff";

export type ShopContext = {
  actorId: string;
  shopId: string;
  role: ShopRole;
};

export class AccessError extends Error {
  constructor(readonly code: "unauthenticated" | "forbidden") {
    super(code);
    this.name = "AccessError";
  }
}

export async function findProvisionedIdentity(providerId: string, providerAccountId: string) {
  const [membership] = await requireDatabase()
    .select({
      shopId: memberships.shopId,
      role: memberships.role,
    })
    .from(memberships)
    .where(and(
      eq(memberships.providerId, providerId),
      eq(memberships.providerAccountId, providerAccountId),
    ))
    .limit(1);

  return membership ?? null;
}

export async function userHasOnlyMembership(
  userId: string,
  shopId: string,
  role: ShopRole,
) {
  const rows = await requireDatabase()
    .selectDistinct({
      shopId: memberships.shopId,
      role: memberships.role,
    })
    .from(authAccount)
    .innerJoin(memberships, and(
      eq(memberships.providerId, authAccount.providerId),
      eq(memberships.providerAccountId, authAccount.accountId),
    ))
    .where(eq(authAccount.userId, userId));

  return rows.length > 0 && rows.every((row) => row.shopId === shopId && row.role === role);
}

export async function membershipsForUser(userId: string) {
  return requireDatabase()
    .selectDistinct({
      shopId: memberships.shopId,
      role: memberships.role,
    })
    .from(authAccount)
    .innerJoin(memberships, and(
      eq(memberships.providerId, authAccount.providerId),
      eq(memberships.providerAccountId, authAccount.accountId),
    ))
    .where(eq(authAccount.userId, userId));
}
