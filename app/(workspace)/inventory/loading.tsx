import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryLoading() {
  return <section aria-busy="true" aria-live="polite" className="flex flex-col gap-6"><p role="status" className="text-sm text-muted-foreground">Loading inventory…</p><Skeleton className="h-10 w-56" /><div className="flex flex-col gap-5 border bg-card p-6"><Skeleton className="h-12 w-full" /><Skeleton className="h-24" /><Skeleton className="h-48" /></div></section>;
}
