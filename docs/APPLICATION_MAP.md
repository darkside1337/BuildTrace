# BuildTrace target application map

**Status:** Target for the portfolio MVP; this is neither a description of the current app nor a final, frozen route specification.

**Product source:** [PRD](./PRD.md), version 1.2.

**Delivery status:** [Roadmap](./ROADMAP.md).

This map shows the intended destinations, screen responsibilities, and paths between records once the MVP workflows are complete. Route paths below are proposed and may change as each workflow is implemented. The PRD owns product scope and acceptance criteria, [Architecture](./ARCHITECTURE.md) owns access and stock rules, [Design](../DESIGN.md) owns visual and interaction guidance, and the Roadmap records what actually works today.

## Entry and navigation

Public visitors reach Home, then either sign in with GitHub or Google as an authorized shop member or enter an isolated, fictional demo workspace. Authentication alone does not grant shop access. Owner and Staff share the operational workspace; Settings is Owner only. Demo guests use their own writable copy, with session controls for the guided journey and reset. Guest permissions for settings remain to be decided.

The target workspace has seven operational destinations: Overview, Inventory, Receiving, Builds, Customers, Suppliers, and Warranty lookup. Settings sits at the bottom of navigation. Show a destination in the running app only when its workflow works, as required by the Roadmap.

```text
Public
├── Home /
├── Sign-in /sign-in
└── Demo entry /demo (proposed)

Authorized shop or private demo workspace
├── Overview /overview (proposed)
├── Inventory /inventory
│   ├── Product /inventory/:productId
│   └── Serialized unit /inventory/:productId/units/:unitId (proposed)
├── Receiving /receiving (proposed)
│   └── Shipment /receiving/:shipmentId (proposed)
├── Builds /builds (proposed)
│   └── Build /builds/:buildId (proposed)
├── Customers /customers (proposed)
│   └── Customer /customers/:customerId (proposed)
├── Suppliers /suppliers (proposed)
│   └── Supplier /suppliers/:supplierId (proposed)
├── Warranty lookup /warranty (proposed)
└── Settings /settings (Owner; proposed)
```

These paths describe a possible URL structure, not a promise that every form or detail will be a separate page. A flow may use a full page, panel, or dialog while keeping direct links to important records usable. The demo workspace URL and any separate receipt-history URL remain undecided.

## Screen responsibilities

| Destination or view | What it helps the user do | Primary actions and links |
|---|---|---|
| Home and sign-in | Understand the product and enter an authorized shop or private demo. | Sign in with GitHub or Google; enter the demo; recover from access or connection errors. |
| Overview | See low stock, active builds, recent receipts and deliveries, and missing warranty information. | Open the matching filtered list or underlying record. |
| Inventory | Find catalog models and see on-hand, reserved, and available stock. | Search, filter, sort, add a product; enter opening-stock and count or adjustment flows. |
| Product detail | Understand one model's fields, stock, units, and movement history. | Edit, archive or restore; open serialized units and related stock records. Product creation itself adds no stock. |
| Serialized unit detail | Trace one physical unit from acquisition to its present state. | Open its product, receipt, supplier, allocation, build, customer, and recorded coverage where those links exist. |
| Receiving | Find draft, partially received, received, and canceled shipments. | Create a shipment and open its detail. |
| Shipment detail | Review supplier, expected lines, actual postings, costs, serials, and discrepancies. | Edit a draft, review and post a receipt, receive a later delivery, inspect posting history, or start a linked correction. |
| Builds | Find builds by status and start a customer build. | Create and open a build. |
| Build detail | Follow components from draft through reservation, assembly, and delivery. | Reserve, release, substitute, mark progress, cancel, or deliver as the current state permits; open customer and allocated stock records. |
| Customers and customer detail | Find contact records and see linked builds, delivered PCs, and component history. | Create or edit a customer; open build and unit records; archive without losing history. |
| Suppliers and supplier detail | Find contacts and review shipments and purchase-cost history. | Create or edit a supplier; open linked receiving records. |
| Warranty lookup | Find a unit or build by serial, customer, build ID, or receipt reference. | Select among matches and open the underlying product, receipt, supplier, build, customer, and coverage records. Show incomplete coverage as unknown. |
| Settings | Configure shop identity, timezone, staff access, tracking defaults, and warranty defaults. | Owner manages settings and staff. |
| Demo controls | Explore a populated fictional workspace. | Follow the guided journey and reset only this visitor's copy. |

Catalog and receiving CSV imports are planned for later [Roadmap phases](./ROADMAP.md) in the target MVP. They belong inside Inventory and a draft shipment respectively, with preview and validation before commit or posting. Their controls should appear only when the complete workflows are implemented. They are not separate navigation destinations.

## Connected journeys

1. **Establish stock:** Create a catalog product → review its identifiers and tracking mode → record opening stock with an explicit reason and source → inspect balance and movement history. A product alone has zero stock.
2. **Receive stock:** Open a supplier → create a draft shipment → enter or, when implemented, import draft lines → verify costs, quantities, serials, and discrepancies → post a receipt → inspect the received stock and its supplier provenance. Later deliveries produce separate postings.
3. **Build and deliver:** Open or create a customer → create a draft build → select components and reserve available stock → record assembly progress or substitute or release allocations → deliver with sale details → follow the preserved component history from the build.
4. **Trace warranty:** Search a serial, customer, build ID, or receipt reference → select the correct match → follow unit or quantity-allocation provenance through receipt and supplier, build and customer → read recorded supplier/manufacturer and shop/customer coverage separately.
5. **Reconcile stock:** Start a count from Inventory or a product → compare physical stock with the current balance and reservations → review discrepancies → post a reasoned correction → inspect the resulting movement and related record.
6. **Explore the demo:** Enter a private seeded shop → follow a receiving-to-warranty journey → reset only that visitor's data.

Every flow needs usable empty, loading, validation, success, and recoverable error states on desktop, tablet, and phone. For exact behavior and acceptance criteria, use the [PRD](./PRD.md#8-pages-and-navigation) and the phase-specific [Roadmap](./ROADMAP.md) walkthroughs.

## Record connections

```text
Supplier → Shipment → Receipt posting → Received stock
Product ─────────────────────────────→ Received stock
Received stock → Reservation or allocation → Build → Customer
Build → Delivery and sale record
Received stock or allocation → Recorded warranty coverage
Stock-changing action → Movement history
```

The links should work in both directions where records exist, so a warranty result can reach its source and a customer build can reach its components. Opening stock has its own provenance and does not invent a supplier or receipt. Quantity-tracked stock links to receipt and build allocations without claiming a physical serial identity.

## Map decisions still open

- Place warranty editing in the unit or allocation context, build context, or another record view while keeping lookup focused on retrieval.
- Decide whether receipt posting history needs its own URL or remains within shipment detail.
- Decide the demo workspace URL, session controls, and guest access to settings before implementing the demo.

Other product decisions and proposed defaults remain in the [PRD open decisions](./PRD.md#13-open-decisions). Update this map when a navigation or screen-ownership decision is made; use the Roadmap to record implementation and verification.
