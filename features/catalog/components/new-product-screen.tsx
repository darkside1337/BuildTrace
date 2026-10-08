import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/features/catalog/components/product-form";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/button-link";
import { requirePageShopContext } from "@/lib/auth/page-access";

export async function NewProductScreen({ panel = false }: { panel?: boolean } = {}) {
  await requirePageShopContext();
  return <section className="flex min-w-0 flex-col gap-6">{!panel ? <ButtonLink href="/inventory" variant="link" className="self-start"><ArrowLeft aria-hidden="true" data-icon="inline-start" />Parts catalog</ButtonLink> : null}<PageHeader title="Add a part" description="Define a product model for your shop’s catalog." /><ProductForm mode="create" panel={panel} /></section>;
}
