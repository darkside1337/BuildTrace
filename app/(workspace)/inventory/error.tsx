"use client";

import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";

export default function InventoryError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="flex flex-col gap-6"><PageHeader title="Inventory is unavailable" description="Your catalog could not be loaded." /><div className="flex max-w-2xl flex-col gap-6 border bg-card p-6"><Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>We couldn’t load this view</AlertTitle><AlertDescription>Try again, or return to Home to check the workspace connection.</AlertDescription></Alert><div className="flex flex-wrap gap-3"><Button onClick={() => retry()}>Try again</Button><ButtonLink href="/" variant="outline">Back to Home</ButtonLink></div></div></section>;
}
