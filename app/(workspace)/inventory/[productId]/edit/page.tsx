import { EditProductScreen } from "@/features/catalog/components/edit-product-screen";
export default function Page(props: { params: Promise<{ productId: string }> }) { return <EditProductScreen {...props} />; }
