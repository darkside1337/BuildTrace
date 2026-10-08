"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Draft = { values: Record<string, string>; category: string; trackingMode: string };
type Session = {
  epoch: number;
  confirmOpen: boolean;
  resetDraft: (key: string) => void;
  readDraft: (key: string) => Draft | undefined;
  writeDraft: (key: string, draft: Draft | null) => void;
  setFormStatus: (key: string, dirty: boolean, pending: boolean) => void;
  setReturnFocus: (href: string) => void;
  takeReturnFocus: () => string | null;
  requestNavigation: (navigate: () => void) => void;
  cancelDiscard: () => void;
  discardChanges: () => void;
};
const Context = createContext<Session | null>(null);
export function useCatalogSession() { return useContext(Context); }
const activeKey = () => window.location.pathname === "/inventory/new" ? "new" : window.location.pathname.match(/^\/inventory\/([^/]+)\/edit$/)?.[1];

// Drafts survive soft Back/Forward inside this authenticated workspace only.
export function CatalogSession({ children }: { children: ReactNode }) {
  const [epoch, setEpoch] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const drafts = useRef(new Map<string, Draft>());
  const forms = useRef(new Map<string, { dirty: boolean; pending: boolean }>());
  const bypass = useRef(false);
  const queued = useRef<(() => void) | null>(null);
  const returnHref = useRef<string | null>(null);
  const resetDraft = useCallback((key: string) => {
    drafts.current.delete(key); forms.current.delete(key); setEpoch(current => current + 1);
  }, []);
  const currentStatus = useCallback(() => {
    if (bypass.current) return { dirty: false, pending: false };
    const key = activeKey();
    const visibleDraft = key && Array.from(document.querySelectorAll<HTMLFormElement>("form[data-catalog-form]")).some(form => form.dataset.catalogForm === key && form.dataset.dirty === "true" && form.getClientRects().length > 0);
    return {
      dirty: Boolean(visibleDraft) || (key ? forms.current.get(key)?.dirty ?? false : false),
      pending: Array.from(forms.current.values()).some(form => form.pending),
    };
  }, []);
  const requestNavigation = useCallback((navigate: () => void) => {
    if (currentStatus().pending) return;
    if (currentStatus().dirty) { queued.current = navigate; setConfirmOpen(true); }
    else navigate();
  }, [currentStatus]);
  const [session] = useState<Omit<Session, "epoch" | "confirmOpen">>(() => ({
    resetDraft,
    readDraft: key => drafts.current.get(key),
    writeDraft: (key, draft) => { if (draft) drafts.current.set(key, draft); else drafts.current.delete(key); },
    setFormStatus: (key, dirty, pending) => { forms.current.set(key, { dirty, pending }); },
    setReturnFocus: href => { returnHref.current = href; },
    takeReturnFocus: () => { const href = returnHref.current; returnHref.current = null; return href; },
    requestNavigation,
    cancelDiscard: () => { queued.current = null; setConfirmOpen(false); },
    discardChanges: () => {
      const key = activeKey(); if (key) resetDraft(key);
      setConfirmOpen(false);
      const navigate = queued.current; queued.current = null;
      bypass.current = true;
      try { navigate?.(); } finally { queueMicrotask(() => { bypass.current = false; }); }
    },
  }));
  useEffect(() => {
    function unload(event: BeforeUnloadEvent) {
      if (currentStatus().dirty || currentStatus().pending) { event.preventDefault(); event.returnValue = ""; }
    }
    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download") || target.getAttribute("href")?.startsWith("#")) return;
      if (!currentStatus().dirty && !currentStatus().pending) return;
      event.preventDefault(); event.stopPropagation(); requestNavigation(() => target.click());
    }
    const navigation = (window as Window & { navigation?: EventTarget }).navigation;
    function navigate(event: Event) { if (currentStatus().pending && event.cancelable) event.preventDefault(); }
    navigation?.addEventListener("navigate", navigate);
    document.addEventListener("click", click, true); window.addEventListener("beforeunload", unload);
    return () => {
      navigation?.removeEventListener("navigate", navigate);
      document.removeEventListener("click", click, true); window.removeEventListener("beforeunload", unload);
    };
  }, [requestNavigation, currentStatus]);
  return <Context.Provider value={{ ...session, epoch, confirmOpen }}>{children}</Context.Provider>;
}

// Render inside the active form so Base UI treats it as a nested dialog when
// the form is in a sheet. Sibling modal roots cannot reliably manage focus.
export function CatalogDiscardDialog() {
  const session = useCatalogSession();
  return <AlertDialog open={session?.confirmOpen ?? false} onOpenChange={open => { if (!open) session?.cancelDiscard(); }}>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Discard your changes?</AlertDialogTitle><AlertDialogDescription>Your unsaved changes will be discarded. You can keep editing instead.</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel onClick={session?.cancelDiscard}>Keep editing</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={session?.discardChanges}>Discard changes</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
