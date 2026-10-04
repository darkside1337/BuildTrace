"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, PackageCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/features/auth/sign-out-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 rounded-sm">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <PackageCheck aria-hidden="true" className="size-5" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight">
        BuildTrace
      </span>
    </Link>
  );
}

function navigationClassName(active: boolean) {
  const base = "flex min-h-11 items-center gap-3 rounded-md px-3 font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring";
  return active ? `${base} border-l-2 border-primary bg-accent` : base;
}

function NavigationLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: "/" | "/inventory";
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={navigationClassName(active)}
      onClick={onNavigate}
    >
      <span aria-hidden="true" className={active ? "size-1.5 rounded-full bg-primary" : "size-1.5"} />
      {label}
    </Link>
  );
}

export function AppShell({
  children,
  activeHref = "/",
  showSignOut = false,
  showConnectionRefresh = true,
}: {
  children: ReactNode;
  activeHref?: "/" | "/inventory";
  showSignOut?: boolean;
  showConnectionRefresh?: boolean;
}) {
  const router = useRouter();
  const [isRefreshing, startRefreshing] = useTransition();
  const [isNavigationOpen, setNavigationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 md:hidden">
        <Brand />
        <Sheet open={isNavigationOpen} onOpenChange={setNavigationOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon-lg"
                className="size-11"
                aria-label="Open navigation"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="gap-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle>
                <Brand />
              </SheetTitle>
              <SheetDescription>BuildTrace workspace navigation</SheetDescription>
            </SheetHeader>
            <nav aria-label="Primary navigation" className="p-4">
              <NavigationLink href="/" label="Home" active={activeHref === "/"} onNavigate={() => setNavigationOpen(false)} />
            </nav>
            {showSignOut ? <div className="border-t px-5 py-4"><SignOutButton /></div> : null}
          </SheetContent>
        </Sheet>
      </header>

      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background px-5 py-6 md:flex">
        <Brand />
        <nav aria-label="Primary navigation" className="mt-10">
          <p className="mb-3 px-3 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Workspace
          </p>
          <div className="flex flex-col gap-1">
            <NavigationLink href="/" label="Home" active={activeHref === "/"} />
          </div>
        </nav>
        <div className="mt-auto border-t pt-4">
          {showSignOut
            ? <SignOutButton />
            : <p className="text-xs text-muted-foreground">Local development</p>}
        </div>
      </aside>

      <main className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8 sm:px-6 sm:py-12 md:ml-64 md:min-h-screen md:px-10 md:py-14">
        <div className="w-full max-w-5xl">
          {children}
          {showConnectionRefresh ? <div className="mt-7 flex justify-start border-t pt-5">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11 gap-2"
              disabled={isRefreshing}
              onClick={() => startRefreshing(() => router.refresh())}
              aria-live="polite"
            >
              <RefreshCw
                aria-hidden="true"
                className={isRefreshing ? "size-4 animate-spin" : "size-4"}
              />
              {isRefreshing ? "Checking…" : "Check connection again"}
            </Button>
          </div> : null}
        </div>
      </main>
    </div>
  );
}
