import { ProductDetailScreen } from "@/features/catalog/components/product-detail-screen";
export default function Page(props: { params: Promise<{ productId: string }> }) { return <ProductDetailScreen {...props} />; }
