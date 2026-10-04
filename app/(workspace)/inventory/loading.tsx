export default function InventoryLoading() {
  return (
    <section aria-busy="true" aria-live="polite" className="space-y-6">
      <p role="status" className="text-sm text-muted-foreground">Loading inventory…</p>
      <div className="h-20 animate-pulse rounded-xl bg-muted" />
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
      <div className="h-16 animate-pulse rounded-xl bg-muted" />
    </section>
  );
}
