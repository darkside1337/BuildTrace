"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { useCatalogSession } from "@/features/catalog/components/catalog-session";

export function WorkspaceMenu({ workspace }: { workspace: { name: string; role: "owner" | "staff" } }) {
  const session = useCatalogSession();
  const [navigationOpen, setNavigationOpen] = useState(false);

  function beforeSignOut(execute: () => void) {
    setNavigationOpen(false);
    if (session) session.requestNavigation(execute);
    else execute();
  }

  function identity(menu = false) {
    return <div className="flex min-w-0 flex-col gap-3 p-4">
      <p className="break-words text-sm font-semibold [overflow-wrap:anywhere]">{workspace.name}</p>
      <p className="text-xs text-muted-foreground">{workspace.role === "owner" ? "Owner" : "Staff"}</p>
      <SignOutButton beforeSignOut={beforeSignOut} menu={menu} />
    </div>;
  }

  return <>
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" />}><Store aria-hidden="true" data-icon="inline-start" /><span className="max-w-48 truncate">{workspace.name}</span><ChevronDown aria-hidden="true" data-icon="inline-end" /></DropdownMenuTrigger>
        <DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuLabel>Shop account</DropdownMenuLabel>{identity(true)}</DropdownMenuGroup></DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="md:hidden">
      <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
        <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Open navigation" />}><Menu aria-hidden="true" /></SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="border-b pr-16"><SheetTitle>BuildTrace</SheetTitle><SheetDescription>Workspace navigation</SheetDescription></SheetHeader>
          <nav aria-label="Primary navigation" className="flex flex-col gap-2 px-5">
            <Link href="/" onClick={() => setNavigationOpen(false)} className="inline-flex min-h-11 items-center border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/inventory" onClick={() => setNavigationOpen(false)} aria-current="page" className="inline-flex min-h-11 items-center border-b-2 border-primary text-sm font-semibold text-primary">Parts catalog</Link>
          </nav>
          <div className="mt-auto border-t">{identity()}</div>
        </SheetContent>
      </Sheet>
    </div>
  </>;
}
