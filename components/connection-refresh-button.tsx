"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectionRefreshButton() {
  const router = useRouter();
  const [refreshing, startRefreshing] = useTransition();

  return <Button variant="outline" className="self-start" disabled={refreshing} onClick={() => startRefreshing(() => router.refresh())} aria-live="polite">
    <RefreshCw aria-hidden="true" data-icon="inline-start" className={refreshing ? "animate-spin" : undefined} />
    {refreshing ? "Checking…" : "Check connection again"}
  </Button>;
}
