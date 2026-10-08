"use client";

import { toast } from "sonner";
import { useActionState } from "react";
import { Archive, ArchiveRestore, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { archiveProductAction, restoreProductAction } from "@/features/catalog/actions";
import type { SaveResult } from "@/features/catalog/types";

function ArchiveRestoreButton({ productId, restore = false }: { productId: string; restore?: boolean }) {
  const action = (restore ? restoreProductAction : archiveProductAction).bind(null, productId);
  const [state, formAction, pending] = useActionState<SaveResult | null, FormData>(async (previous, data) => { const result = await action(previous, data); if (result.ok) toast.success(result.message); return result; }, null);

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={formAction}>
        <Button type="submit" variant={restore ? "outline" : "destructive"} className="min-h-11 gap-2" disabled={pending}>
          {pending
            ? <LoaderCircle aria-hidden="true" data-icon="inline-start" className="animate-spin" />
            : restore ? <ArchiveRestore aria-hidden="true" data-icon="inline-start" /> : <Archive aria-hidden="true" data-icon="inline-start" />}
          {pending ? restore ? "Restoring…" : "Archiving…" : restore ? "Restore part" : "Archive part"}
        </Button>
      </form>
      {state && !state.ok ? <Alert variant="destructive"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
      {state?.ok ? <Alert variant="success" role="status"><AlertDescription>{state.message}</AlertDescription></Alert> : null}
    </div>
  );
}

export function ArchiveProductButton({ productId }: { productId: string }) { return <ArchiveRestoreButton productId={productId} />; }
export function RestoreProductButton({ productId }: { productId: string }) { return <ArchiveRestoreButton productId={productId} restore />; }
