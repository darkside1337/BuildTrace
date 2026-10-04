import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requirePageShopContext } from "@/lib/auth/page-access";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  await requirePageShopContext();
  return <AppShell activeHref="/inventory" showSignOut showConnectionRefresh={false}><div className="w-full">{children}</div></AppShell>;
}
