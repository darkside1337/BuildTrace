import { ButtonLink } from "@/components/button-link";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

export default function PartNotFound() {
  return <Empty className="min-h-80 border bg-card"><EmptyHeader><EmptyTitle><h1>Part not found</h1></EmptyTitle><EmptyDescription>This part is unavailable in your shop. Return to the catalog to find another part.</EmptyDescription></EmptyHeader><EmptyContent><ButtonLink href="/inventory">Back to Inventory</ButtonLink></EmptyContent></Empty>;
}
