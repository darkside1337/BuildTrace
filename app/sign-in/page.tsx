import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInOptions } from "@/features/auth/sign-in";
import { AppShell } from "@/components/app-shell";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SignInPage() {
  let signedIn = false;
  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    signedIn = Boolean(session);
  } catch { /* Keep sign-in available when auth is misconfigured. */ }
  if (signedIn) redirect("/inventory");

  return (
    <AppShell showConnectionRefresh={false}>
      <main className="mx-auto w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">BuildTrace account</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Sign in to your shop</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only identities provisioned for a BuildTrace shop can continue.</p>
        <div className="mt-7"><SignInOptions /></div>
        <p className="mt-6 text-sm text-muted-foreground">
          Need the connection setup screen? <Link className="font-medium text-foreground underline underline-offset-4" href="/">Open home</Link>.
        </p>
      </main>
    </AppShell>
  );
}
