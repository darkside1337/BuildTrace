import Link from "next/link";
import { ProductLink } from "@/features/catalog/components/product-link";
import { Plus } from "lucide-react";
import { cn } from "cn";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/button-link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { CatalogFiltersToolbar } from "@/features/catalog/components/catalog-filters";
import { CategoryMark } from "@/features/catalog/components/category-mark";
import { listProducts, listManufacturers, getCatalogCounts } from "@/features/catalog/queries";
import { categoryLabel } from "@/features/catalog/format";
import { requirePageShopContext } from "@/lib/auth/page-access";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Catalog states: active, archived, empty, and filtered no-results.
// Route boundaries provide loading and recoverable-error states.
export async function CatalogScreen({ searchParams }: { searchParams: SearchParams }) {
  const context = await requirePageShopContext();
  const params = await searchParams;
  const one = (value: string | string[] | undefined) => typeof value === "string" ? value : undefined;
  const archived = one(params.archived) === "true";
  const filters = { q: one(params.q), category: one(params.category), tracking: one(params.tracking), manufacturer: one(params.manufacturer), sort: one(params.sort), direction: one(params.direction), archived };
  const [products, manufacturers, counts] = await Promise.all([listProducts(context, filters), listManufacturers(context, archived), getCatalogCounts(context, filters)]);
  const filtered = Boolean(filters.q || filters.category || filters.tracking || filters.manufacturer);
  const clearHref = archived ? "/inventory?archived=true" : "/inventory";
  const trackingLabel = (mode: string) => mode === "serialized" ? "Serial tracked" : "Quantity tracked";
  const price = (cents: number | null) => cents === null ? "Not recorded" : usd.format(cents / 100);
  function sortLink(key: string, label: string) {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([name, value]) => { if (value !== undefined && value !== false) query.set(name, String(value)); });
    query.set("sort", key); query.set("direction", filters.sort === key && filters.direction !== "desc" ? "desc" : "asc");
    return <Link href={`/inventory?${query}`} scroll={false} className="inline-flex min-h-11 items-center gap-2">{label}<span aria-hidden="true">{filters.sort === key ? filters.direction === "desc" ? "↓" : "↑" : "↕"}</span></Link>;
  }
  return <section className="flex min-w-0 flex-col gap-6">
    <PageHeader title="Parts catalog" description="Every model, identifier, and tracking rule. In one place." actions={<ButtonLink href="/inventory/new"><Plus aria-hidden="true" data-icon="inline-start" />Add part</ButtonLink>} />
    <div className="min-w-0 border bg-card">
      <nav aria-label="Catalog views" className="flex gap-6 border-b px-5 sm:px-6">{[{ href: "/inventory", label: `Active parts · ${counts.activeCount}`, active: !archived }, { href: "/inventory?archived=true", label: `Archived parts · ${counts.archivedCount}`, active: archived }].map(view => <Link key={view.label} href={view.href} aria-current={view.active ? "page" : undefined} className={cn("inline-flex min-h-12 items-center border-b-2 text-sm", view.active ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{view.label}</Link>)}</nav>
      <CatalogFiltersToolbar filters={filters} manufacturers={manufacturers} />
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6"><h2 className="text-base font-semibold">{filtered ? "Matching parts" : archived ? "Archived catalog" : "All parts"}</h2><span className="text-sm text-muted-foreground" role="status">{counts.filteredCount} {counts.filteredCount === 1 ? "part" : "parts"}{filtered ? " matching filters" : ""}</span></div>
      {products.length === 0 ? <Empty className="min-h-72 border-t"><EmptyHeader><EmptyTitle><h3>{filtered ? "No matching parts" : archived ? "No archived parts" : "Start with your first part"}</h3></EmptyTitle><EmptyDescription>{filtered ? "Try another search or clear the filters." : archived ? "Archived parts remain here so their catalog records are accessible." : "Add a product model with its SKU and tracking rules. Catalog creation does not add stock."}</EmptyDescription></EmptyHeader><EmptyContent>{filtered ? <ButtonLink href={clearHref} variant="outline">Clear filters</ButtonLink> : !archived ? <ButtonLink href="/inventory/new"><Plus aria-hidden="true" data-icon="inline-start" />Add your first part</ButtonLink> : null}</EmptyContent></Empty> : <>
        <div className="hidden min-w-0 border-t lg:block" role="region" aria-label="Catalog results" tabIndex={0}><Table><TableCaption className="sr-only">{archived ? "Archived" : "Active"} catalog parts. Prices are reference sale prices in USD.</TableCaption><TableHeader><TableRow><TableHead scope="col" aria-sort={!filters.sort || filters.sort === "name" ? filters.direction === "desc" ? "descending" : "ascending" : "none"} className="pl-6">{sortLink("name", "Product / SKU")}</TableHead><TableHead scope="col" aria-sort={filters.sort === "manufacturer" ? filters.direction === "desc" ? "descending" : "ascending" : "none"}>{sortLink("manufacturer", "Manufacturer")}</TableHead><TableHead scope="col">Category</TableHead><TableHead scope="col">Tracking</TableHead><TableHead scope="col" aria-sort={filters.sort === "referenceSalePriceCents" ? filters.direction === "desc" ? "descending" : "ascending" : "none"} className="pr-6 text-right">{sortLink("referenceSalePriceCents", "Sale price (USD)")}</TableHead></TableRow></TableHeader><TableBody>{products.map(product => <TableRow key={product.id}><TableCell className="pl-6"><div className="flex items-center gap-4"><CategoryMark category={product.category} /><ProductLink href={`/inventory/${product.id}`} className="inline-flex min-h-11 max-w-md flex-col justify-center gap-1 py-2 font-semibold hover:text-primary"><span className="break-words [overflow-wrap:anywhere]">{product.name}</span><span className="text-sm font-normal text-muted-foreground [overflow-wrap:anywhere]">{product.model}</span><span className="break-all font-mono text-xs font-normal text-muted-foreground">{product.sku}</span></ProductLink></div></TableCell><TableCell>{product.manufacturer}</TableCell><TableCell>{categoryLabel(product.category)}</TableCell><TableCell><Badge variant="secondary">{trackingLabel(product.trackingMode)}</Badge></TableCell><TableCell className="pr-6 text-right tabular-nums">{price(product.referenceSalePriceCents)}</TableCell></TableRow>)}</TableBody></Table></div>
        <ul className="divide-y border-t lg:hidden" aria-label="Catalog parts">{products.map(product => <li key={product.id} className="p-4 has-[[aria-current=page]]:bg-selected"><div className="flex items-start gap-3"><CategoryMark category={product.category} /><ProductLink href={`/inventory/${product.id}`} className="flex min-h-11 flex-col justify-center gap-1"><span className="break-words [overflow-wrap:anywhere] font-semibold">{product.name}</span><span className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{product.manufacturer} · {product.model}</span></ProductLink></div><p className="mt-2 break-all font-mono text-xs text-muted-foreground">SKU {product.sku}</p><div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline">{categoryLabel(product.category)}</Badge><Badge variant="secondary">{trackingLabel(product.trackingMode)}</Badge></div><p className="mt-3 text-sm text-muted-foreground">Reference sale price <span className="ml-2 text-foreground tabular-nums">{price(product.referenceSalePriceCents)}</span></p></li>)}</ul>
      </>}
    </div>
    <p className="text-sm text-muted-foreground">Catalog records define product models. Stock is recorded separately.</p>
  </section>;
}
