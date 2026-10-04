"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
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
        return;
      }
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setPending(false);
      setError("Sign-out did not complete. Please retry.");
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11"
        disabled={pending}
        onClick={() => void signOut()}
      >
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      {error ? <p role="alert" className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
