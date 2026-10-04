import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveProductButton } from "@/features/catalog/archive-product-button";
import { categoryLabel } from "@/features/catalog/product-form";
import { getProduct } from "@/features/catalog/queries";
import { Button } from "@/components/ui/button";
import { requirePageShopContext } from "@/lib/auth/page-access";

type Props = { params: Promise<{ productId: string }> };
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const show = (value: string | number | null) => value === null || value === "" ? "Not provided" : String(value);

export default async function ProductDetailPage({ params }: Props) {
  const context = await requirePageShopContext();
  const { productId } = await params;
  const product = await getProduct(context, productId);
  if (!product) notFound();
  const fields: Array<[string, string]> = [
    ["Manufacturer", product.manufacturer], ["Model", product.model], ["SKU", product.sku],
    ["Manufacturer part number", show(product.manufacturerPartNumber)], ["Barcode", show(product.barcode)],
    ["Category", categoryLabel(product.category)], ["Tracking", product.trackingMode === "serialized" ? "Serial tracked" : "Quantity tracked"],
    ["Reference purchase cost (USD)", product.referencePurchaseCostCents === null ? "Not provided" : usd.format(product.referencePurchaseCostCents / 100)],
    ["Reference sale price (USD)", product.referenceSalePriceCents === null ? "Not provided" : usd.format(product.referenceSalePriceCents / 100)],
    ["Low-stock threshold", show(product.lowStockThreshold)],
    ["Supplier warranty", product.supplierWarrantyMonths === null ? "Not provided" : `${product.supplierWarrantyMonths} months`],
    ["Customer warranty", product.customerWarrantyMonths === null ? "Not provided" : `${product.customerWarrantyMonths} months`],
    ["Specifications", show(product.specifications)], ["Notes", show(product.notes)],
  ];
  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button nativeButton={false} render={<Link href={product.archivedAt ? "/inventory?archived=true" : "/inventory"} />} variant="ghost" className="-ml-3 min-h-11">← Inventory</Button>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{product.archivedAt ? "Archived part" : "Catalog part"}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{product.manufacturer} {product.model}</p>
        </div>
        {!product.archivedAt ? <div className="flex flex-wrap gap-2"><Button nativeButton={false} render={<Link href={`/inventory/${product.id}/edit`} />} variant="outline" className="min-h-11">Edit part</Button><ArchiveProductButton productId={product.id} /></div> : null}
      </header>
      <section aria-labelledby="stock-heading" className="rounded-xl border bg-accent/40 p-5">
        <h2 id="stock-heading" className="font-heading text-lg font-semibold">Stock status</h2>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {[["On hand", 0], ["Reserved", 0], ["Available", 0]].map(([label, amount]) => <div key={label} className="rounded-lg border bg-card p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-2xl font-semibold">{amount}</dd></div>)}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Catalog setup does not record stock. Opening stock is a separate workflow.</p>
      </section>
      <section className="rounded-xl border bg-card p-5 sm:p-7">
        <h2 className="font-heading text-lg font-semibold">Part details</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm">{value}</dd></div>)}</dl>
      </section>
    </article>
  );
}
