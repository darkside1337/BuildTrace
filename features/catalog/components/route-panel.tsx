"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCatalogSession } from "@/features/catalog/components/catalog-session";
import { cn } from "cn";

export function RoutePanel({ children, title, form = false }: { children: ReactNode; title: string; form?: boolean }) {
  const router = useRouter(); const pathname = usePathname(); const session = useCatalogSession();
  const [panelPath] = useState(pathname);
  const returnFocus = useRef<Element | null>(null);
  useEffect(() => {
    returnFocus.current = document.activeElement;
    const openedPath = pathname;
    return () => {
      const restore = () => {
        if (window.location.pathname === openedPath) return false;
        const original = returnFocus.current;
        const candidate = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).find(link => new URL(link.href).pathname === openedPath && link.getClientRects().length) ??
          (original instanceof HTMLAnchorElement && original.isConnected ? original : null);
        if (candidate instanceof HTMLElement && candidate.getClientRects().length) { candidate.focus(); return true; }
        return false;
      };
      requestAnimationFrame(() => {
        if (restore()) return;
        const observer = new MutationObserver(() => { if (restore()) observer.disconnect(); });
        observer.observe(document.body, { childList: true, subtree: true });
        window.setTimeout(() => observer.disconnect(), 5000);
      });
    };
  }, [pathname]);
  const close = () => session ? session.requestNavigation(() => { session.setReturnFocus(pathname); router.back(); }) : router.back();
  if (pathname !== panelPath) return null;
  return <Sheet key={panelPath} open onOpenChange={(open, details) => { if (!open) { details.cancel(); close(); } }}><SheetContent finalFocus={false} initialFocus={() => {
    const href = session?.takeReturnFocus();
    if (href) return Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).find(link => new URL(link.href).pathname === href && link.getClientRects().length) ?? true;
    return true;
  }} showCloseButton={false} className={cn("!w-full !max-w-none gap-0 overflow-hidden md:!w-[500px]", form && "md:!w-[560px]")}><SheetHeader className="shrink-0 flex-row items-center justify-between border-b px-5 py-3"><div><SheetTitle>{title}</SheetTitle><SheetDescription className="sr-only">Catalog record panel</SheetDescription></div><Button variant="ghost" size="icon" aria-label="Close panel" onClick={close}><X aria-hidden="true" /></Button></SheetHeader><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div></SheetContent></Sheet>;
}
