# BuildTrace

BuildTrace is a portfolio app for independent PC parts shops, tracing components from receiving through custom builds and warranty lookup. Phase 01 adds OAuth-only shop access and a scoped catalog for creating, finding, editing, and archiving parts. Creating a catalog part does not create stock.

The [target application map](./docs/APPLICATION_MAP.md) shows the intended MVP navigation, screens, and connected journeys. It is a target, not a description of the current app or a final route specification; [the roadmap](./docs/ROADMAP.md) tracks delivery.

`docs/PRD.md` is the product authority. Root [`PRODUCT.md`](./PRODUCT.md) is retained Impeccable-derived product context alongside [`DESIGN.md`](./DESIGN.md). Design research and verification artifacts in `reports/` are retained evidence; `.impeccable/` keeps durable configuration and briefs while generated runtime state is ignored.

## Design and current screens

The approved direction is **Trace / Ledger**: warm paper surfaces, dark ink, restrained blue actions, fine rules, Newsreader headings, DM Sans interface text, and IBM Plex Mono technical identifiers. The Trace raster mark lives in `public/brand/`; use Lucide React for interface and category icons. The catalog remains backed by saved shop records, and creating a product does not create stock. See [DESIGN.md](./DESIGN.md) for tokens and responsive rules. CSV import is deferred until its roadmap phase is implemented.

[DESIGN.md](./DESIGN.md) owns visual guidance. Edit shared semantic tokens in `app/globals.css`, shared shadcn/ui primitives backed by Base UI in `components/ui/`, and route frames in `app/(workspace)/layout.tsx`, `app/page.tsx`, and `app/sign-in/page.tsx`; workspace controls in `features/workspace/components/workspace-menu.tsx`; and shared page headers in `components/page-header.tsx`. Feature-specific UI lives in each feature's `components/` directory, while its actions, queries, mutations, schemas, and types remain at the feature root. Use Tailwind semantic utilities, 44px minimum touch targets, and 16px field text on phones. Keep prototype-only import and stock controls out of production behavior.

## Requirements

- Node.js 24
- pnpm 12.6.0
- One Neon PostgreSQL database for local development and tests

## Local setup

Install packages and create a local environment file:

```sh
pnpm install
cp .env.example .env.local
```

In Neon, open **Connect** for your database and copy its pooled URL into `DATABASE_URL`. Turn connection pooling off in the Connect dialog and copy that direct URL into `DATABASE_URL_UNPOOLED`. Both URLs must point to the same database and role. Keep your environment file private; `.env*` files are ignored by Git. The matching pair is required for both `pnpm db:generate` and `pnpm db:migrate`.

If you already have a `.env` file, add or update these two variables there instead of copying over it. Next.js loads `.env.local` ahead of `.env`.

Apply versioned migrations and start the app:

```sh
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The entry screen reports whether the app can reach Neon. If connection settings change, restart `pnpm dev` and select **Check connection again**.

Configure Better Auth and both OAuth applications in `.env` or `.env.local`. Register `http://localhost:3000/api/auth/callback/github` and `http://localhost:3000/api/auth/callback/google` as the local provider callback URLs. Set `BETTER_AUTH_URL` to `http://localhost:3000`, use a random `BETTER_AUTH_SECRET` with at least 32 characters, and keep all provider credentials server-side.

After applying migrations, provision only the intended Owner identities. Obtain the stable numeric GitHub account ID and Google `sub` for the Owner, then run:

```sh
pnpm bootstrap:owner -- --shop-name "Example PC Shop" \
  --github-id "<GitHub numeric account ID>" --google-id "<Google sub>"
```

The command can be rerun with the same identities. It creates no public sign-up route and grants no access based on email alone. Then open `/sign-in` and choose GitHub or Google.

`pnpm dev` and `pnpm build` use Next.js's default Turbopack bundler. The regular connection-state browser checks start isolated Webpack development servers; the Ledger browser checks run against a production `next start` server after `pnpm build`.

The versioned migrations include Better Auth, shop membership, and catalog tables. Generate future migrations after changing the Drizzle schema with `pnpm db:generate`, review the SQL, then apply them with `pnpm db:migrate`.

## Checks

Run database-read-only local checks without applying migrations or writing database fixtures (build and test artifacts may be written locally):

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm test:unit
```

Database and browser verification requires the configured shared Neon database:

```sh
pnpm test:integration
pnpm test:e2e:install
pnpm test:e2e
```

`pnpm test:integration` applies migrations and writes temporary fixtures inside transactions against the shared database, then rolls those fixtures back. It is not read-only. It does not reset or truncate the database. The browser suite starts local servers on ports 3333–3335: one uses the configured Neon URL, one simulates missing configuration, and one uses a reserved invalid domain to simulate connection failure.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon URL for application connections; hostname includes `-pooler`. |
| `DATABASE_URL_UNPOOLED` | Direct Neon URL for migrations; same database, without `-pooler`. |
| `BETTER_AUTH_URL` | Public app origin used by Better Auth, such as `http://localhost:3000`. |
| `BETTER_AUTH_SECRET` | Server-only random secret of at least 32 characters. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Server-side GitHub OAuth app credentials. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Server-side Google OAuth app credentials. |

The app validates that both database URLs use PostgreSQL and identify the same Neon database and role. Missing or mismatched database configuration shows setup guidance without returning credentials or raw driver errors.

## CI

The GitHub Actions workflow runs lint, type checking, build, unit tests, migration/integration checks, and browser checks. Configure `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, and both provider credential pairs as repository secrets. Neon checks share the development database and are serialized; tests must not reset or truncate shared data.

### Ledger workflow verification

Run `pnpm build` followed by `pnpm test:e2e:ledger` to test the production build on port 3336. The tests use Better Auth’s test-only session utilities and uniquely owned Neon fixtures; they clean up only their own rows and run one worker at a time. Configure the documented database and auth environment first. No production authentication bypass is installed.
