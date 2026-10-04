import "server-only";

import { headers } from "next/headers";
import { AccessError, membershipsForUser, type ShopContext } from "@/lib/auth/access";
import { getAuth } from "@/lib/auth";

export { AccessError, type ShopContext } from "@/lib/auth/access";

export async function requireShopContext(): Promise<ShopContext> {
  let session;
  try {
    session = await getAuth().api.getSession({ headers: await headers() });
  } catch {
    throw new AccessError("unauthenticated");
  }
  if (!session) throw new AccessError("unauthenticated");

  let memberships;
  try {
    memberships = await membershipsForUser(session.user.id);
  } catch {
    throw new AccessError("forbidden");
  }

  const scopes = new Set(memberships.map((membership) =>
    `${membership.shopId}:${membership.role}`,
  ));
  if (scopes.size !== 1) throw new AccessError("forbidden");

  const membership = memberships[0];
  if (!membership || (membership.role !== "owner" && membership.role !== "staff")) {
    throw new AccessError("forbidden");
  }
  return {
    actorId: session.user.id,
    shopId: membership.shopId,
    role: membership.role,
  };
}

export async function assertCurrentShopAccess(context: ShopContext) {
  if (context.role !== "owner" && context.role !== "staff") {
    throw new AccessError("forbidden");
  }
  if (!(await membershipsForUser(context.actorId)).some((membership) =>
    membership.shopId === context.shopId && membership.role === context.role,
  )) {
    throw new AccessError("forbidden");
  }
}
