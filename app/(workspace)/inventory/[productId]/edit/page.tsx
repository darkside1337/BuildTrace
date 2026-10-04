import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/features/catalog/product-form";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/features/catalog/queries";
import { requirePageShopContext } from "@/lib/auth/page-access";

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const context = await requirePageShopContext();
  const { productId } = await params;
  const product = await getProduct(context, productId);
  if (!product) notFound();
  if (product.archivedAt) redirect(`/inventory/${productId}`);
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Button nativeButton={false} render={<Link href={`/inventory/${productId}`} />} variant="ghost" className="-ml-3 min-h-11">← Part details</Button>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Catalog update</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Edit {product.name}</h1>
      </header>
      <div className="rounded-xl border bg-card p-5 sm:p-7"><ProductForm mode="edit" product={product} /></div>
    </section>
  );
}
