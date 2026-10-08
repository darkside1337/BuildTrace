# BuildTrace product context

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Independent U.S. PC parts shops that also assemble custom PCs. Owners monitor stock and resolve discrepancies; inventory staff receive shipments, capture serials, and count stock; PC builders reserve parts and record delivery. Portfolio visitors can try an isolated fictional demo.

## Product Purpose

BuildTrace connects receiving, inventory, customer builds, and recorded warranty information so a shop can trace a component from supplier delivery to the customer's PC. Its MVP should demonstrate a reliable end-to-end workflow, not a commercial launch.

## Positioning

The product connects each physical serialized unit to its receipt, inventory movements, build allocation, customer delivery, and recorded warranty details. Quantity-tracked parts retain receipt allocation provenance without claiming physical-unit identity.

## Operating Context

Staff work at a desktop or on a phone while receiving partial shipments, entering quantities and keyboard-style scanner serials, reserving parts, counting stock, and searching warranty history. CSV import is deferred and must not be presented as a working workflow until its roadmap phase is implemented. The interface is English and records money in USD. It is online-only in the MVP.

## Capabilities and Constraints

- A shop has one stock location in the MVP. Owner and Staff permissions are enforced server-side; demo visitors receive isolated writable copies of fictional seed data.
- Draft receiving does not change stock. Posting a valid receipt adds only arrived units, preserves serials and movement history, and rejects duplicate submissions. CSV import remains deferred.
- CPU, GPU, motherboard, and storage products require serial tracking by default; other parts can be quantity tracked.
- Stock-changing operations are transactional. The MVP prevents negative available stock and duplicate serialized-unit allocation.
- Build reservations, assembly, delivery, and warranty lookup retain provenance. Warranty terms are recorded manually rather than inferred or claimed with manufacturers.
- The stack is Next.js, TypeScript, Tailwind CSS, shadcn/ui backed by Base UI, Neon PostgreSQL, Drizzle ORM, Better Auth, and Zod, with Netlify planned for hosting. The approved visual direction is Trace / Ledger; [DESIGN.md](./DESIGN.md) owns its tokens and visual rules.
- POS, payments, accounting, formal purchase orders, multiple locations, camera scanning, offline writes, repair/RMA workflows, supplier feeds, and automatic compatibility checks are deferred.

## Brand Commitments

The name is BuildTrace. Product copy should be precise and plain, with stock status and next actions easier to see than decoration. `DESIGN.md` defines the current Trace / Ledger visual direction; `docs/PRD.md` defines product rules. Catalog workflows display saved shop records and truthful stock data; mock import, sample, and stock controls are not product features.

## Evidence on Hand

`docs/PRD.md` contains the product scope and acceptance criteria; `docs/ARCHITECTURE.md` describes implemented and planned technical boundaries. `DESIGN.md` owns the adopted production design. The existing Next.js screens implement the approved Trace / Ledger direction; local verification and remaining phase acceptance are tracked in `docs/ROADMAP.md`. The demo dataset and measured usability results have not yet been created.

## Product Principles

- Keep catalog models distinct from physical stock.
- Preserve the chain from receiving through build delivery and warranty lookup.
- Make every stock change explicit, reviewable, and auditable.
- Make receiving, counts, and lookup workable on a phone.
- Keep demo data fictional and isolated per visitor.

## Accessibility & Inclusion

Use labeled controls, visible keyboard focus, sufficient contrast, text alongside status color, touch-accessible primary actions, and recovery guidance for errors.
