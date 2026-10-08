import { EditProductScreen } from "@/features/catalog/components/edit-product-screen";
import { RoutePanel } from "@/features/catalog/components/route-panel";
export default function Panel(props: { params: Promise<{ productId: string }> }) {
  return <RoutePanel title="Edit part" form><EditProductScreen {...props} panel /></RoutePanel>;
}
