import { AlertCircle, CheckCircle2, Database, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DatabaseStatus } from "@/lib/db";

type Status = DatabaseStatus | "checking";

export function DatabaseStatusCard({ status }: { status: Status }) {
  const content = {
    checking: { title: "Checking the connection…", message: "Checking whether the local workspace can reach Neon.", icon: LoaderCircle, variant: "default" },
    connected: { title: "Connected to Neon", message: "BuildTrace can reach your database. The local connection is ready.", icon: CheckCircle2, variant: "success" },
    setup_required: { title: "Connection details need setup", message: "Add both DATABASE_URL and DATABASE_URL_UNPOOLED to your local .env file. Use the pooled Neon URL for DATABASE_URL and its direct URL for DATABASE_URL_UNPOOLED, then restart pnpm dev.", icon: Database, variant: "warning" },
    unavailable: { title: "Couldn’t reach your database", message: "Check that your Neon database is available and both URLs in .env point to the same database. Then check the connection again. Technical connection details are hidden to protect your credentials.", icon: AlertCircle, variant: "destructive" },
  } as const;
  const item = content[status];
  const Icon = item.icon;
  return <Alert variant={item.variant} role={status === "unavailable" || status === "setup_required" ? "alert" : "status"} aria-labelledby="database-status-title" aria-live="polite" className="min-h-28">
    <Icon aria-hidden="true" className={status === "checking" ? "animate-spin" : undefined} />
    <AlertTitle><h2 id="database-status-title" className="text-lg font-semibold">{item.title}</h2></AlertTitle>
    <AlertDescription>{item.message}</AlertDescription>
  </Alert>;
}
