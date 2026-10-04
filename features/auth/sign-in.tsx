"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function SignInOptions() {
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<"github" | "google" | null>(null);

  async function signIn(provider: "github" | "google") {
    setError(null);
    setPendingProvider(provider);
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
        errorCallbackURL: "/sign-in",
      });
      if (result.error) {
        setError("This account could not sign in. Check shop access and try again.");
        setPendingProvider(null);
      }
    } catch {
      setError("Sign-in is unavailable. Check the app configuration and try again.");
      setPendingProvider(null);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        type="button"
        variant="default"
        className="min-h-11 justify-center gap-2"
        disabled={pendingProvider !== null}
        onClick={() => void signIn("github")}
      >
        <span aria-hidden="true" data-icon="inline-start" className="text-xs font-bold">GH</span>
        {pendingProvider === "github" ? "Opening GitHub…" : "Continue with GitHub"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 justify-center gap-2"
        disabled={pendingProvider !== null}
        onClick={() => void signIn("google")}
      >
        <span aria-hidden="true" className="font-semibold">G</span>
        {pendingProvider === "google" ? "Opening Google…" : "Continue with Google"}
      </Button>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
