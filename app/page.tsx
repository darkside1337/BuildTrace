import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRight, Barcode, Package, ScanLine } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ConnectionRefreshButton } from "@/components/connection-refresh-button";
import { DatabaseStatusCard } from "@/components/database-status-card";
import { ButtonLink } from "@/components/button-link";
import { checkDatabaseStatus } from "@/lib/db";

async function ConnectionStatus() {
  await connection();
  return <DatabaseStatusCard status={await checkDatabaseStatus()} />;
}

export default function Home() {
  return <div className="min-h-dvh bg-background">
    <a href="#home-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-card focus:p-3">Skip to content</a>
    <header className="flex min-h-20 items-center justify-between gap-4 border-b-2 border-primary bg-card px-4 md:px-8 xl:px-12">
      <Link href="/" className="inline-flex min-h-11 shrink-0 items-center"><Brand className="h-auto w-[150px] md:w-[160px]" /></Link>
      <ButtonLink href="/sign-in" variant="outline">Sign in</ButtonLink>
    </header>
    <main id="home-content" tabIndex={-1} className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-7 px-4 py-7 outline-none md:px-8 md:py-10 xl:px-12">
    <section className="grid gap-10 border bg-card p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:p-10" aria-labelledby="welcome-title">
      <div className="flex flex-col items-start justify-center gap-6">
        <h1 id="welcome-title" className="max-w-xl font-heading text-[35px] font-normal leading-[1.08] tracking-[-0.03em] sm:text-[43px]">A clear starting point for every PC part.</h1>
        <p className="max-w-lg text-base text-muted-foreground">Build your shop’s catalog with the model, identifiers, and tracking rules that make each part easy to find.</p>
        <div className="flex flex-wrap gap-3"><ButtonLink href="/sign-in">Sign in<ArrowRight aria-hidden="true" data-icon="inline-end" /></ButtonLink><ButtonLink href="/inventory" variant="outline">Open Inventory</ButtonLink></div>
        <p className="text-sm text-muted-foreground">Shop access is managed by your Owner.</p>
      </div>
      <div className="border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
        <h2 className="text-xl font-semibold">A part is more than its name.</h2>
        <dl className="mt-5 divide-y">
          {[{ icon: Package, title: "Product identity", text: "Manufacturer, model, category, and specifications." }, { icon: Barcode, title: "Model identifiers", text: "Your shop’s SKU, manufacturer part number, and barcode." }, { icon: ScanLine, title: "Tracking rules", text: "Serial tracking for individual units, or quantities for other parts." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4 py-5 first:pt-0 last:pb-0"><Icon aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" /><div><dt className="font-semibold">{title}</dt><dd className="mt-1 text-sm text-muted-foreground">{text}</dd></div></div>)}
        </dl>
      </div>
    </section>
    <section className="grid gap-5 border-b pb-7 sm:grid-cols-[1fr_1.4fr]" aria-labelledby="catalog-setup-title"><h2 id="catalog-setup-title" className="text-xl font-semibold">Model first. Stock separately.</h2><p className="max-w-2xl text-sm text-muted-foreground">Adding a part defines a product model. It does not add physical units or change stock. Start by creating the catalog records your shop needs.</p></section>
    <section className="flex flex-col gap-3" aria-label="Workspace connection"><h2 className="text-base font-semibold">Workspace connection</h2><Suspense fallback={<DatabaseStatusCard status="checking" />}><ConnectionStatus /></Suspense><ConnectionRefreshButton /></section>
    </main>
  </div>;
}
