import type { ReactNode } from "react";
export default function CatalogLayout({ children, panel }: { children: ReactNode; panel: ReactNode }) { return <>{children}{panel}</>; }
