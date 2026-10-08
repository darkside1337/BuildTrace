import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { cn } from "cn";
import { CategoryMark } from "@/features/catalog/components/category-mark";
import { ArchiveProductButton, RestoreProductButton } from "@/features/catalog/components/archive-product-button";
import { categoryLabel } from "@/features/catalog/format";
import { getProduct } from "@/features/catalog/queries";
import { ButtonLink } from "@/components/button-link";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { requirePageShopContext } from "@/lib/auth/page-access";

type Props = { params: Promise<{ productId: string }>; panel?: boolean };
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const show = (value: string | number | null) => value === null || value === "" ? "Not recorded" : String(value);

export async function ProductDetailScreen({ params, panel = false }: Props) {
  const context = await requirePageShopContext();
  const { productId } = await params;
  const product = await getProduct(context, productId);
  if (!product) notFound();
  const identity: Array<[string, string]> = [["Manufacturer", product.manufacturer], ["Model", product.model], ["Internal SKU", product.sku], ["Category", categoryLabel(product.category)], ["Manufacturer part number", show(product.manufacturerPartNumber)], ["Barcode", show(product.barcode)]];
  const prices: Array<[string, string]> = [["Reference purchase cost", product.referencePurchaseCostCents === null ? "Not recorded" : usd.format(product.referencePurchaseCostCents / 100)], ["Reference sale price", product.referenceSalePriceCents === null ? "Not recorded" : usd.format(product.referenceSalePriceCents / 100)]];
  const warranty: Array<[string, string]> = [["Supplier / manufacturer", product.supplierWarrantyMonths === null ? "Not recorded" : `${product.supplierWarrantyMonths} months`], ["Shop / customer", product.customerWarrantyMonths === null ? "Not recorded" : `${product.customerWarrantyMonths} months`]];
  return <article className="flex min-w-0 flex-col gap-6">
    {!panel ? <ButtonLink href={product.archivedAt ? "/inventory?archived=true" : "/inventory"} variant="link" className="self-start"><ArrowLeft aria-hidden="true" data-icon="inline-start" />Parts catalog</ButtonLink> : null}
    <CategoryMark category={product.category} large />
    <PageHeader title={product.name} description={`${product.manufacturer} · ${product.model}`} context={<Badge variant={product.archivedAt ? "secondary" : "outline"}>{product.archivedAt ? "Archived part" : "Catalog part"}</Badge>} actions={!product.archivedAt ? <ButtonLink href={`/inventory/${product.id}/edit`} variant="outline"><Pencil aria-hidden="true" data-icon="inline-start" />Edit part</ButtonLink> : undefined} />
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div className="flex min-w-0 flex-col border bg-card">
        <section aria-labelledby="identity-heading" className="border-t p-5 sm:p-6"><h2 id="identity-heading" className="text-lg font-semibold">Part identity</h2><RecordFields fields={identity} /></section>
        <section aria-labelledby="specs-heading" className="border-t p-5 sm:p-6"><h2 id="specs-heading" className="text-lg font-semibold">Specifications & notes</h2><RecordFields fields={[["Basic specifications", show(product.specifications)], ["Notes", show(product.notes)]]} /></section>
      </div>
      <div className="flex min-w-0 flex-col border bg-card">
        <section aria-labelledby="tracking-heading" className="p-5 sm:p-6"><h2 id="tracking-heading" className="text-lg font-semibold">Tracking rules</h2><RecordFields fields={[["Tracking mode", product.trackingMode === "serialized" ? "Serial tracked" : "Quantity tracked"], ["Low-stock threshold", show(product.lowStockThreshold)]]} compact /></section>
        <section aria-labelledby="prices-heading" className="border-t p-5 sm:p-6"><h2 id="prices-heading" className="text-lg font-semibold">Reference prices</h2><p className="mt-1 text-sm text-muted-foreground">Recorded in USD.</p><RecordFields fields={prices} compact /></section>
        <section aria-labelledby="warranty-heading" className="border-t p-5 sm:p-6"><h2 id="warranty-heading" className="text-lg font-semibold">Warranty defaults</h2><RecordFields fields={warranty} compact /><p className="mt-4 text-sm text-muted-foreground">Defaults do not confirm coverage for an individual unit.</p></section>
        <section aria-labelledby="record-heading" className="border-t p-5 sm:p-6"><h2 id="record-heading" className="text-lg font-semibold">Catalog record</h2><p className="mt-2 mb-4 text-sm text-muted-foreground">{product.archivedAt ? "This part is archived and cannot be selected for new operations." : "Archive a model you no longer use. Its catalog record remains accessible."}</p>{!product.archivedAt ? <ArchiveProductButton productId={product.id} /> : <RestoreProductButton productId={product.id} />}</section>
      </div>
    </div>
  </article>;
}

function RecordFields({ fields, compact = false }: { fields: Array<[string, string]>; compact?: boolean }) {
  return <dl className={cn("mt-5 grid gap-x-8 gap-y-5", !compact && "sm:grid-cols-2")}>{fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted-foreground">{label}</dt><dd className={cn("mt-1 whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]", ["Internal SKU", "Barcode", "Manufacturer part number"].includes(label) && "font-mono")}>{value}</dd></div>)}</dl>;
}
