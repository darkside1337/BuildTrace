import "server-only";

import { redirect } from "next/navigation";
import { AccessError, requireShopContext } from "@/lib/auth/context";

export async function requirePageShopContext() {
  try {
    return await requireShopContext();
  } catch (error) {
    if (error instanceof AccessError && error.code === "unauthenticated") {
      redirect("/sign-in");
    }
    redirect("/sign-in?error=shop-access");
  }
}
