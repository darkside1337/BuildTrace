import type { ReactNode } from "react";
import { CatalogSession } from "@/features/catalog/components/catalog-session";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { WorkspaceMenu } from "@/features/workspace/components/workspace-menu";
import { requirePageShopContext } from "@/lib/auth/page-access";
import { getWorkspaceDisplay } from "@/features/workspace/queries";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const context = await requirePageShopContext();
  const workspace = await getWorkspaceDisplay(context);
  return <CatalogSession key={`${context.shopId}:${context.actorId}`}>
    <div className="min-h-dvh bg-background">
      <a href="#workspace-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-card focus:p-3">Skip to content</a>
      <header className="flex min-h-20 items-center justify-between gap-6 border-b-2 border-primary bg-card px-4 md:px-8 xl:px-12">
        <Link href="/" className="inline-flex min-h-11 shrink-0 items-center"><Brand className="h-auto w-[150px] md:w-[160px]" /></Link>
        <nav aria-label="Primary navigation" className="mr-auto hidden gap-6 md:flex">
          <Link href="/" className="inline-flex min-h-11 items-center border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground">Home</Link>
          <Link href="/inventory" aria-current="page" className="inline-flex min-h-11 items-center border-b-2 border-primary text-sm font-semibold text-primary">Parts catalog</Link>
        </nav>
        <WorkspaceMenu workspace={workspace} />
      </header>
      <main id="workspace-content" tabIndex={-1} className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-7 px-4 py-7 outline-none md:px-8 md:py-10 xl:px-12">{children}</main>
    </div>
  </CatalogSession>;
}
