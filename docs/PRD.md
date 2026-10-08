# BuildTrace — Product Requirements Document

**Version:** 1.2
**Date:** October 8, 2026
**Status:** Updated for Trace / Ledger integration and catalog parity
**Purpose:** Define the portfolio MVP and its acceptance criteria.

## 1. Product summary

BuildTrace is a responsive web app for independent U.S. PC parts shops that also assemble custom PCs. It connects a shop's parts catalog, received stock, component serial numbers, customer builds, and recorded warranty information.

**Product promise:** Trace every part from supplier delivery to the customer's PC.

The central workflow is:

**Receive components → track inventory → reserve parts for a build → assemble and deliver the PC → retrieve component and warranty history.**

BuildTrace is a side project intended for a portfolio showcase. The MVP should demonstrate a coherent, reliable workflow with realistic demo data. Customer acquisition, monetization, subscriptions, and commercial launch are outside this release's goals.

### 1.1 Confirmed decisions

| Area | Decision |
|---|---|
| Audience | Independent PC parts shops that also build PCs |
| Market | United States; English interface; USD |
| Service workflow | PC builds first; repairs deferred |
| Platform | Responsive web app for desktop, tablet, and mobile |
| Connectivity | Online only; full offline operation deferred |
| Tracking | Serial numbers required for high-value categories; quantity tracking for other parts |
| Customer records | Lightweight customer and PC/build records |
| Sale record | Sale date, sale price, and optional invoice or receipt reference |
| Access | Owner and Staff roles for shop users; isolated guest access for the public demo |
| Staff sign-in | GitHub and Google OAuth only through Better Auth; no email/password authentication in the MVP |
| Demo data | Each visitor gets a private writable copy of fictional seed data and can reset that copy |
| Stock writes | Server-side PostgreSQL transactions protect receiving, reservations, counts, and delivery |
| Selected stack and hosting | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Neon PostgreSQL, Drizzle ORM, Better Auth, Zod, Netlify |
| Primary outcomes | Faster receiving and warranty searches; accurate stock counts |
| Exclusions | Full POS checkout, payment processing, accounting, supplier feeds, automatic compatibility checks |

### 1.2 Working assumptions

The following defaults make the requirements concrete but remain open to revision:

- One shop and one stock location per workspace. Multiple businesses and locations are not MVP features.
- A PC builder is a user persona, not a separate permission role.
- CPU, GPU, motherboard, and storage categories require serial tracking by default. Other categories use quantity tracking unless configured otherwise.
- Warranty information is entered manually. BuildTrace does not determine manufacturer eligibility or submit claims.
- Receiving records support partial deliveries. Formal purchase orders and reorder suggestions are deferred; low-stock visibility remains in scope.

## 2. Users and problems

| User | Main responsibilities | Problem BuildTrace addresses |
|---|---|---|
| Shop owner | Monitor stock, review builds, resolve discrepancies, manage shop settings | Stock quantities and component history are scattered across separate records |
| Inventory staff | Add catalog entries, receive shipments, capture serials, count stock | Receiving takes too long and serial records are incomplete or hard to find |
| PC builder | Select components, reserve units, record progress, hand over finished PCs | Parts can be allocated twice or lose their connection to a customer build |

The product should answer four practical questions quickly:

1. How many of this part are available for a new build?
2. Which physical unit was installed in this customer's PC?
3. Who supplied that unit, and when did it arrive?
4. What warranty information was recorded for it?

## 3. Goals and success measures

### 3.1 Product goals

- Keep catalog models distinct from physical stock.
- Maintain a complete trail from receiving to allocation and delivery.
- Prevent negative available stock and duplicate allocation of serialized units.
- Make receiving, stock counting, and warranty lookup usable from a phone.
- Give portfolio visitors an immediately understandable, populated demo.

### 3.2 Proposed acceptance targets

These are evaluation targets, not claims of measured customer impact. Use the seeded demo dataset and record the test conditions.

| Measure | MVP target | Evaluation |
|---|---|---|
| Warranty lookup | Find the correct unit, supplier, build, customer, and recorded coverage within 30 seconds | Timed lookup from a known serial or receipt reference |
| Receiving | Record a prepared shipment of 10 serialized units within 3 minutes | Timed task with existing products and supplied serial numbers |
| Traceability | Every delivered serialized component links to its receipt and customer build | Inspect the prepared walkthrough and seeded delivered builds |
| Stock integrity | No duplicate allocation or negative available stock | Verify conflicting reservations and insufficient-stock attempts |
| Count accuracy | Recorded balances match accepted counts and movement history | Reconcile a count containing both quantity and serialized discrepancies |
| Demo comprehension | Complete the central workflow within 10 minutes | Walkthrough starting from demo entry with no external setup |

Timing goals should be revisited after the first usable prototype. Do not substitute dashboard totals or signup counts for proof that the core workflow works.

## 4. MVP scope

### 4.1 Included

- Shop-owned parts catalog with manual creation and CSV import, manufacturer/category/tracking filters, stable sorting, result counts, archive and restore.
- Supplier contacts and receiving history.
- Draft shipments, partial receiving, quantities, purchase costs, serial capture, and CSV-assisted receipt entry.
- Inventory balances, availability, low-stock indicators, counts, and reasoned adjustments.
- PC builds with customer links, component reservations, progress, and delivery records.
- Lightweight customer records and build history.
- Searchable component provenance and recorded warranty coverage.
- Staff sign-in, basic permissions, shop settings, and an isolated portfolio demo.

### 4.2 Deferred

- Email/password authentication and its registration, password-reset, and app-managed email-verification flows are out of scope for this portfolio MVP. They may be considered for v2; they are not committed v2 features.
- Repair tickets, returns processing, RMA workflows, and warranty claim submission.
- POS checkout, card payments, deposits, payment status, tax calculation, invoicing, refunds, and accounting.
- Live supplier feeds, automatic price updates, purchase orders, and reorder recommendations.
- Automatic compatibility checks, build recommendations, and external product lookup.
- Multiple locations, stock transfers, a shared global catalog, and customer-facing portals.
- Native apps, camera barcode scanning, and offline writes or synchronization.
- Extracting receipt lines from PDF invoices, images, spreadsheets other than CSV, or other supplier documents.
- Subscription billing, marketing automation, and advanced analytics.


A sale record documents a completed build handover. It does not imply that BuildTrace collected payment, calculated tax, or issued an invoice.

## 5. Core journeys

### 5.1 Establish the catalog and opening stock

1. Staff adds a product manually or imports product rows from CSV once that deferred phase is implemented.
2. Staff reviews category, model identifiers, prices, and tracking mode.
3. Staff records opening stock through an explicit opening-stock action, including serials where required.
4. Inventory displays the resulting balance and its opening-stock movement.

**Acceptance:** Catalog creation alone adds no stock. Opening stock records its date, author, source, and reason. Missing supplier history is labeled as unavailable rather than fabricated.

### 5.2 Receive a shipment

1. Staff selects a supplier and optionally records a supplier document reference.
2. Staff adds product lines, expected quantities when known, and unit purchase costs, or imports arrived items from a CSV into the draft.
3. Staff enters or verifies actual quantities and serials for serialized products.
4. Staff reviews product matches, costs, quantities, serials, and discrepancies, then posts the receipt.
5. A later delivery can receive the remaining expected quantities.

**Acceptance:** Manual entry and CSV import use the same draft review and posting rules. Importing or editing a draft does not increase stock. Only posted quantities increase inventory. Each serial links to its product and receipt. Invalid lines cannot produce a partially posted receipt. A repeated submission cannot duplicate the receipt or its stock movements.

### 5.3 Assemble and deliver a PC

1. Staff creates a build and links an existing or new customer.
2. Staff adds component models and quantities, then reserves available stock.
3. Staff records assembly progress and substitutes parts when needed.
4. Staff marks the build ready after all listed components have valid allocations.
5. Staff records delivery, sale date, sale price, and optional receipt reference.

**Acceptance:** Reservations reduce availability immediately. Delivery removes allocated parts from shop stock once and preserves their historical links. A build with missing allocations cannot be delivered.

### 5.4 Retrieve warranty history

1. Staff searches by component serial, customer, build ID, or receipt reference.
2. Staff selects the matching unit or build.
3. BuildTrace displays the component, receipt, supplier, customer, sale details, and recorded warranty dates.

**Acceptance:** Searches return links to the underlying records. Missing warranty dates appear as unknown. Quantity-tracked parts display their build and receipt allocation history without invented serial numbers.

### 5.5 Count and correct stock

1. Staff finds a product and opens a stock count.
2. Staff enters a physical quantity or reconciles a list of serialized units.
3. BuildTrace previews discrepancies and requires a reason before posting changes.
4. Accepted corrections update stock and append audit movements.

**Acceptance:** Counts exclude delivered units. Reserved units remain on hand and are visible during reconciliation. A correction conflicting with a reservation requires that reservation to be resolved first.

## 6. Functional requirements

### FR-01 — Parts catalog

Each product supports a name, category, manufacturer, model, internal SKU, manufacturer part number, optional barcode, tracking mode, reference purchase cost, reference sale price, low-stock threshold, optional warranty defaults, basic specifications, and notes.

- Categories cover CPUs, GPUs, motherboards, RAM, storage, cases, power supplies, cooling, and accessories.
- Internal SKU is unique within the shop. Barcode and manufacturer part number identify a model, not a physical unit.
- Specifications are descriptive; their presence does not imply compatibility validation.
- Staff can search by name, SKU, model, manufacturer, manufacturer part number, or barcode; filter by manufacturer, category, tracking mode, and low-stock status; and sort using an explicit allowlist of stable catalog fields. Show a result count that matches the applied filters.
- Product detail shows quantities, serialized units where applicable, and movement history.
- Referenced products can be archived and restored by authorized shop members; historical receipts and builds retain their model information. Restore clears the current archive marker and records the responsible actor.
- Product forms group every supported catalog field into clear sections. Optional fields remain available without being hidden behind an “advanced” disclosure.

**Acceptance:** A duplicate SKU produces a clear validation error. Archived products cannot be selected for new receiving or allocations. Changing reference prices does not alter historical costs or sale records.

### FR-02 — CSV catalog import

Deferred from the Ledger integration pass; retained in the portfolio MVP roadmap.

- Provide a downloadable template and a preview before committing.
- Import product fields only; opening stock is a separate action.
- Identify invalid values, missing fields, and duplicate SKUs with row-level errors.
- MVP imports create new products; existing SKU matches are conflicts rather than silent updates.
- Permit commit only when the selected batch is valid, and summarize the result.

**Acceptance when scheduled:** Invalid batches create no products. Reimporting the same SKUs reports conflicts. Serial units and balances cannot be created accidentally by catalog import. Until then, do not expose a simulated import action.

### FR-03 — Suppliers and receiving

- Suppliers store name, optional contact person, email, phone, address, and notes.
- Supplier detail links to shipments and historical unit purchase costs.
- A shipment stores supplier, reference, notes, and product lines with optional expected quantity.
- Each posting records receipt date, actual quantities, unit costs, serials, and author.
- Show draft, partially received, and received states. A canceled draft creates no movements.
- Receiving beyond an expected quantity requires an explicit discrepancy acknowledgement.
- Posted receipts are historical records; corrections use linked, reasoned movements rather than deletion or silent edits.

**Acceptance:** A partial receipt adds only the received units. Later receipts cannot repost earlier quantities. A correction cannot remove a unit already reserved or delivered without resolving its linked workflow.

### FR-03a — CSV receiving import

Implemented in its later roadmap phase, not in this visual integration pass.

- Offer a downloadable CSV template and upload within a draft shipment or receipt. The supplier is selected in the receiving workflow, not inferred from the file.
- Match imported rows to existing, active catalog products by shop SKU. Import must not create products or suppliers.
- Template fields are SKU, received quantity, unit purchase cost, and serial number. For a serialized product, use one row per physical unit with quantity 1 and a serial. For a quantity-tracked product, use a positive whole-number quantity and leave serial blank.
- Show a preview of matched products and imported costs, quantities, and serials before adding rows to the draft. Allow staff to correct or discard the proposed rows.
- Report malformed files, unknown or archived SKUs, invalid quantities or costs, wrong tracking modes, missing serials, and serials duplicated within the file or already recorded by the shop as row-level errors.
- Importing a valid file changes only the draft. The existing receipt review and posting action remains mandatory, including expected-versus-received discrepancy acknowledgement when applicable.
- An invalid import leaves the current draft unchanged. Repeated upload of the same rows warns about duplicates instead of silently adding them twice.

**Acceptance when scheduled:** Upload alone creates no stock movements. A valid CSV can populate a draft containing both serialized and quantity-tracked parts. An invalid CSV cannot partly change the draft or post a receipt. Posting imported rows follows the same all-or-nothing and retry-safe rules as manual receiving. Until then, do not expose a simulated import action.

### FR-04 — Inventory and counts

- Show on-hand, reserved, and available quantities separately for every product.
- Low stock means available quantity is at or below the configured threshold.
- Display individual serialized units with state and provenance.
- Support explicit opening stock and count/adjustment actions, each requiring a reason.
- Preserve an append-only movement history with date, actor, quantity change, reason, and related record.
- Support filters for category, availability, low stock, and serialized-unit state.

**Acceptance:** Users cannot overwrite balances directly or remove movement history. Quantity adjustments cannot make on-hand stock lower than active reservations. A serialized discrepancy identifies the affected units.

### FR-05 — PC builds

- A build has a unique readable ID, customer, PC name or description, optional device identifier, component lines, status, notes, and timestamps.
- Component lines store product, quantity, and allocated physical units or receipt quantities.
- Staff can save a draft without reservations, reserve stock, record assembly progress, and release or substitute reservations.
- Delivery requires a customer, complete component allocations, sale date, and total sale price in USD. Receipt/invoice reference is optional.
- Sale price is manually recorded as the total provided by the shop; tax, discounts, and payment collection are not calculated here.
- Record who delivered the build and when. Preserve sale and component snapshots for later lookup.

**Acceptance:** Only available stock can be reserved. Cancellations release all reservations. Substitution either replaces the allocation completely or leaves the original allocation intact. Delivery cannot deduct components twice.

### FR-06 — Customers

- Store customer display name, optional email, phone, and notes.
- Show linked builds, delivered PCs, and component history.
- Customer name is required; contact information is optional.
- Warn about potential contact matches without assuming names or shared phone numbers are unique.
- Archive referenced customers rather than deleting their build history.

**Acceptance:** A customer detail page reaches the corresponding build and unit records. Public demo customer data is fictional and clearly labeled.

### FR-07 — Warranty lookup

- Search by exact or partial serial, customer name/contact, build ID, or receipt reference.
- Show multiple matches explicitly; receipt references and customer names need not be unique.
- Display the recorded supplier, receiving date, purchase cost, build, customer, sale date, and available warranty information.
- Keep supplier/manufacturer coverage and shop/customer coverage separate, with their own provider, start date, end date or duration, and notes.
- A configured default can suggest coverage dates, but staff must confirm the basis. Delivery does not silently assume manufacturer coverage begins on the sale date.
- Coverage labels are active, expired, not yet started, or unknown according to the recorded dates and shop date.

**Acceptance:** Missing provider or date information remains visible as incomplete. The app never presents inferred coverage as verified eligibility. Warranty lookup does not initiate a return or claim.

### FR-08 — Overview

- Summarize low-stock products, active builds, recently posted receipts, recent deliveries, and missing warranty information for delivered components.
- Link each summary to its filtered list or underlying record.
- Show useful empty states with relevant next actions.

**Acceptance:** Overview counts agree with their linked records and refresh after successful stock or build changes.

### FR-09 — Settings and access

- Settings holds shop identity, timezone, staff access, category tracking defaults, and warranty defaults.
- Owners manage staff and settings. Staff can use receiving, inventory, builds, customers, suppliers, and lookup workflows.
- All mutations record the responsible user. Stock corrections remain auditable for both roles.
- Enforce permissions and shop ownership on the server for reads and writes.
- Owners and Staff sign in only with GitHub or Google OAuth through Better Auth and can sign out. Public signup remains closed; successful OAuth authentication alone does not grant shop membership. Public visitors have an obvious demo entry point.
- Demo visitors use guest access tied to their own writable shop copy; they cannot access staff shops or another visitor's copy.

**Acceptance:** Both GitHub and Google OAuth support sign-in for authorized shop users; no email/password sign-in or password-reset flow is exposed or enabled. A staff account cannot change owner-only settings through either the interface or a direct request. One demo session cannot access another session's data.

## 7. Inventory and build rules

### 7.1 Model, unit, and balance definitions

- **Product:** A catalog model, such as a particular SSD capacity and manufacturer part number.
- **Serialized unit:** One physical component with a unique serial record, receipt, and acquisition cost.
- **Quantity stock:** Interchangeable components tracked by receipt quantity without individual serials.
- **On hand:** Components still in shop inventory, including those reserved for active builds.
- **Reserved:** On-hand components allocated to an active build.
- **Available:** On hand minus reserved.

The MVP does not model additional sellable/quarantine locations. A missing or damaged unit is removed from available stock through an explicit adjustment after resolving any reservation.

### 7.2 Serial and quantity rules

- Serialized receipts require one nonempty serial per unit received.
- For MVP simplicity, serials are unique across the shop. Trim surrounding whitespace and compare case-insensitively while preserving the entered display value.
- A product cannot switch tracking mode while stock or reservations remain. Historical records keep their original tracking mode.
- A serialized unit can be available, reserved, delivered, or removed by adjustment; its history survives every transition.
- Quantity reservations retain receipt allocation and purchase cost provenance. Use the earliest available receipt quantities first as the proposed default.
- Quantity provenance identifies the recorded stock allocation; it cannot prove physical identity as a serial number can.
- Quantity-tracked warranty details belong to the recorded receipt/build allocation; serial-specific lookup is unavailable for them.

### 7.3 Build lifecycle

| State | Stock effect | Permitted next states |
|---|---|---|
| Draft | No reservation required | Reserved, Canceled |
| Reserved | Listed components fully reserved | Assembling, Draft after releasing reservations, Canceled |
| Assembling | Reservations remain active | Ready, Canceled |
| Ready | Reservations remain active | Assembling, Delivered, Canceled |
| Delivered | Allocated components leave on-hand stock; active reservations end | Terminal in MVP |
| Canceled | Reservations released; cancellation reason retained | Terminal in MVP |

Substitutions before delivery must preserve complete allocations or return the build to Draft with its reservations released. Canceling an assembled build assumes its components are physically returned to stock; record that confirmation. Delivered builds cannot be reopened because returns and repairs are deferred.

### 7.4 Consistency and corrections

- Receiving, reserving, substituting, canceling, adjusting stock, and delivering are all-or-nothing operations.
- Stock-changing operations execute in server-side PostgreSQL transactions that keep balances, allocations, and movement history consistent.
- Simultaneous requests cannot reserve the same serialized unit or more quantity than is available.
- Repeated requests or retries cannot duplicate receipts, reservations, or delivery deductions.
- If stock changed after a screen was loaded, reject the stale operation with current availability and a recovery action.
- A stock count cannot overwrite movements posted after that count began; require review against the refreshed balance.
- Corrections append a reason, author, time, and reference to the original record. Do not erase provenance.
- Store and display monetary values consistently to USD cents; historical acquisition costs remain distinct from editable catalog reference costs.

## 8. Pages and navigation

| Main page | Primary content and actions |
|---|---|
| Overview | Attention items, recent activity, workflow entry points |
| Inventory | Catalog, balances, units, search, Add part, Import CSV when implemented, Count stock, Adjust stock |
| Receiving | Shipments, manual or CSV draft entry, receipt review, partial receiving, posting history |
| Builds | Active and delivered builds, creation, reservation, assembly, delivery |
| Customers | Customer list, basic contacts, linked PCs and builds |
| Suppliers | Supplier list, contacts, shipment and cost history |
| Warranty lookup | Search results and linked component/coverage history |

Settings sits at the bottom of the main navigation. Sign-in and demo entry are supporting screens.

Required detail views: product, serialized unit, shipment, build, customer, and supplier. Forms may use pages, dialogs, or drawers according to available space; if CSV imports are scheduled, they are actions within their respective pages, not sidebar entries. Do not show import actions before those workflows are implemented.

### 8.1 Responsive and interaction requirements

- Desktop supports dense tables and persistent navigation.
- Tablet supports receiving and build work without relying on hover interactions.
- Mobile prioritizes lookup, serial entry, counting, and readable detail views. Tables may adapt to cards or controlled horizontal scrolling.
- Keep primary actions accessible with touch, visible labels, and keyboard navigation.
- Support manual barcode/serial entry and keyboard-style scanner input. Camera scanning is deferred.
- Provide loading, empty, validation, success, and recoverable error states throughout the workflow.
- On connection loss, preserve unsent input where practical, show that saving failed, and allow an explicit retry. Do not claim stock was saved or queue offline writes.
- Use sufficient contrast, visible focus, labeled fields, and text alongside status colors. Critical errors must explain how to recover.
- Use [DESIGN.md](../DESIGN.md) as the visual authority: Trace / Ledger, one light palette, local Newsreader, DM Sans, and IBM Plex Mono fonts, Lucide React icons, 44px minimum touch targets, and 16px text in phone inputs.
- Product detail and create/edit forms may open in URL-addressable panels on wide screens; direct navigation and refresh present the same workflow as a full page; soft navigation uses a full-width panel on phones. Preserve drafts during in-app navigation and require a clear discard decision before leaving changed form data.

### 8.2 Design authority and workflow reference

[DESIGN.md](../DESIGN.md) is the sole authority for the approved Trace / Ledger visual direction, tokens, typography, icon usage, and responsive component treatment. The prototype is a visual reference; saved application data and behavior follow this PRD.

MondayPOS is a workflow reference for connected shop activity, readable inventory views, and PC component history. It is inspiration, not the MVP feature checklist or a visual direction to copy.

Reference links: [MondayPOS](https://mondaypos.com/) and [computer shop workflow](https://mondaypos.com/industries/computer-shop). Their current contents do not define BuildTrace requirements.

## 9. Technical constraints and preferences

The repository contains the Phase 00 database status entry and Phase 01 OAuth/catalog implementation. Authenticated provider walkthrough and the full Owner catalog walkthrough remain pending. Public deployment remains planned. See [ARCHITECTURE.md](./ARCHITECTURE.md) for implemented and planned boundaries.

| Layer | Status | Choice |
|---|---|---|
| Framework and language | Local foundation implemented | Next.js, React, TypeScript |
| Styling | Local foundation implemented | Tailwind CSS |
| UI components | Base UI-backed foundation and Phase 01 catalog views implemented | shadcn/ui |
| Database | Connection check, Better Auth, shop membership, and catalog tables implemented | PostgreSQL on Neon |
| Database access | Versioned migrations, shop-scoped product queries, and mutations implemented | Drizzle ORM |
| Authentication | Better Auth OAuth-only sign-in, provisioned provider-ID membership checks, and protected catalog routes implemented; real provider/Owner walkthrough pending | Better Auth with GitHub and Google OAuth only |
| Validation | Environment and server-side product schemas implemented | Zod |
| Hosting | Selected; not configured | Netlify |

Required technical outcomes:

- Persist workflow records across reloads and enforce validation on the server.
- Protect stock invariants under concurrent requests and retries.
- Restrict staff and demo records to the appropriate shop/session.
- Preserve transaction history and historical model, cost, and sale information.
- Keep secrets server-side and out of source, seed data, and browser output.
- Support English labels, USD amounts, and an explicit shop timezone for dates and warranty status.
- Read the installed Next.js documentation before implementation, as required by the repository's `AGENTS.md`.

Database schemas, API design, component architecture, and deployment configuration belong in a separate technical design document. This PRD does not prescribe those implementation details.

## 10. Portfolio demo

### 10.1 Seed dataset

- Curate 40–60 real product models across the core PC component categories.
- Verify model names and basic specs against manufacturer product pages when preparing seeds; keep source references with the seed assets.
- Use fictional suppliers, customers, contacts, serials, receipt references, purchase costs, sale prices, and transactions.
- Label the dataset as demonstration data; sample costs and prices are not current market quotations.
- Include available stock, low-stock products, partial shipments, active builds, delivered builds, an expired warranty, and incomplete warranty information.
- Ensure stock balances reconcile with movements and every seeded allocation follows the same rules as user-created records.

### 10.2 Access and reset

A visitor enters a writable demo without providing personal credentials. Each session receives an isolated copy of the fictional seed shop and a guest identity. Reset restores that visitor's copy without changing other sessions. Guest access cannot grant access to staff shops or alter deployment configuration.

Provide a visible demo label and a concise guided route. Session expiry and storage limits are implementation decisions to resolve before publishing the demo.

### 10.3 Prepared walkthrough

1. Open Overview and inspect a low-stock product.
2. Import a sample receiving CSV into an existing draft shipment, review the matched parts and serials, then post it.
3. Open a prepared customer build and reserve the received components.
4. Move the build through assembly to ready.
5. Deliver it with a fictional sale date, price, and receipt reference.
6. Search a component serial and follow its supplier → receipt → build → customer trail.
7. Reset the demo and verify the original dataset is restored.

## 11. Delivery milestones

| Milestone | Deliverable | Exit criteria |
|---|---|---|
| 1. Foundations and catalog | App navigation, sign-in/access boundaries, customer/supplier records, catalog and CSV import | Valid records persist; catalog creation cannot change stock; access rules hold |
| 2. Receiving and inventory | Manual and CSV-assisted receipt entry, posting, serialized units, quantity stock, opening stock, counts, movements | Partial receipts reconcile; CSV validation prevents draft or stock changes on failure; invalid serials and conflicting adjustments are rejected |
| 3. Build workflow | Component allocation, reservation, substitution, cancellation, assembly, delivery | Concurrent allocation is safe; cancellations release stock; delivery deducts once |
| 4. Lookup and overview | Provenance search, coverage display, linked summaries | Central traceability journey works; unknown coverage is explicit |
| 5. Showcase readiness | Curated seeds, isolated demo/reset, responsive polish, guided walkthrough | Demo targets can be evaluated; mobile workflows work; sessions remain isolated |

No delivery dates are committed. Sequence follows workflow dependencies, with data integrity established before visual polish is considered complete.

## 12. Release acceptance

The portfolio MVP is ready when:

- The complete receiving-to-warranty walkthrough works without editing database records manually.
- Catalog and receiving CSV imports, manual receiving, stock counts, reservations, substitutions, cancellation, and delivery meet their acceptance criteria. CSV is deferred from this visual integration pass, not removed from the portfolio MVP.
- Product creation adds no stock, balances reconcile with movements, and serialized units cannot be allocated twice.
- Failed or repeated writes do not create partial or duplicate stock changes.
- Delivered builds retain their component, customer, supplier, and sale history.
- Coverage uses recorded information and exposes incomplete data clearly.
- Owner/Staff restrictions and demo session isolation are enforced beyond the interface.
- Desktop, tablet, and mobile support their primary workflows with usable loading and error states.
- The demo is populated, clearly fictional, resettable, and usable without outside accounts or services.
- Proposed timing targets are evaluated and results documented; any missed target has a concrete follow-up.

## 13. Open decisions

| Decision | Proposed default | Resolve before |
|---|---|---|
| Exact serial-required categories | CPU, GPU, motherboard, storage; configurable for new products | Catalog and receiving implementation |
| Warranty defaults | Separate supplier/manufacturer and shop/customer terms, manually confirmed | Warranty forms and seed preparation |
| Quantity allocation order | Earliest available receipt quantities first | Reservation implementation |
| Purchase-order scope | Defer formal purchase orders; retain expected quantities in shipment records | Receiving design |
| Demo lifecycle | Determine guest-session expiry, cleanup, rate, and storage/capacity bounds | Guest reset/lifecycle implementation before publication |
| Shop timezone | Configurable U.S. timezone; explicit default in demo | Date handling and seed preparation |
| Performance targets | Use the proposed timed tasks, then calibrate after prototype evaluation | Publication acceptance |

These remaining defaults allow planning to proceed. They are still proposed choices, separate from the confirmed decisions above.
