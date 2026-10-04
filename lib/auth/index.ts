import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  authAccount,
  authSession,
  authUser,
  authVerification,
  schema,
} from "@/lib/db/schema";
import { requireDatabase } from "@/lib/db";
import { findProvisionedIdentity, userHasOnlyMembership } from "@/lib/auth/access";

export class AuthConfigurationError extends Error {
  constructor() {
    super("Authentication is not configured.");
    this.name = "AuthConfigurationError";
  }
}

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new AuthConfigurationError();
  return value;
}

function createAuth() {
  const githubClientId = requiredEnvironment("GITHUB_CLIENT_ID");
  const githubClientSecret = requiredEnvironment("GITHUB_CLIENT_SECRET");
  const googleClientId = requiredEnvironment("GOOGLE_CLIENT_ID");
  const googleClientSecret = requiredEnvironment("GOOGLE_CLIENT_SECRET");
  const secret = requiredEnvironment("BETTER_AUTH_SECRET");
  if (secret.length < 32) throw new AuthConfigurationError();

  return betterAuth({
    appName: "BuildTrace",
    baseURL: requiredEnvironment("BETTER_AUTH_URL"),
    secret,
    database: drizzleAdapter(requireDatabase(), {
      provider: "pg",
      schema: {
        ...schema,
        user: authUser,
        session: authSession,
        account: authAccount,
        verification: authVerification,
      },
    }),
    emailAndPassword: { enabled: false },
    socialProviders: {
      github: { clientId: githubClientId, clientSecret: githubClientSecret },
      google: { clientId: googleClientId, clientSecret: googleClientSecret },
    },
    account: {
      accountLinking: {
        enabled: true,
        disableImplicitLinking: false,
        trustedProviders: [],
        requireLocalEmailVerified: true,
        allowDifferentEmails: false,
      },
    },
    user: {
      validateUserInfo: async ({ user, source }) => {
        const denied = {
          error: "access_denied",
          errorDescription: "This identity is not authorized for a BuildTrace shop.",
        };
        const oauth = source.oauth;
        if (source.method !== "oauth" || !oauth) return denied;

        const rawId = oauth.providerId === "github"
          ? oauth.profile?.id
          : oauth.providerId === "google"
            ? oauth.profile?.sub
            : undefined;
        if ((typeof rawId !== "string" && typeof rawId !== "number") || !String(rawId)) {
          return denied;
        }

        let membership;
        try {
          membership = await findProvisionedIdentity(oauth.providerId, String(rawId));
        } catch {
          // Fail closed when membership storage is unavailable. Never log provider tokens/profile.
          return denied;
        }
        if (!membership) return denied;

        if (source.action === "link-account") {
          if (user.emailVerified !== true || typeof user.id !== "string") return denied;
          try {
            if (!(await userHasOnlyMembership(user.id, membership.shopId, membership.role))) {
              return denied;
            }
          } catch {
            return denied;
          }
        }
      },
    },
  });
}

type BuildTraceAuth = ReturnType<typeof createAuth>;
declare global {
  var buildTraceAuth: BuildTraceAuth | undefined;
}

export function getAuth(): BuildTraceAuth {
  return (globalThis.buildTraceAuth ??= createAuth());
}
