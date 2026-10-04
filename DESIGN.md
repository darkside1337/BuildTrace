---
name: BuildTrace
description: A clear, precise workspace for receiving PC components, tracking stock, assembling builds, and finding part history.
colors:
  primary: "#059669"
  primary-foreground: "#18181b"
  ink: "#18181b"
  charcoal: "#3f3f46"
  graphite: "#52525b"
  muted: "#71717a"
  tertiary: "#a1a1aa"
  surface: "#ffffff"
  surface-muted: "#f4f4f5"
  border: "#e5e7eb"
  border-secondary: "#d4d4d8"
  green-secondary: "#10b981"
  green-success: "#16a34a"
  green-wash: "#d1fae5"
  mint-wash: "#ecfdf5"
  warning: "#eab308"
  error: "#b91c1c"
  destructive-accent: "#db2777"
  violet: "#9333ea"
  indigo: "#4f46e5"
  pink: "#ec4899"
  blue: "#2563eb"
  sky: "#60a5fa"
  teal: "#14b8a6"
  sky-wash: "#eff6ff"
  blue-wash: "#dbeafe"
  pink-wash: "#fce7f3"
  violet-wash: "#f3e8ff"
typography:
  display:
    fontFamily: "Inter Tight"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: -0.02em
  heading:
    fontFamily: "Inter Tight"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  subheading:
    fontFamily: "Inter Tight"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.01em
  body:
    fontFamily: "ui-sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-compact:
    fontFamily: "ui-sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "ui-sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "ui-sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.35
  data:
    fontFamily: "ui-monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "'tnum' 1"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    height: 44px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    height: 44px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
    height: 48px
  panel-muted:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  focus-marker:
    backgroundColor: "{colors.warning}"
    height: 2px
---

# BuildTrace Design System

## Visual direction

BuildTrace is an operational workspace for independent PC parts shops. Its interface should feel like a dependable instrument for receiving, counting, and tracing components: crisp white surfaces, tight but readable data layouts, clear typography, and a confident emerald action color. Let real inventory information carry the visual interest. Use strong alignment, deliberate scale changes, and occasional color accents to make the next action and any exception obvious.

This file adapts the Podscan.fm style reference for BuildTrace. It preserves the source palette while changing its color roles, copy, and component guidance for inventory work. The [PRD](./docs/PRD.md) defines product behavior and scope; this file defines presentation. Follow the PRD whenever a visual reference conflicts with a product rule. This document describes design guidance and does not imply that any component or page has already been implemented.

## Color palette and roles

Use the same color values as the source style, with roles suited to BuildTrace:

- **Emerald Signal — `#059669`:** primary action, active navigation marker, and keyboard focus. Use it for the main action such as **Post receipt**. Keep one dominant emerald action in a local action group. Use Onyx Ink for text on emerald fills to maintain readable contrast.
- **Mint Pulse — `#10b981`:** secondary green accent for small supporting indicators. It is not a substitute for the success label.
- **Onyx Ink — `#18181b`:** primary text, strong headings, navigation, and secondary dark actions.
- **Charcoal — `#3f3f46`; Graphite — `#52525b`:** emphasized and regular supporting text, table values, and secondary navigation.
- **Slate Whisper — `#71717a`; Zinc Veil — `#a1a1aa`:** helper text and tertiary metadata. Do not use low-contrast text for important values or input labels.
- **Pure Canvas — `#ffffff`:** page, panel, and input surfaces.
- **Fog — `#f4f4f5`:** restrained table headers, summaries, and selected-row backgrounds.
- **Ash Border — `#e5e7eb`; Silver Trace — `#d4d4d8`:** structural dividers, input outlines, and quiet secondary separators.
- **Marigold Spark — `#eab308`:** warning and discrepancy accent, including quantities above expected or attention-needed states. Pair it with a readable label and explanation.
- **Crimson Ink — `#b91c1c`:** blocking validation errors and destructive feedback. **Rose Blush — `#db2777`** may distinguish destructive actions where a second red-family accent is useful; do not use it as decoration.
- **Forest Verdant — `#16a34a`:** successful, complete, or ready states, always paired with explicit text. **Sprout Wash — `#d1fae5`** and **Mint Mist — `#ecfdf5`** are subtle positive-state surfaces.
- **Cobalt Signal — `#2563eb`; Sky Veil — `#60a5fa`; Sky Mist — `#eff6ff`; blue wash — `#dbeafe`:** informational guidance or links when the meaning is clearly informational.
- **Violet Tier — `#9333ea`; Indigo Spark — `#4f46e5`; Lilac Mist — `#f3e8ff`:** optional secondary classification accents for a screen that needs them. Do not use these as pricing-tier signals in BuildTrace.
- **Pink Pulse — `#ec4899`; pink wash — `#fce7f3`; Teal Trace — `#14b8a6`:** optional small category accents only when they improve distinction. Do not color every product category by default.

Keep the page mostly white and neutral, with color assigned to actions, status, and useful distinctions. Never make color the only signal for Draft, Needs serial, Partially received, Posted, Reserved, Delivered, or Low stock. Do not introduce additional hues or use several accent colors in the same area without a clear meaning. There is no dark theme defined yet.

## Typography

Use **Inter Tight** for page and section headings and a UI sans-serif system stack for body text, labels, and controls. Use a restrained scale for task screens: page titles around 24–30px, section titles 18–20px, body text 14–16px, and short supporting labels at 12px. Use 36px display text only where a screen truly needs a prominent page-level statement; do not bring the 60px marketing hero scale into receiving or inventory workflows.

Use regular or medium weights for data, semibold for labels and section headings, and bold sparingly for the page title or a key value. Tighten tracking slightly on headings only. Keep body, labels, error messages, and serials at neutral or normal letter spacing for easy reading.

Use tabular numerals for quantities, costs, dates, SKUs, and serials. A monospace face may be used for serials and identifiers when it improves scanning and copying; keep product names in the UI sans-serif. Preserve exact serial characters and support selecting and copying them.

## Layout and density

Design mobile-first. Use a 4px spacing base, with common gaps of 8, 12, 16, 24, and 32px. Keep task screens compact and breathable: 16px page gutters on mobile, 24–32px on desktop, and 16–24px between related sections. A 1200px content maximum is suitable for most pages; dense inventory views may use a wider working area when needed.

On desktop, use persistent compact navigation beside a clearly aligned content area. Keep page title, shipment summary, line items, validation, and actions on a shared grid. Prefer one continuous table or structured list for related shipment lines instead of a stack of identical cards. Reserve larger gaps for page-level transitions; operational forms should not inherit marketing-page section spacing.

On tablet and mobile, collapse navigation into an accessible menu. Convert dense tables to readable product summaries when that preserves the task, or use controlled horizontal scrolling when column comparison is essential. Keep the current record state and primary task visible. Sticky actions must not cover the final row or an error message.

## Shape and depth

Use a crisp, lightly rounded shape language: 8px corners for buttons and grouped panels, 12px for input fields and true cards, and 16px only for a large container that benefits from a stronger grouping. Reserve pill shapes for compact status badges or filters. Avoid pill-shaped primary buttons and rounded containers around every row.

Separate content mainly with whitespace, 1px borders, and occasional Fog surfaces. A subtle 1px shadow is acceptable for a popover or floating panel that needs separation. Avoid heavy elevation, glass effects, gradients, glows, and decorative shadows.

## Component guidance

- **Navigation:** include Overview, Inventory, Receiving, Builds, Customers, Suppliers, and Warranty lookup, with Settings at the bottom. Show the active page with text weight and a restrained emerald marker.
- **Page header:** use a concise page title, an optional one-line explanation, the current record status, and clearly grouped actions. For a receipt, show supplier and supplier reference close to the draft state.
- **Primary and secondary actions:** use emerald fill and Onyx text for the main action. Use Onyx fill with white text for a secondary high-emphasis action only when needed; use a white outline or text button for routine secondary actions. Keep **Save draft** distinct from **Post receipt**. Disabled actions remain legible and explain the blocker nearby.
- **Inputs:** show visible labels above fields. Use a white surface, a 1px Ash Border outline, 12px radius, and a consistent 48px control height where space allows. Provide a visible keyboard focus state and nearby validation. Serial inputs support typing, paste, and keyboard-style barcode scanners. Do not depict camera scanning.
- **Shipment summary:** show supplier, optional reference, receipt state, received total, and remaining expected units in a compact labeled summary. Do not turn every value into a metric card.
- **Receipt lines:** prioritize product name, with SKU and category as supporting text. Keep expected, received, remaining, unit cost, and serial status easy to compare. Align quantities and currency with tabular numerals. Rows should use thin rules and restrained selected or error backgrounds.
- **Serial capture:** show one clearly labeled field per arrived serialized unit. Keep the unit number and product identity nearby. Mark missing serials in text, focus the affected line, and provide a direct correction path.
- **Status and validation:** use concise text such as Draft, Needs serial, Partially received, Posted, Reserved, Delivered, or Low stock. Pair status hues with explicit words and explain how to clear a blocking condition. Discrepancies such as receiving more than expected require a clear acknowledgement.
- **CSV receiving preview:** provide a downloadable template, then show matched products and row-level errors before adding valid rows to the draft. Make clear that upload changes only the draft. Include correction and discard actions and a valid/invalid row summary.
- **Inventory and traceability:** distinguish on-hand, reserved, and available quantities. Preserve readable links from product to receipt, serialized unit, build, customer, and recorded warranty details. Say **Unknown** when a value was not recorded.
- **Feedback:** include loading, empty, validation, success, and recoverable failure states. When saving fails, retain entered values where practical and say clearly that stock was not posted. A demo workspace keeps a persistent Demo label and an explicit Reset demo action.

Use simple, consistent icons as secondary cues to text. Do not hide essential row actions behind icon-only menus on mobile. Use shadcn/ui primitives when available and apply these visual rules consistently.

## BuildTrace product language and boundaries

Use plain operational labels: **Receive shipment**, **Save draft**, **Post receipt**, **Needs serial**, **Partially received**, and **Still expected**. State that posting adds only the units received. Draft entry and CSV preview do not change stock. Receiving supports partial deliveries; a later receipt records the remaining units.

Do not invent formal purchase orders, multiple stock locations, warehouse transfers, supplier feeds, automatic warranty clocks, POS or payment workflows, or camera scanning. Catalog CSV import and receiving CSV import are separate tasks. Receiving CSV rows match existing active catalog products and must pass through draft review before the receipt can be posted. The [PRD](./docs/PRD.md) is authoritative for workflow details.

## Responsive and accessibility rules

- Keep primary touch targets at least 44px high; use 48px controls for common data-entry fields when practical.
- Preserve readable text, visible focus, keyboard access, and explicit labels at every viewport.
- Use sufficient contrast for body copy and status text. Do not rely on pale accent text against white.
- Keep errors next to the affected field and include a clear recovery action.
- Respect zoom and text scaling. Avoid fixed widths that clip serials, costs, or validation messages.
- Keep receiving, stock counting, serial entry, and warranty lookup usable without hover.

## Stitch guidance

Generate one named BuildTrace screen at a time. Supply the workflow, exact sample data, and desired viewport in each prompt; use this file for visual rules. Ask for mobile and desktop compositions when both matter. Use color according to the roles above and preserve the exact hex values. Treat example layouts as presentation references, not product requirements.

Before accepting a generated screen, check its labels, quantities, currency, partial-receipt behavior, serial requirements, validation, and enabled or disabled actions against the [PRD](./docs/PRD.md). Reject any screen that invents product features or implies a draft changes stock.
