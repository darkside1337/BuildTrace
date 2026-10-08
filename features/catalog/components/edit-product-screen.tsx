import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/features/catalog/components/product-form";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/button-link";
import { getProduct } from "@/features/catalog/queries";
import { requirePageShopContext } from "@/lib/auth/page-access";

export async function EditProductScreen({ params, panel = false }: { params: Promise<{ productId: string }>; panel?: boolean }) {
  const context = await requirePageShopContext();
  const { productId } = await params;
  const product = await getProduct(context, productId);
  if (!product) notFound();
  if (product.archivedAt) redirect(`/inventory/${productId}`);
  return <section className="flex min-w-0 flex-col gap-6">{!panel ? <ButtonLink href={`/inventory/${product.id}`} variant="link" className="self-start"><ArrowLeft aria-hidden="true" data-icon="inline-start" />Part details</ButtonLink> : null}<PageHeader title={`Edit ${product.name}`} description="Update the model’s catalog details and defaults." /><ProductForm mode="edit" product={product} panel={panel} /></section>;
}
