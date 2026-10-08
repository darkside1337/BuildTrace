# Trace / Ledger integration verification

Verified locally on October 8, 2026. No deployment or Figma changes were made during implementation.

## Delivered

- Semantic Ledger tokens, local Newsreader / DM Sans / IBM Plex Mono fonts and licenses, approved Trace PNGs, metadata icons, and official static OAuth provider marks.
- Reused existing Base UI-backed shadcn primitives; added official Input Group, Dropdown Menu, and Alert Dialog while preserving customized primitives. Interface/category icons use Lucide React, with no manually coded SVG paths.
- Horizontal workspace navigation, mobile navigation/filter sheets, responsive catalog records, selected rows, manufacturer/category/tracking filters, safe sort fields, and real counts.
- Shared canonical/detail/create/edit content, inventory-scoped intercepted panels, full-page direct links and refresh, focus return, and scroll preservation.
- Complete grouped catalog fields, server validation, duplicate-SKU recovery, in-memory drafts, nested discard confirmation, pending guards, draft clearing, and guarded sign-out.
- Shop-scoped archived-only Restore with server actor metadata. Catalog writes do not add stock. No schema migration or new icon dependency.
- DESIGN, product context, PRD, architecture, README, and local roadmap updated. CSV stays in its later MVP roadmap phases.

## Evidence

| Check | Result |
|---|---|
| ESLint | Passed |
| TypeScript | Passed |
| Production build | Passed with Next.js default Turbopack |
| Unit tests | 17 passed |
| Neon integration | 6 passed; fixtures cleaned |
| Production Ledger browser suite | 20 passed; desktop and mobile |
| Existing browser regressions | 9 passed; 1 expected desktop skip for a mobile-only test |
| Draft history/confirmation repetition | 4 passed, twice per viewport, before final acceptance |
| Responsive screenshots | Inspected at 320, 390, 768, 1440 CSS pixels |

The previous forced webpack build compiled but returned Next.js's manifests-singleton invariant at startup. The same app built with the installed Next.js 16.3.7 default Turbopack served successfully, so `pnpm build` now uses that default. `pnpm test:e2e:ledger` manages a dedicated production server on port 3336.

Authenticated fixtures use Better Auth's official test-only session utilities. They do not install any production login helper or bypass. Database work runs serially and deletes only UUID-addressed rows owned by the fixture. No automatic database resets were used.

## Screenshots

- [Desktop catalog](./desktop-ledger-1440.png)
- [Tablet catalog](./desktop-ledger-768.png)
- [320px catalog](./desktop-ledger-320.png)
- [Phone catalog](./mobile-ledger-390.png)
- [Desktop detail panel](./desktop-ledger-detail.png)
- [Desktop edit panel](./desktop-ledger-form.png)
- [Phone detail panel](./mobile-ledger-detail.png)
- [Phone edit panel](./mobile-ledger-form.png)
- [Desktop sign-in](./desktop-sign-in.png)
- [Phone sign-in](./mobile-sign-in.png)

## Final boundary audit

Active, archived, empty, filtered-no-results, loading, validation, saving, success, error, missing, and foreign-shop states have explicit handling. Tracking rules remain in the existing schema; client defaults reuse that source. Routes are thin, shared primitives contain no domain imports, and all records/actions use trusted shop context. Archive/restore writes are conditional atomic updates; money calculations and stock transactions were not introduced. Keyboard roles/focus, 44px controls, 16px phone inputs, readable text/control contrast, reduced-motion CSS, and long-identifier wrapping were checked in code and rendered screens.

Live Google/GitHub OAuth callbacks, remote CI, and later product phases remain separate roadmap work. No CSV workflow, fabricated stock quantities, deployment, or commit was added by this pass.
