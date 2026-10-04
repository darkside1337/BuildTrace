import { AlertCircle, CheckCircle2, Database, LoaderCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import type { DatabaseStatus } from "@/lib/db";

type Status = DatabaseStatus | "checking";

export function DatabaseStatusCard({ status }: { status: Status }) {
  if (status === "checking") {
    return (
      <section
        aria-labelledby="database-status-title"
        aria-live="polite"
        className="flex min-h-36 items-start gap-4 rounded-lg border bg-card p-5 sm:p-6"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Database check
          </p>
          <h2 id="database-status-title" className="mt-1 text-lg font-semibold">
            Checking the connection…
          </h2>
        </div>
      </section>
    );
  }

  if (status === "connected") {
    return (
      <section
        aria-labelledby="database-status-title"
        aria-live="polite"
        className="flex min-h-36 items-start gap-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
          <CheckCircle2 aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-emerald-900 uppercase">
            Database check
          </p>
          <h2 id="database-status-title" className="mt-1 text-lg font-semibold">
            Connected to Neon
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-emerald-950/80">
            BuildTrace can reach your database. The local connection is ready.
          </p>
        </div>
      </section>
    );
  }

  if (status === "setup_required") {
    return (
      <Alert
        variant="default"
        className="min-h-36 gap-3 border-amber-300 bg-amber-50/70 p-5 text-amber-950 sm:p-6"
      >
        <Database aria-hidden="true" />
        <AlertTitle className="text-base font-semibold">
          <h2>Connection details need setup</h2>
        </AlertTitle>
        <AlertDescription className="text-sm text-amber-950/80">
          Add both DATABASE_URL and DATABASE_URL_UNPOOLED to your local .env
          file. Use the pooled Neon URL for DATABASE_URL and its direct URL for
          DATABASE_URL_UNPOOLED, then restart pnpm dev.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      variant="destructive"
      className="min-h-36 gap-3 border-red-300 bg-red-50/70 p-5 sm:p-6"
    >
      <AlertCircle aria-hidden="true" />
      <AlertTitle className="text-base font-semibold">
        <h2>Couldn’t reach your database</h2>
      </AlertTitle>
      <AlertDescription>
        Check that your Neon database is available and both URLs in .env point
        to the same database. Then check the connection again. Technical
        connection details are hidden to protect your credentials.
      </AlertDescription>
    </Alert>
  );
}
