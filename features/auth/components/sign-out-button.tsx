"use client";

import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function SignOutButton({ beforeSignOut, menu = false }: { beforeSignOut?: (execute: () => void) => void; menu?: boolean } = {}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setPending(false);
        setError("Sign-out did not complete. Please retry.");
        if (menu) toast.error("Sign-out did not complete. Please retry.");
        return;
      }
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setPending(false);
      setError("Sign-out did not complete. Please retry.");
        if (menu) toast.error("Sign-out did not complete. Please retry.");
    }
  }

  return (
    <div>
      {menu ? <DropdownMenuItem disabled={pending} onClick={() => beforeSignOut ? beforeSignOut(() => { void signOut(); }) : void signOut()}>{pending ? "Signing out…" : "Sign out"}</DropdownMenuItem> : <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11"
        disabled={pending}
        onClick={() => beforeSignOut ? beforeSignOut(() => { void signOut(); }) : void signOut()}
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>}
      {error ? <Alert variant="destructive" className="mt-2"><AlertDescription>{error}</AlertDescription></Alert> : null}
    </div>
  );
}
