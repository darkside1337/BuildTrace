import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, KeyRound } from "lucide-react";
import { SignInOptions } from "@/features/auth/components/sign-in";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { PageHeader } from "@/components/page-header";
import { ButtonLink } from "@/components/button-link";
import { getAuth } from "@/lib/auth";

export default async function SignInPage() {
  let signedIn = false;
  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    signedIn = Boolean(session);
  } catch { /* Keep sign-in available when auth is misconfigured. */ }
  if (signedIn) redirect("/inventory");
  return <div className="min-h-dvh bg-background">
    <a href="#sign-in-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-card focus:p-3">Skip to content</a>
    <header className="flex min-h-20 items-center border-b-2 border-primary bg-card px-4 md:px-8 xl:px-12">
      <Link href="/" className="inline-flex min-h-11 shrink-0 items-center"><Brand className="h-auto w-[150px] md:w-[160px]" /></Link>
    </header>
    <main id="sign-in-content" tabIndex={-1} className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-7 px-4 py-7 outline-none md:px-8 md:py-10 xl:px-12">
    <section className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-12">
      <div className="flex max-w-xl flex-col gap-7 lg:py-8"><PageHeader title="Sign in to your shop" description="Your parts catalog, organized around the way your shop works." /><div className="flex gap-3 border-t pt-6"><KeyRound aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" /><div><h2 className="text-base font-semibold">An account with shop access</h2><p className="mt-2 text-sm text-muted-foreground">Only identities provisioned for a BuildTrace shop can continue. Use the GitHub or Google account your Owner has authorized.</p></div></div><ButtonLink href="/" variant="link" className="self-start"><ArrowLeft aria-hidden="true" data-icon="inline-start" />Back to Home</ButtonLink></div>
      <div className="flex flex-col gap-6 border bg-card p-6 sm:p-8"><div><h2 className="text-xl font-semibold">Choose your account</h2><p className="mt-2 text-sm text-muted-foreground">Continue with your authorized provider.</p></div><SignInOptions /><p className="border-t pt-5 text-sm text-muted-foreground">Signing in does not automatically grant access to a shop. Contact your Owner if your account has not been added.</p></div>
    </section>
    </main>
  </div>;
}
