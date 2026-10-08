import { RoutePanel } from "@/features/catalog/components/route-panel";
import { Skeleton } from "@/components/ui/skeleton";
export default function PanelLoading() { return <RoutePanel title="Loading part"><div aria-busy="true" className="flex flex-col gap-5"><p role="status">Loading catalog record…</p><Skeleton className="size-28" /><Skeleton className="h-10 w-3/4" />{[1,2,3].map(row => <Skeleton key={row} className="h-24" />)}</div></RoutePanel>; }
