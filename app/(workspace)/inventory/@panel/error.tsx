"use client";
import { RoutePanel } from "@/features/catalog/components/route-panel";
import InventoryError from "@/app/(workspace)/inventory/error";
export default function PanelError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <RoutePanel title="Catalog unavailable"><InventoryError {...props} /></RoutePanel>;
}
