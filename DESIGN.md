---
name: US TechMarket
description: A composed, after-hours reading surface for what happened to US technology stocks today.
colors:
  primary: "#3d78ff"
  primary-active: "#5c8fff"
  semantic-up: "#24c98a"
  semantic-down: "#ff5f6d"
  ink: "#f2f4f7"
  body: "#a3abb8"
  muted: "#79818e"
  canvas: "#0d0f12"
  surface-soft: "#15181d"
  surface-strong: "#21262e"
  hairline: "#2a2f37"
  logo-plate: "#e9ebef"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.625"
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "normal"
  numeric:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
    fontFeature: "tnum"
rounded:
  lg: "8px"
  xl: "12px"
  "2xl": "16px"
  "3xl": "24px"
  full: "9999px"
spacing:
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
components:
  badge-significant:
    backgroundColor: "rgb(61 120 255 / 0.10)"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-normal:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.body}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  button-pill:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  button-pill-hover:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.ink}"
  tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  tab-inactive:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  nav-item:
    textColor: "{colors.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  logo-plate:
    backgroundColor: "{colors.logo-plate}"
    rounded: "{rounded.full}"
    height: "32px"
    width: "80px"
  ticker-chip:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.body}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  menu-surface:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.2xl}"
    padding: "4px 0"
---

# Design System: US TechMarket

## Overview

**Creative North Star: "The After-Hours Desk"**

The market has closed. The numbers have stopped moving, the day is complete, and what is left is a desk with everything laid out on it — settled, recorded, and quiet. That is the room this interface is in, and it explains its two most visible decisions: dark is the *default* theme rather than an option, and nothing on screen ticks, flashes, pulses, or announces itself. A product whose entire premise is "here is what happened today" would be lying with its motion design if it behaved like a live tape.

The voice is **composed, exact, and unhurried**. Density is high — a 20-stock universe, eight-column tables, five stat cards, an intraday chart with two panels — but the pressure is low. Precision is what does the persuading: monospaced tabular numerals so figures align down a column, hairline rules instead of heavy dividers, and an accent colour used so sparingly that its appearance is information. The interface is confident enough to stay quiet.

Components are **soft-edged and matter-of-fact**. Radii are generous — 24px on every container, full pills on anything that reads as a token — but nothing is decorated. There are no gradients, no illustrations, no icon set beyond a sun, a moon, and a chevron. The softness is the entire source of warmth in the system; everything else is a surface, a hairline, and a number. Depth follows the same restraint: the shell layers tonally (a canvas sidebar, a recessed grey field, and canvas cards floating back up on it) rather than reaching for shadow.

**Key Characteristics:**

- Dark-default, two-theme system where every token is defined twice and neither theme is an afterthought.
- Monospaced tabular numerals for every figure in the product, without exception.
- Flat, hairline-ruled surfaces; tonal layering carries depth, shadow is currently confined to overlays.
- One reserved accent whose appearance always means "active" or "significant".
- Generous radii (24px containers, full pills) as the only decorative gesture.
- No chart library and almost no client JavaScript — sparklines, the intraday chart, and every thumbnail are server-rendered SVG and markup.

## Colors

A near-neutral, slightly blue-shifted greyscale carrying three signal colours: one reserved accent and a gain/loss pair that belongs to the session being reported.

**On the two themes.** Dark is the default (`<html data-theme="dark">`), so the frontmatter above carries the dark values as canonical. Every token also has a light counterpart defined in `:root` in `src/app/globals.css`; both values are listed below and machine-readable in `.impeccable/design.json`. Neither theme is a derived tint of the other — they are hand-paired.

### Primary

- **Signal Blue** (`primary`, #3d78ff dark / #0052ff light): the only accent in the system, and it is never decoration. It marks the active sidebar item, the Significant badge, the active news tab, inline links, the bullet dots in the AI summary, and price-milestone and high-volume markers on the timeline. If Signal Blue appears, something is active or something crossed a threshold.
- **Signal Blue Active** (`primary-active`, #5c8fff dark / #003ecc light): the pressed and hover state for accent surfaces. Note the direction reverses between themes — light mode goes *darker* on press, dark mode goes *lighter*, because contrast against the plate is what has to increase, not brightness.

### Secondary

- **Session Green** (`semantic-up`, #24c98a dark / #05b169 light) and **Session Red** (`semantic-down`, #ff5f6d dark / #cf202f light): gains and losses in the session being reported. They colour change values, sparkline and intraday chart strokes, the market-open dot, and error text in the watchlist menus. They describe a completed day, not a live tape.

  Deliberately *not* applied to volume. The Trading Activity stat card stays neutral, because heavy volume is neither good news nor bad and colouring it would assert a judgement the product is not allowed to make.

### Neutral

- **Ink** (`ink`, #f2f4f7 dark / #0a0b0d light): headings, ticker symbols, primary values, and anything the eye should land on first.
- **Body** (`body`, #a3abb8 dark / #5b616e light): running prose, summaries, secondary figures, inactive navigation.
- **Muted** (`muted`, #79818e dark / #7c828a light): table headers, stat card labels, timestamps, axis labels, chart provenance notes. The quietest readable tier.
- **Canvas** (`canvas`, #0d0f12 dark / #ffffff light): the sidebar and every card, panel, list and table surface.
- **Surface Soft** (`surface-soft`, #15181d dark / #f7f7f7 light): the `<main>` field that cards sit on, plus hover states on menu rows.
- **Surface Strong** (`surface-strong`, #21262e dark / #eef0f3 light): filled but unaccented chips, the Normal badge, pill buttons, ticker tags, the active nav plate, and the intraday chart's volume bars.
- **Hairline** (`hairline`, #2a2f37 dark / #dee1e6 light): every 1px border, table rule, grid line, and timeline rail in the product. It is the system's primary means of separation.

### Named Rules

**The Two-Theme Rule.** Every colour token is defined in both `:root` and `:root[data-theme="dark"]`. A token whose only definition sits inside one block is a bug, not a shortcut — it silently vanishes in the other theme.

**The Always-Light Plate Rule.** `logo-plate` (#e9ebef dark / #eef0f3 light) is the one token that does not invert, and this is load-bearing rather than an oversight. Brand marks arrive with hardcoded fills — Apple #000000, Palantir #101113, Amazon #221f1f — that disappear on a dark surface and cannot be recoloured. Real marks sit on this plate; the lettermark fallback and category glyphs use `surface-strong` so their text stays theme-aware.

**The Reserved Accent Rule.** Signal Blue is the only accent, and it carries exactly two meanings: *this is active* and *this is significant*. It is never used to make a surface look more interesting.

## Typography

**Display / Body Font:** Inter (with `ui-sans-serif, system-ui, sans-serif`)
**Numeric Font:** JetBrains Mono (with `ui-monospace, monospace`)

**Character:** A deliberately plain pairing. Inter carries every word in the product with no stylistic opinion, tightened slightly at display sizes; JetBrains Mono carries every number with tabular figures so that a column of prices, percentages and volumes forms a readable grid rather than a ragged list. The split between the two faces is the clearest signal the system sends about what kind of product this is: prose is prose, and figures are data.

### Hierarchy

- **Display** (600, 1.5rem/24px, tracking −0.025em): the one `h1` per page — "What happened to your stocks today", "News". Appears once, at the top, above a single line of Body.
- **Headline** (600, 1.875rem/30px, tracking −0.025em): reserved for the ticker symbol on Today's Activity, which is simultaneously the page title and the button that opens the stock switcher. It is the largest type in the product, and it is a control.
- **Title** (600, 1.125rem/18px): every section heading — Market Overview, My Watchlist, Top Movers Today, AI Daily Summary, Price & Volume, Today's Timeline, Upcoming Events.
- **Body** (400, 0.875rem/14px, line-height 1.625 in prose): article summaries, the AI narrative, stat card detail lines, company names. The relaxed leading applies wherever a passage runs more than one line.
- **Label** (600, 0.75rem/12px): table column headers, stat card labels, badge text, ticker chips, menu group headers. Uppercase is *not* used — labels are set in sentence case and rely on weight and colour for their tier.
- **Numeric** (JetBrains Mono, 500, tabular figures): every price, change, percentage, volume, relative volume, rank, timestamp and axis label. Sizes range from 0.6875rem/11px on chart axes to 1.5rem/24px on the Today's Activity price.

### Named Rules

**The Mono Numerals Rule.** Every number in the product renders in JetBrains Mono with `tabular-nums`. No exceptions — a figure set in Inter is a defect, because it breaks column alignment and severs the visual promise that numbers here are measured rather than written.

**The Signed Value Rule.** Change values always carry an explicit `+` or `−` (U+2212, not a hyphen) and are formatted from the absolute value. Direction is therefore legible without colour, which is what keeps the change columns usable for a colour-blind reader.

## Layout

**Shell.** A fixed 240px sidebar (`w-60 shrink-0`) in Canvas with a hairline right border, and a flexible `<main>` in Surface Soft. `min-w-0` on `<main>` is load-bearing: a flex item defaults to `min-width: auto`, so without it the 880px watchlist table pushes the entire page sideways instead of scrolling inside its own wrapper. The sidebar holds the wordmark, the theme toggle, and three nav items; there is no secondary tab bar anywhere in the product.

**Content column.** Every page uses the same container: `max-w-[1200px]`, centred, with 24px horizontal padding rising to 40px at `lg`, and 32px vertical padding. Nothing is full-bleed.

**Section rhythm.** Home and Today's Activity separate major sections by 40px; News uses 24px because its tab row and list read as one unit. Within a section, the heading sits 16px above its content. Cards carry 20px of internal padding, rising to 24px on the AI summary card, which is the only panel that holds a passage of prose.

**Grids.** Card rows — the five Market Overview cards and the five Today's Activity stat cards — run `1 → 2 (sm) → 3 (lg) → 5 (xl)`. Paired panels at the foot of Home and Today's Activity run `1 → 2 (lg)`. Breakpoints are Tailwind's `sm` 640px, `lg` 1024px, `xl` 1280px.

**Density.** Table rows are 20px × 16px per cell; list rows are 20px all round. This is a dense product by intent, and the padding is what keeps density from becoming pressure.

**Device targets.** Laptop and iPad, at every width from 768px up. Phone widths (~390px) are a known unsupported case: content inside `<main>` has minimums below which it cannot shrink, and fixing it means giving the sidebar a collapse behaviour, which is an unmade design decision rather than a bug.

### Named Rules

**The Scrolling Island Rule.** Anything with a hard minimum width — the 880px watchlist table, the 560px intraday chart — lives inside its own `overflow-x-auto` container and scrolls internally. The page body never scrolls horizontally. A wrapper alone does not achieve this; the flex ancestor must also carry `min-w-0`, or the wrapper is dead code and the page widens anyway.

**The One Container Rule.** Every page opens with the same `max-w-[1200px]` column and the same padding. A page that sets its own width is drifting.

## Elevation & Depth

The system is almost entirely flat, and depth is carried by **tonal layering plus 1px hairlines**. The shell inverts the usual arrangement: the sidebar and every card are Canvas, while the `<main>` field behind them is the darker Surface Soft — so content reads as floating back up out of a recessed field rather than being lifted off a page. Separation within a surface is always a hairline, never a shadow and never a heavier rule.

Shadow currently appears in exactly two places, both of them overlays: the watchlist picker dropdown and the symbol switcher menu. Both are things that float above the page and need to detach from it.

**This is recorded descriptively, not as an invariant.** The current flatness is the state of the implementation and a coherent one, but a future pass may introduce a real elevation scale. What should not happen is a shadow appearing on a single component in isolation — if rest-state depth is wanted, the scale gets designed first and applied consistently.

### Shadow Vocabulary

- **Menu Soft** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04)`): the watchlist picker dropdown. Barely there — the hairline border is doing most of the separation.
- **Menu Lifted** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): the symbol switcher menu, which opens over denser content and needs more detachment.

## Shapes

The form language is **rounded rectangles and pills, with no other geometry**. There are no angles, no clipped corners, no dividers with weight, and no decorative shapes anywhere in the product.

Radius maps directly to what a thing *is*:

- **Full pill** (9999px) — anything that is a token of state or identity: Significant/Normal badges, ticker chips, pill buttons, news tabs, logo plates, status dots, timeline dots, the market-open indicator.
- **24px** — every container: cards, panels, tables, lists, the AI summary, the chart frame, empty-state blocks.
- **16px** — floating menu surfaces.
- **12px** — interactive rows and inline message blocks inside menus, and the symbol switcher's own trigger.
- **8px** — the smallest interactive affordances: sidebar nav items and the theme toggle.
- **2px** — intraday volume bars, the only radius that exists for optical reasons rather than semantic ones.

Borders are always exactly 1px in Hairline. Icons are stroked at 1.5–1.75px with round caps and joins, drawn inline as SVG at 18–20px; there is no icon library and the entire set is a sun, a moon, and a chevron.

### Named Rules

**The Pill-For-Tokens Rule.** If it is a token — a small object standing for a state, a category, or an identity — it is a full pill. If it is a container, it is 24px. There is no in-between case at container scale.

## Components

### Buttons

- **Shape:** full pill (9999px) for standalone actions; 8px for navigation rows.
- **Pill button:** Surface Strong plate, Ink text, 600 weight, 8px × 16px padding — the "Edit watchlist (7/10)" trigger. It states its own count, so the cap is legible before the menu opens.
- **Hover / Focus:** `transition-colors` only. Pill buttons move Surface Strong → Hairline; menu rows move transparent → Surface Soft with Body → Ink text. Nothing moves, scales, or lifts.
- **Icon button:** 32px square, 8px radius, Body icon at 18px, Surface Soft plate on hover — the theme toggle.
- **Disabled:** `opacity-50` on menu rows, `opacity-30` with `cursor-not-allowed` on the `+`/`−` controls, which is how the watchlist floor (1) and cap (10) are communicated before a request is made.

### Chips

- **Badge (Significant):** Signal Blue at 10% alpha with Signal Blue text — a tinted plate, never a solid fill.
- **Badge (Normal):** Surface Strong with Body text. The contrast between the two states is deliberate: Significant is coloured, Normal is grey, and both are the same size and shape so a column of them scans.
- **Ticker chip:** Surface Strong, Body text, 11px/600, 2px × 10px padding. Up to four per article.
- **News tab:** full pill, 8px × 16px. Active is a solid Signal Blue fill with white text — the only place in the product where the accent is a fill rather than a tint or a text colour.

### Cards / Containers

- **Corner Style:** 24px.
- **Background:** Canvas, against the Surface Soft page field.
- **Border:** 1px Hairline on all sides.
- **Shadow Strategy:** none at rest. See Elevation & Depth.
- **Internal Padding:** 20px standard; 24px on the AI summary card; 20px × 16px per table cell.
- **Internal rules:** rows inside a container are separated by a bottom hairline with `last:border-0`, so the container's own border is never doubled.

### Inputs / Fields

The product has no text inputs, no forms, and no search. Every interaction is a button, a link, or a menu row. **Do not invent an input style** — if one becomes necessary, it should be designed against this system rather than borrowed from a default.

### Navigation

- **Sidebar:** three items, 8px radius, 14px/500. Inactive is Body text on transparent, hovering to Surface Soft with Ink text. Active is a Surface Strong plate with Signal Blue text — plate *and* colour, so the active item is unambiguous.
- **Wordmark:** "US TechMarket" at 18px/600, tracking-tight, paired with the theme toggle on the same row.
- **Empty states:** every list and panel has one, written as a plain sentence in Muted inside the same 24px bordered container as the populated state. They explain *why* the data is absent — "The timeline is built after the close, from the session's stored snapshots" — rather than just reporting emptiness.

### Signature Components

**The Logo Plate.** An 80×32 pill in the always-light `logo-plate` colour, holding a brand mark capped at 16px tall and `max-w-full`. Fixed dimensions mean every row in every table and list aligns identically regardless of mark shape. The width cap has a consequence worth knowing: because a mark keeps its aspect ratio, capping a wide wordmark's *width* sets its drawn *height* — square symbols draw the full 16px, while wide lockups come out smaller (ServiceNow, the widest at 6.9:1, draws about 10.5px). Padding is 4px rather than 8px specifically to buy those marks about a pixel of height. Marks are hotlinked from a CDN and can never be vendored; the plate carries `aria-hidden` and the mark an empty `alt`, because the symbol is always stated in adjacent text.

**The Sparkline.** A 96×28 (140px on Market Overview cards) polyline drawn directly from stored intraday snapshots — no chart library, no axes, no fill, no dots. 1.5px stroke in Session Green or Session Red. Fewer than two points renders an em dash rather than an empty box. It carries `role="img"` with an "Trending up/down today" label.

**The Intraday Chart.** Price and volume as two stacked panels sharing a time axis and *nothing else*. They never share a y-axis, and this is a rule rather than a layout preference: a dual-axis chart lets the crossing point of two unrelated scales imply a relationship that is not in the data. Price is a 2px stroke over three hairline gridlines with values in a 64px right gutter; volume is Surface Strong bars on their own baseline and their own scale. The hover readout is a native SVG `<title>` on a transparent hit column — a tooltip with no JavaScript at all.

**The Timeline.** A 2px dot and a 1px Hairline rail drawn per row so the rail terminates cleanly at the final entry. Dot colour encodes kind: Muted for market open and close, Signal Blue for price milestones and volume spikes, Session Green for news. Time is mono, label is Ink/600, detail is Body.

**The AI Summary Card.** The densest panel in the product and the only one with 24px padding. A generation timestamp sits opposite the heading; the narrative runs as relaxed Body prose; bullets sit below a hairline with 6px Signal Blue dots. It closes with a Muted provenance line that names its inputs and states the product's boundary in plain language — "It describes what happened — not why, and not what happens next. Not investment advice." That line is part of the component, not decoration.

## Do's and Don'ts

### Do:

- **Do** define every new colour token in **both** `:root` and `:root[data-theme="dark"]`, then expose it once in `@theme inline`.
- **Do** render every number in JetBrains Mono with `tabular-nums`, and format changes with an explicit `+`/`−` so direction survives without colour.
- **Do** wrap anything with a hard minimum width in `overflow-x-auto`, and check that its flex ancestors carry `min-w-0` — the wrapper alone does nothing.
- **Do** give every chart and sparkline `role="img"` and an `aria-label` that states what it shows, including its range where a range exists.
- **Do** build new panels from the standing pattern: Canvas surface, 1px Hairline border, 24px radius, 20px padding, rows separated by hairlines with `last:border-0`.
- **Do** write an empty state for every list and panel, in Muted, inside the same container as the populated state, explaining why the data is not there yet.
- **Do** keep new work on the server. Sparklines, the intraday chart, thumbnails, and every list are server-rendered; the only client components in the product are the ones that genuinely need browser state (sidebar active link, theme toggle, and the two watchlist menus).
- **Do** attach a plain-language provenance line to any surface that displays model-written text.

### Don't:

- **Don't** give a colour its only definition inside one theme block — it will be missing in the other.
- **Don't** place a real brand mark on a theme-aware surface. Marks go on `logo-plate`, which stays light in both themes; only lettermarks and glyphs may sit on `surface-strong`.
- **Don't** apply Session Green or Session Red to volume, counts, or anything that is not a directional price change. Neutral values stay Ink.
- **Don't** put two unrelated scales on one pair of axes. Stack them as separate panels sharing only time.
- **Don't** use article photography, publisher images, or stock imagery as a thumbnail. Thumbnails are marks: company logo for a per-symbol article, the data provider's mark for market news.
- **Don't** add a shadow to a rest-state component in isolation. Depth is currently tonal; if that changes, the elevation scale gets designed first and applied across the system.
- **Don't** convey gain or loss by colour alone — pair it with the sign, an arrow, or a label.
- **Don't** introduce a client component, an icon package, or a chart library for a purely visual gain. Every one of those was deliberately avoided, and the current set of icons is three hand-drawn SVGs.
- **Don't** set a label in uppercase or add letter-spacing to small text. Tier is communicated by weight and colour in this system, not by case.
