# BuildTrace Architecture

**Status:** Phase 00 foundation and Phase 01 catalog/auth implementation in progress; later product phases remain planned
**Last updated:** October 4, 2026
**Product requirements:** [PRD.md](./PRD.md)

This document describes the target system for the portfolio MVP and identifies what exists in the repository today. The [PRD](./PRD.md) defines product behavior and acceptance criteria; this document defines component boundaries, data flow, and the rules that implementation must preserve. The implemented foundation uses **Next.js, Neon, Drizzle, shadcn/ui with Base UI primitives, and Zod**. Better Auth and Netlify deployment remain planned.

## 1. Project structure and boundaries

### Current repository

```text
buildtrace/
├── app/
│   ├── page.tsx            # Request-time database status entry screen
│   ├── layout.tsx          # Root layout and BuildTrace metadata
│   └── globals.css         # Tailwind and design tokens
├── components/
│   ├── app-shell.tsx       # Base UI responsive sidebar and mobile navigation
│   └── ui/                 # Base UI-backed shadcn primitives and Sonner toaster
├── lib/
│   ├── actions/results.ts  # Shared serializable Server Action result type
│   └── db/                 # Server-only Neon pool, status check, and schema
├── tests/                  # Unit, Postgres integration, and browser checks
├── drizzle.config.ts       # Direct-URL migration configuration
├── playwright.config.ts    # Browser projects and isolated app servers
├── vitest.config.mts       # Unit and integration test configuration
├── .env.example            # Required local environment variables
├── README.md               # Setup and verification commands
├── docs/
│   ├── PRD.md              # Product requirements
│   └── ARCHITECTURE.md     # Boundaries and current implementation (this document)
├── package.json            # App dependencies and pnpm scripts
├── pnpm-lock.yaml          # pnpm dependency lockfile
├── tsconfig.json           # Strict TypeScript, @/* alias
├── next.config.ts          # Default Next.js configuration
└── AGENTS.md               # Repository-specific agent rules
```

This is one Next.js App Router project. The home route reports server-side Neon connectivity and provides the only working navigation destination. Drizzle migration tooling, the server-only database adapter, shared-environment validation, a Base UI component foundation, and unit/integration/browser test tooling are implemented. The Drizzle schema is intentionally empty: no business tables, authentication flow, product operations, Netlify configuration, or CI workflow exist yet. Planned feature layers below remain architectural responsibilities, not claims about existing directories.

### Planned boundaries

- **Routes compose features:** Pages, layouts, and route handlers in `app/` handle routing, parameters, metadata, and HTTP concerns. They render feature components or call feature operations; they do not contain stock rules or inline Drizzle queries.
- **Actions are thin entry points owned by features:** Put Server Actions in `features/<feature>/actions.ts`, with a file-level `"use server"` directive. They resolve the trusted actor/shop context, validate request shape, call a feature operation, and return an `ActionResult<T>` from `lib/actions/results.ts`; they also handle UI concerns such as revalidation. Every action rechecks access even when its page already checked it. Keep actions with their forms so multiple routes can reuse them without feature components importing from `app/` or requiring actions passed through route props. Do not add duplicate forwarding `app/.../actions.ts` files. Route handlers remain in `app/` where an HTTP endpoint is needed and follow the same validation, access-check, and delegation rules.
- **Server Action results have one serializable shape:** `ActionResult<T>` is a discriminated union: success contains `data`; failure contains a safe user-facing `error.message`, optional stable `error.code`, and optional `fieldErrors: Record<string, string[]>`. Return expected, recoverable outcomes (including Zod validation errors mapped from `flatten().fieldErrors`) instead of throwing them. Only return data that React can serialize across the Server Action boundary; map dates, bigints, class instances, and database rows to explicit DTOs as needed. Never return `Error` objects or internal exception/database details.
- **Handle unexpected action failures safely:** Log unexpected exceptions on the server and return a generic failure message to the action caller; do not expose exception details. If a catch can intercept Next.js control flow, call `unstable_rethrow(error)` at the top of the catch block or structure the code so `redirect()` and `notFound()` run outside the catch. Do not turn page or data-loading failures into action results: let them reach the route's `error.tsx` boundary, and use `not-found.tsx` for missing route resources.
- **Keep action feedback in the client UI:** Mount the shadcn Sonner `<Toaster />` once in the root layout. The client component that invokes an action owns transient action-wide `toast.success()` / `toast.error()` feedback. Render field errors beside their inputs; do not rely on a disappearing toast for field validation. For consequential operations such as posting a receipt or correcting stock, also show a persistent result/status in the workflow.
- **Features own product behavior:** Planned modules such as `features/catalog`, `features/receiving`, `features/inventory`, `features/builds`, and `features/warranty` hold their forms, Server Actions, domain validation, read operations, and write operations. Internal server-only `queries.ts` and `mutations.ts` are useful conventions, not mandatory filenames for every operation. Product rules and database operations belong in those internal operations, separate from the thin Server Action entry points.
- **Inventory owns stock writes:** Receiving and build features may orchestrate their workflows, but they must use the inventory operation that owns reservations, receipt allocation, balances, and movement records. A cross-feature stock change has one transaction owner; separate modules must not independently patch stock in the same workflow.
- **Shared infrastructure stays in `lib/`:** Better Auth/session resolution in `lib/auth/`, the Drizzle client and schema in `lib/db/`, and trusted shop-context resolution in shared server-only code. There is no Supabase Storage helper in this MVP. Netlify hosts the app; Neon persists data.

Illustrative receiving layout:

```text
app/(dashboard)/receiving/page.tsx  # Composes the receiving feature
features/receiving/
├── actions.ts                     # Thin Server Action entry points
├── components/                    # Forms and other feature UI
├── queries.ts                     # Internal server-only reads
├── mutations.ts                   # Internal server-only receiving operations
└── schemas.ts                     # Feature validation
features/inventory/mutations.ts    # Owns stock changes and their transaction
```

The current layout follows this dependency direction: routes compose features; client UI calls feature Server Actions; actions and route handlers call internal feature operations. Server Components may call server-only read operations directly. Operations use domain rules and server-only data access; features do not import from `app/`, and data access does not import UI. Shared `lib/db/` establishes the connection and schema, while shop data queries and mutations live with the owning feature. Authentication adapters and migrations are explicit exceptions to the feature-query convention.

## 2. System diagram

Planned flow, based on the approved stack and [PRD](./PRD.md):

```text
 [Staff browser]             [Demo visitor browser]
       │                              │
       └──────── HTTPS ───────────────┘
                      │
             [Netlify-hosted Next.js app]
               │        │          │
       [App Router UI]  │   [Better Auth sessions / guest access]
                        │          │
              [Server-side application operations]
                        │
             [Domain checks + Drizzle transactions]
                        │
                [Neon PostgreSQL]
          ┌─────────────┼──────────────────┐
    [Shop records] [Stock movements] [Demo shop copies]
```

All product writes pass through the Next.js server. The browser never connects directly to Postgres. A trusted server-side resolver establishes the active shop, actor, and role from a staff session or guest demo context. Every shop-owned read and write accepts that context and scopes its database access accordingly; a `shopId` supplied by the browser cannot grant access. A catalog CSV import can create product records after validation; a receiving CSV import fills a draft receipt and changes no stock until staff explicitly posts it. Demo visitors operate on private copies of the seed shop, using the same business rules as staff workflows.

## 3. Core components and request lifecycles

| Component | Planned responsibility | Technology and deployment |
|---|---|---|
| Web application | Responsive entry/setup, OAuth sign-in, and Phase 01 inventory/catalog; later phases add Overview, Receiving, Builds, Customers, Suppliers, Warranty lookup, Settings, and demo | Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui with Base UI primitives; Netlify |
| Route entry points | Pages and layouts compose features; route handlers translate HTTP requests into feature calls and narrow responses | Next.js App Router and server runtime; Netlify |
| Feature Server Actions | `features/<feature>/actions.ts` resolves trusted context, checks access, validates input, delegates to internal feature operations, returns `ActionResult<T>`, and handles UI revalidation | Next.js Server Actions; Netlify |
| Feature operations | Validate commands, authorize the trusted actor/shop context, and return current records or actionable errors | Server-only TypeScript and Zod; Netlify |
| Inventory operation | Own all stock-changing transactions, allocation rules, movement records, and balance checks used by receiving, builds, and counts | Server-only TypeScript and Drizzle; Netlify |
| Data access | Scope feature queries by shop, query and update data inside transactions, and apply database constraints and migrations | Drizzle ORM; Neon PostgreSQL |
| Staff authentication | GitHub and Google OAuth sign-in, sign-out, sessions, and Owner/Staff identity; email/password authentication disabled for the MVP | Better Auth within the application |
| Demo access | Issue an isolated guest context, copy seed data, reset that visitor's copy, and prevent access to staff shops | Application server and Postgres; lifecycle mechanism to be specified before public deployment |

### Receiving

Staff selects a supplier, enters lines manually or uploads a CSV, and reviews a draft. Server-side validation matches active shop SKUs, checks quantity and cost, and requires one unique serial for each serialized unit. Uploading or editing the draft makes **no stock movement**. Posting runs one database transaction that revalidates the draft, prevents a second posting of the same receipt, writes received stock and provenance, appends movements, and changes shipment state. A partial delivery posts only the arrived quantity; a later posting receives the remainder. Invalid input or a failed transaction leaves stock unchanged. Posted receipts are corrected through linked, reasoned movements, not silent edits.

### Reserving and delivering a build

The server reloads current availability inside the reservation transaction. It allocates particular serialized units or available quantities from receipt lots, records build allocations, and changes the build state together. Competing reservations cannot both claim the same unit or exceed available quantity. Cancellations release allocations; substitutions replace them atomically or preserve the original allocation. Delivery requires complete allocations plus customer, sale date, and USD sale price. Its transaction removes allocated components from on-hand stock once, ends reservations, appends movements, and stores the historical build/sale snapshot. The sale record does not process payment or calculate tax.

### Counting and lookup

A count starts from a recorded balance/version. Before posting a correction, the server checks for stock changes since that snapshot, active reservations, and the identity of serialized units. Accepted corrections require a reason and append movements. Warranty lookup reads the unit or receipt allocation through supplier, build, customer, and recorded coverage. Missing coverage remains unknown; the app does not infer eligibility or file claims.

### Failure and retry behavior

Each state-changing operation is validated and authorized on the server, then committed atomically. A stable operation identity prevents a browser retry from posting the same receipt or delivery twice. Database constraints and transaction-level concurrency checks protect unique shop serials and allocation limits. If availability has changed, return the current value and a clear retry path rather than applying a stale request. The database is authoritative; UI summaries are derived from committed state.

## 4. Data stores and invariants

**Planned primary store:** Neon PostgreSQL, accessed by Drizzle from the Next.js server. The pooled/direct connection pair and an empty migration baseline are configured; business tables are not yet implemented. One shop and one stock location per workspace are the MVP defaults. Shop-owned records carry shop scope, including demo copies. Feature queries and mutations require an explicit trusted shop context (or its resolved `shopId`) and filter by it; omitting shop scope from a shop-owned operation is a correctness and security bug. The context comes from the staff session or demo guest context, never from an unverified browser parameter.

Logical record groups (not table names or a finalized schema):

| Group | Purpose |
|---|---|
| Shop, membership, and session | Shop identity, timezone, Owner/Staff access, guest demo context |
| Product and supplier | Catalog model, tracking mode, identifiers, supplier contact |
| Shipment and receipt | Expected and arrived lines, costs, supplier reference, receipt status |
| Serialized unit and quantity receipt lot | Physical-unit or receipt-quantity provenance and acquisition cost |
| Stock movement and reservation | Auditable balance changes, held stock, related operation and actor |
| Customer and build | Customer record, component allocations, lifecycle, delivery and sale snapshot |
| Warranty record | Recorded supplier/manufacturer and shop/customer coverage, with unknown values retained |
| Demo seed and copy | Fictional baseline and per-visitor writable records |

Catalog creation adds **zero** stock. On hand includes reservations; available equals on hand minus reserved and cannot become negative. A serialized unit has a unique serial within its shop, compared case-insensitively after trimming; its recorded value remains available for display. One unit cannot be reserved by two active builds. Quantity allocation retains receipt provenance and purchase cost; earliest available receipt quantities are the proposed default. Quantity records do not claim individual physical identity.

Movement history is append-only: receiving, opening stock, adjustment, and delivery record their causes, actor, and time. Corrections add linked movements rather than rewriting past postings. Historical costs and delivered-build sale details survive catalog edits. A product cannot change tracking mode while stock or reservations remain. All money is recorded consistently to USD cents. These invariants follow [PRD sections 6–7](./PRD.md#6-functional-requirements).

No object store, cache, search service, or analytics warehouse is required for the MVP. CSV files are parsed for catalog or receipt entry; the PRD does not require retaining uploaded files. Importing a receipt CSV does not bypass draft review or posting.

## 5. External integrations

| Service | Role | Planned integration |
|---|---|---|
| Neon | Hosted PostgreSQL | Server-only database connection used through Drizzle |
| Netlify | Next.js hosting | Build and deployment, server-side execution, environment configuration and runtime logs |
| GitHub and Google | OAuth identity providers for Owner and Staff sign-in | Better Auth provider configuration and OAuth callbacks; shop membership is checked separately |

Better Auth, Drizzle, Zod, and shadcn/ui are application dependencies, not separate hosted services. Google Stitch and MondayPOS may inform design work but are not runtime dependencies. There are no planned supplier APIs, POS/payment providers, accounting services, Sanity CMS, or external warranty APIs in the MVP.

## 6. Deployment and operations

**Target:** Deploy the Next.js application to Netlify and connect it to Neon Postgres. Netlify documents App Router, server rendering, route handlers, and Server Actions support for Next.js; the implementation should verify the installed Next.js version against the current Netlify adapter when deployment is configured. Database credentials, Better Auth secrets, and GitHub/Google OAuth client secrets belong in server-side environment settings. Configure both providers and their callback URLs for development and deployment.

**Environment policy:** Before deployment, development and automated tests share one Neon database by user choice. `DATABASE_URL` is its pooled application connection; `DATABASE_URL_UNPOOLED` is its direct migration connection. Both URLs must be configured as a matching database/role pair for migration generation and application. No separate test database or test URL is required now. Tests use temporary transaction fixtures and rollback; database suites run serially except for deliberate concurrency scenarios. Routine tests never reset, truncate, or drop the shared application schema. Before Phase 18, decide and document how development and tests access data once this shared database serves the deployed app; do not assume a second database or permit routine test writes against deployed records. The one-time reset before first deployment is a future explicit, controlled deployment-preparation step followed by migration replay and fictional seed, not a routine operation.

The versioned Drizzle schema contains Better Auth tables, shops, provider-ID memberships, and shop-scoped catalog products. Owner bootstrap is an explicit repeatable command; it is not public or invoked by a request. Review generated migrations and preserve unrelated data in the shared database. Migrations run as a controlled deployment step, not on every request. Public demo provisioning, reset, expiry, and storage limits must be verified before publishing; reset may affect only its visitor's shop copy. Application logs should identify operation failures and conflicts without recording customer contact details, raw serial lists, credentials, or CSV contents. Provide health/error visibility for database connectivity and failed stock mutations.

The GitHub repository is [darkside1337/BuildTrace](https://github.com/darkside1337/BuildTrace), configured locally as `origin`.

## 7. Security and access

- **Staff authentication:** Better Auth uses GitHub and Google OAuth only and resolves sessions for Owners and Staff. Email/password authentication and its registration, password-reset, and app-managed email-verification flows are outside the MVP scope; possible v2 support remains uncommitted in the PRD. Public signup stays closed, and a successful OAuth callback does not itself grant shop membership. Owner manages shop settings and staff; Staff performs daily catalog, receiving, inventory, build, customer, supplier, and lookup work. Stock corrections remain attributable to an actor. Protected pages check access before rendering data, and each Server Action, route handler, and underlying operation enforces the required role and resource ownership again.
- **Shop isolation:** Every read and mutation is scoped to the resolved shop. A user cannot gain another shop's records by changing an ID in a request. Database constraints support shop-scoped uniqueness and ownership.
- **Demo isolation:** A visitor receives a guest context tied to a private, writable copy of fictional seed data. Reset and cleanup are limited to that copy. Guest access cannot manage real staff, open another demo, or reach production shop records.
- **Input and secrets:** Zod validates untrusted form and CSV data on the server. File size and row limits, content validation, and request throttling should protect public import and demo creation endpoints. Credentials stay server-side. Use HTTPS and secure session cookies in deployment.
- **Auditability:** Mutations persist the actor and shop resolved by the server, plus cause and time. Failed authorization attempts and stock conflicts should be observable without logging customer contacts, raw serial lists, credentials, or CSV contents.

Do not treat disabled UI controls as authorization. The server must reject forbidden direct requests. Public demo access needs explicit abuse limits before launch.

## 8. Development and testing

**Implemented tooling:** pnpm, strict TypeScript, ESLint, Vitest, Playwright, Drizzle Kit, and Base UI-backed shadcn components. Scripts cover development, builds, migration generation/application, unit tests, database smoke checks, and browser checks for connected, setup-required, and unavailable states. Database smoke checks run against the shared configured database without destructive cleanup. No CI workflow exists. `AGENTS.md` requires consulting the installed Next.js documentation before writing Next.js code because this version differs from older conventions.

**Planned test seams:** Domain rules can be tested independently; application operations need integration tests against Postgres transactions; user journeys need browser tests for the responsive demo. For every protected operation, test direct signed-out, cross-shop, and insufficient-role requests alongside permitted access. Verify persisted actors for mutations. Every schema-changing phase needs reviewed versioned migrations, constraint checks, and a non-destructive upgrade check preserving unrelated shared-database records. Priority scenarios are partial and repeated receipt posting, malformed CSV imports, duplicate serials, concurrent reservations, quantity-lot allocation, stale counts, substitution/cancellation, delivery retry, staff-role denial, and cross-demo isolation. Run lint, type checking, build, and the relevant tests in CI once configured. The [PRD release criteria](./PRD.md#12-release-acceptance) remain the acceptance checklist.

## 9. Deferred architecture

The MVP excludes repairs and RMA processing; POS, payments, taxes, and accounting; live supplier feeds; compatibility checks; multiple stock locations; offline synchronization; and PDF or image extraction for receiving. These capabilities would introduce new domain states or integrations and must not be implied by the initial inventory model or UI. Revisit the component boundaries and data model when one of them enters scope. See [PRD section 4.2](./PRD.md#42-deferred).

## 10. Project identification

| Item | Value |
|---|---|
| Project | BuildTrace (`buildtrace` in `package.json`) |
| Product purpose | Portfolio demonstration of PC parts provenance from receiving through build and warranty lookup |
| Repository URL | https://github.com/darkside1337/BuildTrace |
| Primary maintainer | Not specified in repository metadata |
| Document updated | October 4, 2026 |

## 11. Glossary

| Term | Meaning in BuildTrace |
|---|---|
| Product | A catalog model; creating one does not create stock. |
| Serialized unit | One physical component with a shop-unique serial and its own receipt and lifecycle. |
| Quantity stock | Interchangeable components tracked by quantity and receipt provenance without individual serial identity. |
| Receipt lot | The quantity from one posted receipt line, retaining its supplier and purchase cost. |
| On hand | Stock physically held by the shop, including reserved stock. |
| Reserved | On-hand stock allocated to an active build but not yet delivered. |
| Available | On hand minus reserved; the amount eligible for a new allocation. |
| Movement | An auditable stock change with a cause, actor, time, and related record. |
| Build | A customer's PC assembly record with component allocations and a state from Draft through Delivered or Canceled. |
| Demo shop copy | A guest visitor's isolated, resettable copy of the fictional seed shop. |
