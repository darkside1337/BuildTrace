import Link from "next/link";
import { ProductForm } from "@/features/catalog/product-form";
import { Button } from "@/components/ui/button";
import { requirePageShopContext } from "@/lib/auth/page-access";

export default async function NewProductPage() {
  await requirePageShopContext();
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Button nativeButton={false} render={<Link href="/inventory" />} variant="ghost" className="-ml-3 min-h-11">← Inventory</Button>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Catalog setup</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Add a part</h1>
        <p className="mt-2 text-sm text-muted-foreground">Save the product model first. No stock is created here.</p>
      </header>
      <div className="rounded-xl border bg-card p-5 sm:p-7"><ProductForm mode="create" /></div>
    </section>
  );
}
