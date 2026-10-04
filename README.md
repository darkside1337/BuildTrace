# BuildTrace

BuildTrace is a portfolio app for independent PC parts shops, tracing components from receiving through custom builds and warranty lookup.

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

The versioned migrations include Better Auth, shop membership, and catalog tables. Generate future migrations after changing the Drizzle schema with `pnpm db:generate`, review the SQL, then apply them with `pnpm db:migrate`.

## Checks

Run database-read-only local checks without applying migrations or writing database fixtures (build and test artifacts may be written locally):

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm test:unit
```

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon URL for application connections; hostname includes `-pooler`. |
| `DATABASE_URL_UNPOOLED` | Direct Neon URL for migrations; same database, without `-pooler`. |

The app validates that both database URLs use PostgreSQL and identify the same Neon database and role. Missing or mismatched database configuration shows setup guidance without returning credentials or raw driver errors.
