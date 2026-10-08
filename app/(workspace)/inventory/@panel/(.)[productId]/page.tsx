import { ProductDetailScreen } from "@/features/catalog/components/product-detail-screen";
import { RoutePanel } from "@/features/catalog/components/route-panel";
export default function Panel(props: { params: Promise<{ productId: string }> }) {
  return <RoutePanel title="Part details"><ProductDetailScreen {...props} panel /></RoutePanel>;
}
