import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { DatabaseStatusCard } from "@/components/database-status-card";
import { Button } from "@/components/ui/button";
import { checkDatabaseStatus } from "@/lib/db";

async function ConnectionStatus() {
  await connection();
  const status = await checkDatabaseStatus();

  return <DatabaseStatusCard status={status} />;
}

export default function Home() {
  return (
    <AppShell>
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Local workspace
          </p>
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.035em] sm:text-4xl">
            Start with a healthy connection.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Check that BuildTrace can reach your Neon database before setting up
            the workspace.
          </p>
        </header>

        <Suspense fallback={<DatabaseStatusCard status="checking" />}>
          <ConnectionStatus />
        </Suspense>

        <section className="grid gap-4 border-t pt-6 sm:grid-cols-2 sm:gap-8">
          <div>
            <p className="text-sm font-semibold">First, connect the workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep the pooled and direct Neon URLs together in your local
              environment file.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Then, sign in to your shop</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with a GitHub or Google identity provisioned for your shop.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3 sm:col-span-2">
            <Button nativeButton={false} render={<Link href="/sign-in" />} className="min-h-11">Sign in</Button>
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          BuildTrace · local development setup
        </p>
      </div>
    </AppShell>
  );
}
