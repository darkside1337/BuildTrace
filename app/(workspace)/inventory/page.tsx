import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/features/catalog/queries";
import { categoryLabel } from "@/features/catalog/product-form";
import { requirePageShopContext } from "@/lib/auth/page-access";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const context = await requirePageShopContext();
  const params = await searchParams;
  const one = (value: string | string[] | undefined) => typeof value === "string" ? value : undefined;
  const archived = one(params.archived) === "true";
  const filters = { q: one(params.q), category: one(params.category), tracking: one(params.tracking), archived };
  const products = await listProducts(context, filters);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Catalog</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Inventory</h1>
          <p className="mt-2 text-sm text-muted-foreground">Catalog parts and stock status for this shop.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/inventory/new" />} className="min-h-11 gap-2">
          <Plus aria-hidden="true" data-icon="inline-start" /> Add part
        </Button>
      </header>

      <form action="/inventory" className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
          Search parts
          <input className="min-h-11 rounded-lg border bg-background px-3 font-normal" name="q" defaultValue={filters.q} placeholder="Name, SKU, model, MPN, barcode" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Category
          <select className="min-h-11 rounded-lg border bg-background px-3 font-normal" name="category" defaultValue={filters.category ?? ""}>
            <option value="">All categories</option>
            {["cpu", "gpu", "motherboard", "ram", "storage", "case", "power_supply", "cooling", "accessory"].map((category) => <option key={category} value={category}>{categoryLabel(category)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Tracking
          <select className="min-h-11 rounded-lg border bg-background px-3 font-normal" name="tracking" defaultValue={filters.tracking ?? ""}>
            <option value="">All tracking modes</option><option value="serialized">Serial tracked</option><option value="quantity">Quantity tracked</option>
          </select>
        </label>
        <input type="hidden" name="archived" value={archived ? "true" : "false"} />
        <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
          <Button type="submit" variant="outline" className="min-h-11">Apply filters</Button>
          <Link className="min-h-11 inline-flex items-center text-sm font-medium underline underline-offset-4" href={archived ? "/inventory" : "/inventory?archived=true"}>{archived ? "View active parts" : "View archived parts"}</Link>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <h2 className="font-heading text-xl font-semibold">{filters.q || filters.category || filters.tracking ? "No matching parts" : archived ? "No archived parts" : "No parts yet"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{archived ? "Archived parts will appear here." : "Add a catalog part. This does not add any stock."}</p>
          {!archived && !filters.q && !filters.category && !filters.tracking ? <Button nativeButton={false} render={<Link href="/inventory/new" />} className="mt-5 min-h-11">Add your first part</Button> : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <ul className="divide-y">
            {products.map((product) => (
              <li key={product.id}>
                <Link href={`/inventory/${product.id}`} className="grid min-h-20 gap-2 p-4 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring sm:grid-cols-[1fr_auto] sm:items-center">
                  <span><span className="block font-medium">{product.name}</span><span className="text-sm text-muted-foreground">{product.manufacturer} {product.model} · SKU {product.sku}</span></span>
                  <span className="text-sm text-muted-foreground">{categoryLabel(product.category)} · {product.trackingMode === "serialized" ? "Serial tracked" : "Quantity tracked"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
