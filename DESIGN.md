---
version: alpha
name: BuildTrace — Trace / Ledger
description: A calm, tactile parts ledger with warm paper surfaces, precise blue actions, editorial serif headings, and compact technical identifiers.
colors:
  paper: "#f4f1e9"
  paper-light: "#fbfaf6"
  paper-deep: "#eae6dc"
  ink: "#191a18"
  muted: "#5f5e58"
  faint: "#696861"
  rule: "#d4d0c5"
  rule-dark: "#aaa69c"
  blue: "#173e69"
  blue-soft: "#e3eaf0"
  red: "#92352c"
  green: "#3f6a55"
  on-blue: "#fbfaf6"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: 43px
    fontWeight: 400
    lineHeight: 0.95
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  product:
    fontFamily: "DM Sans, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
  identifier:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: 0px
  control: 3px
  full: 9999px
motion:
  standard: 200ms
  reduced: "Disable nonessential transitions when prefers-reduced-motion is reduce"
controls:
  minimum-target: 44px
  phone-input-font-size: 16px
---

# Design System: BuildTrace — Trace / Ledger

## Authority

This document is the visual authority for every BuildTrace screen. The approved direction is **Trace**, expressed through the **Ledger** interface: warm paper, dark ink, fine rules, restrained blue actions, category marks, and a Newsreader editorial display face. The Figma Make prototype is a visual reference; the Next.js application remains the source of product behavior and saved data. Do not restore Grid / Stockroom, Bench, Shelf, or alternate design directions.

The [PRD](./docs/PRD.md) owns product scope and behavior. [Architecture](./docs/ARCHITECTURE.md) owns data, routing, and access boundaries. The [roadmap](./docs/ROADMAP.md) owns delivery and verification. This file defines the visual system only.

## Palette

| Token | Value | Use |
|---|---|---|
| Paper | `#f4f1e9` | Main warm canvas |
| Paper light | `#fbfaf6` | Raised or inset content surfaces |
| Paper deep | `#eae6dc` | Quiet selected and grouped surfaces |
| Ink | `#191a18` | Main text and strong rules |
| Muted | `#5f5e58` | Supporting text |
| Faint | `#696861` | Secondary metadata; maintain readable contrast |
| Rule | `#d4d0c5` | Dividers and quiet outlines |
| Rule dark | `#aaa69c` | Stronger structural boundaries |
| Input boundary | `#807c72` | Accessible control outlines, a deliberate implementation adjustment |
| Blue | `#173e69` | Primary actions, links, focus, active selection |
| Blue soft | `#e3eaf0` | Selected row and quiet blue emphasis |
| Red | `#92352c` | Destructive actions and errors, always paired with text |
| Green | `#3f6a55` | Positive state, always paired with a state label |
| On blue | `#fbfaf6` | Text and icons on the primary action |

Use the listed palette consistently across public, account, workspace, loading, empty, and error screens. Keep the background light. Do not add a dark theme or new semantic colors without revising this source of truth. Verify text and control contrast when applying colors to new combinations; small text must remain legible.

## Type and spacing

- Use **Newsreader** for the large page title: 43px/0.95 on wide screens, reducing toward 35px on narrow screens. It is regular weight, with compact line height.
- Use **DM Sans** for body text, labels, controls, navigation, and product names. Body copy is 16px/1.5; product names are 14px semibold; compact table labels are 12px semibold.
- Use **IBM Plex Mono** at 12px for SKUs, serials, model identifiers, and other technical values. Keep values selectable and expose the full value when a narrow layout wraps or truncates it.
- Use local font files and CSS variables so every route renders consistently without a third-party font request.
- Prefer generous page margins, compact table rows, grouped form sections, and thin rules over elevated cards. Keep the title, actions, filters, result count, and records aligned to a clear content column.
- Controls have a 3px corner radius. Avoid pill-shaped actions except compact status markers where the shape has meaning.

## Interaction and responsive behavior

- Design mobile first. The catalog becomes readable stacked records on narrow screens; use a table only when all columns remain useful at the available width. Filters move into an accessible sheet when needed.
- Keep primary and menu targets at least 44px high. Phone inputs use at least 16px text to prevent browser zoom. Labels remain visible and are never replaced by placeholder-only instructions.
- Support keyboard navigation, visible focus, Escape dismissal, focus return, and reduced-motion preferences. Use a 200ms transition for short state changes; remove nonessential movement when `prefers-reduced-motion: reduce` is active.
- Show loading, empty, filtered-no-results, validation, success, and recoverable error states. State color always has accompanying text. Never present a prototype-only action as a completed write.
- Details and create/edit forms may open in URL-addressable panels on wide screens. Direct links and refresh render a complete page with the same content and behavior. Soft navigation uses a full-width panel on phones.

## Brand and category marks

Use the approved Trace logo raster assets in `public/brand/` for the wordmark and app icon. Preserve aspect ratio and transparent padding; do not recreate the mark with CSS shapes or hand-drawn paths. Use `lucide-react` for interface and hardware icons, selecting the closest available component icon for each product category. A small visual difference from the prototype is preferable to custom inline SVG artwork.

## Component guidance

Use the installed shadcn components backed by Base UI. Shared primitives own their semantic states, focus, sizing, and variant treatment; feature components compose them into catalog, form, filter, and confirmation workflows. Prefer native controls for simple category and tracking-mode choices. Keep actions visibly labeled on phones, preserve entered values after recoverable failures, and present destructive archive/restore choices with clear confirmation language.

The component hierarchy and code ownership are described in [Architecture](./docs/ARCHITECTURE.md). Do not encode product rules in styling or infer stock states from visual treatment.
