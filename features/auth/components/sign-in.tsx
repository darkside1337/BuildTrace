"use client";

import { useState } from "react";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
        callbackURL: "/inventory",
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
        variant="outline"
        className="min-h-11 justify-center gap-2 bg-card text-foreground"
        disabled={pendingProvider !== null}
        onClick={() => void signIn("github")}
      >
        {pendingProvider === "github" ? <LoaderCircle aria-hidden="true" data-icon="inline-start" className="animate-spin" /> : <ProviderIcon provider="github" />}
        {pendingProvider === "github" ? "Opening GitHub…" : "Continue with GitHub"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 justify-center gap-2"
        disabled={pendingProvider !== null}
        onClick={() => void signIn("google")}
      >
        {pendingProvider === "google" ? <LoaderCircle aria-hidden="true" data-icon="inline-start" className="animate-spin" /> : <ProviderIcon provider="google" />}
        {pendingProvider === "google" ? "Opening Google…" : "Continue with Google"}
      </Button>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
    </div>
  );
}

function ProviderIcon({ provider }: { provider: "github" | "google" }) {
  return (
    <Image
      src={provider === "github" ? "/brand/github-mark.png" : "/brand/google-g-logo.png"}
      alt=""
      aria-hidden="true"
      data-icon="inline-start"
      width={20}
      height={20}
      className="size-5"
    />
  );
}
