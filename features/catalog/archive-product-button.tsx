"use client";

import { useActionState } from "react";
import { Archive, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { archiveProductAction } from "@/features/catalog/actions";
import type { SaveResult } from "@/features/catalog/types";

export function ArchiveProductButton({ productId }: { productId: string }) {
  const action = archiveProductAction.bind(null, productId);
  const [state, formAction, pending] = useActionState<SaveResult | null, FormData>(action, null);

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={formAction}>
        <Button type="submit" variant="destructive" className="min-h-11 gap-2" disabled={pending}>
          {pending
            ? <LoaderCircle aria-hidden="true" data-icon="inline-start" className="animate-spin" />
            : <Archive aria-hidden="true" data-icon="inline-start" />}
          {pending ? "Archiving…" : "Archive part"}
        </Button>
      </form>
      {state && !state.ok ? <p role="alert" className="text-sm text-destructive">{state.message}</p> : null}
      {state?.ok ? <p role="status" className="text-sm text-emerald-800">{state.message}</p> : null}
    </div>
  );
}
