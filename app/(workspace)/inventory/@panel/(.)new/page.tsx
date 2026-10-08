import { NewProductScreen } from "@/features/catalog/components/new-product-screen";
import { RoutePanel } from "@/features/catalog/components/route-panel";
export default function Panel(props: { params: Promise<{ productId: string }> }) {
  return <RoutePanel title="Add a part" form><NewProductScreen {...props} panel /></RoutePanel>;
}
