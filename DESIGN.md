---
name: US TechMarket
description: A composed, after-hours reading surface for what happened to US technology stocks today.
colors:
  primary: "#6695ff"
  primary-active: "#8db0ff"
  primary-fill: "#1e5fe0"
  primary-fill-hover: "#1a52c4"
  semantic-up: "#24c98a"
  semantic-down: "#ff6672"
  tint-primary: "#212c45"
  tint-up: "#173432"
  tint-down: "#3a242e"
  accent-edge: "#324674"
  chart-bar: "#5b6577"
  ink: "#f2f4f7"
  body: "#a7afbd"
  muted: "#848c9a"
  backdrop: "#0a0c11"
  canvas: "#141821"
  surface-soft: "#1b2029"
  surface-strong: "#262d39"
  hairline: "#2e3543"
  logo-plate: "#e9ebef"
typography:
  display:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3.25rem)"
    fontWeight: 600
    lineHeight: "1.06"
    letterSpacing: "-0.012em"
  figure:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "clamp(1.75rem, 2.4vw, 2.375rem)"
    fontWeight: 500
    lineHeight: "1.05"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.025em"
  lede:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.55"
    letterSpacing: "normal"
  story:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.375"
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
  micro:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: "inherit"
    letterSpacing: "normal"
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
  panel:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  panel-raised:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.3xl}"
    padding: "24px"
  panel-overlay:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.2xl}"
    padding: "4px 0"
  badge-significant:
    backgroundColor: "{colors.tint-primary}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px 4px 8px"
  badge-normal:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.body}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px 4px 8px"
  change-pill-up:
    backgroundColor: "{colors.tint-up}"
    textColor: "{colors.semantic-up}"
    typography: "{typography.numeric}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  change-pill-down:
    backgroundColor: "{colors.tint-down}"
    textColor: "{colors.semantic-down}"
    typography: "{typography.numeric}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  button-pill:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  button-pill-hover:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.ink}"
  button-fill:
    backgroundColor: "{colors.primary-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  button-fill-hover:
    backgroundColor: "{colors.primary-fill-hover}"
    textColor: "#ffffff"
  tab-track:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    padding: "4px"
  tab-active:
    backgroundColor: "{colors.primary-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  tab-inactive:
    textColor: "{colors.body}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  nav-item:
    textColor: "{colors.body}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.tint-primary}"
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
  table-header:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "12px 20px"
---

# Design System: US TechMarket

## Overview

**Creative North Star: "The After-Hours Desk"**

The market has closed. The numbers have stopped moving, the day is complete, and what is left is a desk with everything laid out on it — settled, recorded, and quiet. That is the room this interface is in, and it explains its two most visible decisions: dark is the *default* theme rather than an option, and nothing on screen ticks, flashes, pulses, or announces itself. A product whose entire premise is "here is what happened today" would be lying with its motion design if it behaved like a live tape.

**There is a lamp on the desk.** The system used to be flat everywhere — tonal layering only, shadow confined to two dropdowns — and it read as a stack of grey rectangles rather than as a surface with objects on it. Depth is now real and systematic: panels are the lighter tone in both themes, they catch light on their top edge, and they cast. That is a change of *material*, not of temperament. The room is still quiet; you can just see the objects in it now. Nothing here is decorated, and the light is doing legibility work rather than atmosphere work — it is what separates a panel from the field behind it, which on a near-black canvas nothing else was achieving.

The voice is **composed, exact, and unhurried**. Density is high — a 20-stock universe, eight-column tables, five stat cells, an intraday chart with two panels — but the pressure is low. Precision is what does the persuading: monospaced tabular numerals so figures align down a column, hairline rules instead of heavy dividers, and an accent colour used so sparingly that its appearance is information. Colour arrives in exactly three places — the gain/loss pair, the reserved accent, and the gradient a session's own chart lays under itself — and never as surface decoration.

**Key Characteristics:**

- Dark-default, two-theme system where every token is defined twice and neither theme is an afterthought.
- Monospaced tabular numerals for every figure in the product, without exception.
- One composed panel material — face gradient, lit top edge, hairline border, elevation step — applied through a single utility, never assembled per component.
- Three elevation steps and no more: resting panel, the one raised element per page, and overlays.
- One reserved accent whose appearance always means "active" or "significant".
- Generous radii (24px containers, full pills) as the only decorative gesture.
- No chart library and almost no client JavaScript — sparklines, the intraday chart, and every thumbnail are server-rendered SVG and markup.
- Browser furniture is themed: selection, scrollbars, focus rings, and underline offset all come from the palette.

## Colors

A near-neutral, blue-shifted greyscale that climbs from a deep page field up to the surfaces on it, carrying three signal colours: one reserved accent and a gain/loss pair that belongs to the session being reported.

**On the two themes.** Dark is the default (`<html data-theme="dark">`), so the frontmatter above carries the dark values as canonical. Every token also has a light counterpart defined in `:root` in `src/app/globals.css`; both values are listed below and machine-readable in `.impeccable/design.json`. Neither theme is a derived tint of the other — they are hand-paired.

### Primary

- **Signal Blue** (`primary`, #6695ff dark / #0052ff light): the only accent in the system, and it is never decoration. It marks the active sidebar item, the Significant badge, the leading rank in Top Movers, inline links, the bullet dots in the AI summary, price-milestone and high-volume markers on the timeline, and the focus ring on every control. If Signal Blue appears, something is active, focused, or crossed a threshold.
- **Signal Blue Active** (`primary-active`, #8db0ff dark / #003ecc light): the pressed and hover state for accent *text*. Note the direction reverses between themes — light goes darker, dark goes lighter, because contrast against the plate is what has to increase, not brightness.
- **Signal Blue Fill** (`primary-fill`, #1e5fe0 dark / #0052ff light): the accent as a *filled plate under white text* — the active news tab and the primary button. It exists because one token cannot serve both jobs: `primary` had to get lighter in dark mode to stay readable *on* a plate, which simultaneously made it too light to sit *under* white text.
- **Signal Blue Fill Pressed** (`primary-fill-hover`, #1a52c4 dark / #0043d6 light): the hover for a filled accent plate, and the one accent token that goes **darker in both themes**. This is the counter-intuitive one and it exists because getting it wrong is invisible until measured: the white-text buttons previously reached for `primary-active`, which in dark is lighter, and their hover state measured **2.15:1** — the worst contrast in the product, on a control nobody thinks to check.

### Secondary

- **Session Green** (`semantic-up`, #24c98a dark / #007a51 light) and **Session Red** (`semantic-down`, #ff6672 dark / #c81d2c light): gains and losses in the session being reported. They colour change values, sparkline and intraday strokes and fills, the breadth bar in the session digest, the market-open dot, and error text in the watchlist menus. They describe a completed day, not a live tape.

  Deliberately *not* applied to volume. The Trading Activity cell and the relative-volume figure in Top Movers stay neutral, because heavy volume is neither good news nor bad and colouring it would assert a judgement the product is not allowed to make.

### Tertiary

Three **tinted plates** — `tint-primary` (#212c45 dark / #e3ecff light), `tint-up` (#173432 / #e3f0ec), `tint-down` (#3a242e / #f9e6e8) — carrying the Significant badge, the active nav item, the leading Top Movers rank, and every change pill. They are the accent and the session pair as a *field* rather than as a line, and they are the only way colour occupies area in this system. A fourth baked token, **Accent Edge** (`accent-edge`, #324674 dark / #aac6ff light), is the 1px inset ring those three accent plates carry.

They are baked flat rather than written as `bg-primary/12`, and that is load-bearing rather than tidy. See The Baked Tint Rule.

### Neutral

The neutral ramp climbs. `backdrop` is the floor, panels sit above it, hover sits above the panel, and chips above that — in **both** themes.

- **Ink** (`ink`, #f2f4f7 dark / #0a0b0d light): headings, ticker symbols, primary values, and anything the eye should land on first.
- **Body** (`body`, #a7afbd dark / #565d6a light): running prose, summaries, secondary figures, inactive navigation and tabs.
- **Muted** (`muted`, #848c9a dark / #616873 light): table headers, cell labels, timestamps, axis labels, provenance notes, and the scrollbar thumb (hovering to Body). The quietest readable tier — and the floor is set by AA, not by taste. Both values moved once a hovered row put muted text on `surface-soft` rather than on `canvas`.
- **Chart Bar** (`chart-bar`, #5b6577 dark / #8a92a0 light): the intraday volume bars, and nothing else. Separate from `surface-strong` because these bars *are* data and so answer to the 3:1 floor for graphical objects, where a decorative surface does not.
- **Backdrop** (`backdrop`, #0a0c11 dark / #eef1f6 light): the `<body>` and `<main>` field every panel sits on. Nothing else uses it.
- **Canvas** (`canvas`, #141821 dark / #ffffff light): the sidebar and every panel, table, list and chart surface.
- **Surface Soft** (`surface-soft`, #1b2029 dark / #f6f8fb light): row hover inside a panel, and the watchlist table's header band.
- **Surface Strong** (`surface-strong`, #262d39 dark / #e7ebf2 light): filled but unaccented chips — the Normal badge, pill buttons, ticker tags, unranked Top Movers positions. It no longer carries the scrollbar thumb: at 1.20:1 light / 1.28:1 dark against canvas the thumb was a UI component below the 3:1 floor, and the only affordance telling an iPad visitor the watchlist table scrolls sideways.
- **Hairline** (`hairline`, #2e3543 dark / #dce1ea light): every 1px border, table rule, grid line, timeline rail, and section rule in the product.

### Named Rules

**The Two-Theme Rule.** Every colour token is defined in both `:root` and `:root[data-theme="dark"]`. A token whose only definition sits inside one block is a bug, not a shortcut — it silently vanishes in the other theme.

**The Climbing Ramp Rule.** A surface that sits *on* another surface is the lighter of the two, in both themes. Dark previously inverted this — the field was #15181d and the panels on it were #0d0f12 — so every card read as a hole and no shadow could rescue it, which is the whole reason the system stayed flat. If a new surface is darker than what it sits on, the depth will not read no matter what shadow is applied.

**The Always-Light Plate Rule.** `logo-plate` (#e9ebef dark / #eef0f3 light) is the one token that does not invert, and this is load-bearing rather than an oversight. Brand marks arrive with hardcoded fills — Apple #000000, Palantir #101113, Amazon #221f1f — that disappear on a dark surface and cannot be recoloured. Real marks sit on this plate; the lettermark fallback and category glyphs use `surface-strong` so their text stays theme-aware.

**The Reserved Accent Rule.** Signal Blue is the only accent, and it carries exactly two meanings: *this is active* and *this is significant*. It is never used to make a surface look more interesting. A decorative dot, tick, or rule in the accent colour is a violation even when it looks good.

**The Baked Tint Rule.** A tinted plate is a flat token, never an alpha (`bg-primary/12`). An alpha composites against whatever happens to be behind it, so the Significant badge measured 4.76:1 at rest and **4.49:1 on a hovered row** — a component whose contrast depended on where the pointer was. The three tints are pre-composited at 16% over canvas in dark and 11% in light, and are therefore fixed wherever they land. `accent-edge` is baked the same way, at 25% over tint-primary, for the same reason — it was the last `ring-primary/25` alpha left in the system.

**The Measured Floor Rule.** A colour pair ships only once its ratio has been computed, in **both** themes: 4.5:1 for text, 3:1 for a graphical object that carries data. Many tokens here are the value they are because the prettier value failed — `muted`, `body` and `semantic-up` in light, `primary` in dark, `chart-bar` at all, and every one of the three tints. Eyeballing a dark theme is what let five pairs ship under AA the first time.

## Typography

**Editorial Font:** Source Serif 4 (with `ui-serif, Georgia, serif`)
**Interface Font:** Inter (with `ui-sans-serif, system-ui, sans-serif`)
**Numeric Font:** JetBrains Mono (with `ui-monospace, monospace`)

**Character:** Three faces, each with one job, and the split between them is the clearest statement the system makes about what this product is.

The pairing used to be Inter and JetBrains Mono alone, described here as "deliberately plain… no stylistic opinion". That was the weakness, not the restraint: Inter is the most common interface face on the web, and a product with no typographic opinion reads as a template of itself.

**Source Serif 4 carries the words.** The reasoning is about what the product does. It does not trade, does not tick, and does not advise — its output is written prose, a daily narrative and summarised news, produced after the close and read once. It is far nearer a financial paper's evening edition than a terminal, and terminal typography would actively misrepresent it by implying that something is still moving. A serif for the words against a grotesque for the instruments is the newspaper structure, and it says *read, edited, considered* — which is this product's whole claim, and precisely what a competitor optimising for a confident prediction cannot honestly say. Source Serif 4 specifically because it is drawn for reading on screens and is sober rather than mannered; a fashionable high-contrast display serif would have dated the product inside a year.

**Inter carries the interface** — labels, tables, navigation, badges, buttons, empty states — where neutrality is the virtue and scanning beats voice. **JetBrains Mono carries every figure** with tabular numerals, so a column of prices, percentages and volumes forms a grid rather than a ragged list.

### Hierarchy

- **Display** (Source Serif 4, 600, `clamp(2.25rem, 4vw, 3.25rem)`, tracking −0.012em, leading 1.06): the one `h1` per page — "What happened to your stocks today", "News", and both error pages — applied through the `page-title` utility rather than reassembled per file. The price on Today's Activity is set at the same step in mono and keeps the `--text-display` token's own −0.03em.

  **Its tracking and leading differ from the token on purpose.** −0.03em was tuned for Inter, and a serif does not want it: the serifs already do the optical work that tight tracking does for a grotesque, so the number that reads as composed on Inter reads as cramped here. The extra leading is for the larger x-height and the descenders.

  Today's Activity is the one page whose `h1` is *not* display serif — it is a ticker symbol, an identifier the machine measured rather than a phrase somebody wrote, so it stays in Inter. See The Written-And-Measured Rule.
- **Figure** (JetBrains Mono, 500, `clamp(1.75rem, 2.4vw, 2.375rem)`, tracking −0.02em): the Market Overview index levels. The size a number should be in a product whose content is numbers.
- **Headline** (600, 1.875rem/30px, tracking −0.025em): the ticker symbol on Today's Activity, which is simultaneously the page title and the button that opens the stock switcher — it is a control. The five stat readings below it are set at the same step in JetBrains Mono at 500, which is a different role at one size rather than a collision: the face and the weight are what separate them, and they sit in different regions of the page.
- **Title** (600, 1.25rem/20px, tracking −0.025em): every section heading — Market Overview, My Watchlist, Top Movers Today, AI Daily Summary, Price & Volume, Today's Timeline, Upcoming Events.
- **Lede** (400, 1.125rem/18px, line-height 1.55): the AI daily narrative, and nothing else. It is the single thing the whole pipeline exists to produce and it is the only prose in the product set above body size. It was 20px, which read as shouty rather than as the centrepiece and collided with `title`'s step — the card already outranks its neighbours through elevation, the accent wash and its two-column split, so the type does not have to carry that job as well. **Its size is set in two places that must move together**: the paragraph, and the grid track measuring it. See The Measure-On-The-Text Rule.
- **Story** (Source Serif 4, 600, 1rem/16px, leading snug): an article headline, on the News page and in the Home teaser alike. It is one role on both surfaces — the same three articles should not change size and face between two screens, which they used to.
- **Body** (400, 0.875rem/14px, line-height 1.625 in prose): article summaries, summary bullets, cell detail lines, company names. **Inter, not the serif**, and the boundary is deliberate: at 14px on a near-black canvas a serif's thin strokes thin out further, and the default theme is dark. The editorial voice stops at 16px.
- **Label** (600, 0.75rem/12px): table column headers, badge text, menu group headers. Uppercase is *not* used — labels are set in sentence case and rely on weight and colour for their tier.
- **Numeric** (JetBrains Mono, 500, tabular figures): every price, change, percentage, volume, relative volume, rank, timestamp and axis label. Sizes run from Micro on chart axes to Display on the Today's Activity price. The watchlist Price column is set one step above its neighbours (1rem) because it is what the row is about.
- **Micro** (600, 0.6875rem/11px, `text-micro`): cell labels, ticker chips, the index-card proxy notes, the session date, the lettermark fallback, and — set in JetBrains Mono rather than Inter — the intraday chart's axis labels. It is a real token rather than an arbitrary value: it was spelled as an 11px literal in ten places across six files, which made it a ramp step nothing could change. **It deliberately carries no line-height**, matching the literals it replaced; the leading at every one of those sites is inherited. Giving it an explicit one is an improvement worth making, and worth making with a browser open, because it moves ten line boxes.

### Named Rules

**The Written-And-Measured Rule.** The three faces divide by provenance, and the rule states in one line: **what somebody or something *wrote* is set in the serif; what the machine *measured* is set in Inter or in mono.**

Serif, therefore: page titles, article headlines, and the AI daily narrative. Inter: every label, table header, badge, button, nav item, tab and empty state — interface copy is interface, however carefully it is written. Mono: every figure.

Two consequences that look like exceptions and are not. Today's Activity's `h1` is a ticker symbol, so it is Inter — an identifier, not a phrase. And the AI summary's own heading is Inter while the narrative beneath it is serif, because "AI Daily Summary" is a label naming a thing and the paragraph is the thing.

The boundary has one practical floor: **the serif stops at 16px.** Article summaries and summary bullets are prose and would qualify on provenance, but they sit at 14px, and on the near-black default canvas a serif's thin strokes lose too much there. Legibility on dark wins over the taxonomy.

**The Mono Numerals Rule.** Every number that is *data* renders in JetBrains Mono with `tabular-nums` — a figure set in Inter is a defect, because it breaks column alignment and severs the visual promise that numbers here are measured rather than written.

The rule used to say "every number, no exceptions", and read that way it is wrong in its own terms. A numeral inside a sentence — "Pick up to 10 of the Top 20", "3 articles, 1 upcoming event", "remove one to go below 10" — is precisely a number that *is* written rather than measured, it sits in no column, and setting it in mono makes a sentence stutter. **The test is whether the figure is scanned or read.** A price, a change, a volume, a rank, a timestamp, an axis label and a counter checked against a cap are scanned, and take mono. The watchlist counters — "Edit watchlist (7/10)" and the switcher's "Watchlist (7/10)" — are counters, so they are mono and tabular, which also stops the control resizing as the count crosses from 9 to 10. Numerals inside running prose stay in Inter.

**The Signed Value Rule.** Change values always carry an explicit `+` or `−` (U+2212, not a hyphen) and are formatted from the absolute value. Direction is therefore legible without colour, which is what keeps the change columns usable for a colour-blind reader.

**The Dark-Compensation Rule.** Dark is the default theme, and both themes shipped byte-identical type metrics. Light-on-dark bleeds — the glyph spreads optically into the field, closing counters and tightening the gaps between letters — so a setting that reads as composed on white reads as slightly clotted on near-black.

The compensation is confined to `lede`: the AI narrative is the one passage long enough for the effect to accumulate, and the only prose set at 20px/400. In dark it takes +0.003em of tracking and 1.59 leading against 1.55. Both are below conscious notice on a single line, which is the point — the two themes should read the same, and that is what they were not doing. **Weight is deliberately left alone**: one step up is the conventional third axis, but 500 would put the narrative at the same weight as the figures around it and cost more in voice than it buys in legibility.

The rule lives unlayered in `globals.css` so it beats the layered `leading-` utility on the element. Change the base leading in the component and the dark value in the stylesheet together, or the themes drift.

**The Measure-On-The-Text Rule.** A `ch` cap belongs on the element whose font size it is meant to describe, never on a wrapper. `ch` resolves against the element's *own* font size, so `max-w-[16ch]` on a 16px wrapper containing a 52px heading yields about 270px and shatters the heading into one-word lines.

**This shipped twice.** The second time was a grid track: the AI summary's narrative column was declared `minmax(0,58ch)` on a container inheriting 16px while the paragraph inside it is 20px, so the passage rendered at 58 × 16/20 = **46 characters**, a fifth narrower than the 58 it asks for. Note the arithmetic is exact whatever the face, because the `ch` width cancels out of the ratio — which is what makes this class of bug worth a rule rather than an eyeball.

Where the measure genuinely has to live on a container — a grid track cannot be moved onto the text — **tell the container what size it is measuring**: the summary's grid now carries `text-xl`, styling nothing (every child sets its own size) and existing only so `58ch` resolves against the type it describes.

## Layout

**Shell.** A fixed 240px sidebar (`w-60 shrink-0`) in Canvas with a hairline right border and an `elev-2` cast to the right, and a flexible `<main>` in Backdrop. `min-w-0` on `<main>` is load-bearing: a flex item defaults to `min-width: auto`, so without it the 880px watchlist table pushes the entire page sideways instead of scrolling inside its own wrapper. The sidebar holds the wordmark, the theme toggle, and three nav items; there is no secondary tab bar anywhere in the product.

**Content column.** Every page uses the same container: `max-w-[1200px]`, centred, with 24px horizontal padding rising to 40px at `lg`, and 32px vertical padding. Nothing is full-bleed.

**Page headers.** Home and News open with a two-part header: the display heading and its one supporting line on the left, and a right-hand element that answers the heading — the session digest on Home, the article count on News. Below `lg` these stack and the right-hand element goes full width.

**Section rhythm.** Home and Today's Activity separate major sections by 40px; News uses 24px because its tab row and list read as one unit. Within a section, the heading sits 16px above its content. Panels carry 20px of internal padding, rising to 24–32px on the AI summary card.

**Grids.** Card rows — the five Market Overview cells and the five Today's Activity stat cells — run `1 → 2 (sm) → 3 (lg) → 5 (xl)`. Paired panels at the foot of Home and Today's Activity run `1 → 2 (lg)`. The AI summary splits `1 → [58ch | 1fr] (lg)`. Breakpoints are Tailwind's `sm` 640px, `lg` 1024px, `xl` 1280px.

**Density.** Table rows are 20px × 16px per cell; list rows are 20px all round. This is a dense product by intent, and the padding is what keeps density from becoming pressure.

**Device targets.** Laptop and iPad, at every width from 768px up. Phone widths (~390px) are a known unsupported case: content inside `<main>` has minimums below which it cannot shrink, and fixing it means giving the sidebar a collapse behaviour, which is an unmade design decision rather than a bug.

### Named Rules

**The Scrolling Island Rule.** Anything with a hard minimum width — the 880px watchlist table, the 560px intraday chart — lives inside its own `overflow-x-auto` container and scrolls internally. The page body never scrolls horizontally. A wrapper alone does not achieve this; the flex ancestor must also carry `min-w-0`, or the wrapper is dead code and the page widens anyway.

**A scrolling island must say that it scrolls.** The mechanism was correct and silent: at iPad portrait the content column is 480px against an 880px table, so five of eight columns sat off screen behind a scrollbar measuring 1.20:1 that iPadOS hides entirely until a scroll is already under way. Each island now carries a Muted line naming what is off to the right, and the line is gated to the width where scrolling is genuinely happening — computed, not guessed: content is `min(1200, viewport − 240) − padding`, which puts the table's threshold at 1200px of viewport and the chart's at 888px. Two different numbers, so two different breakpoints, rather than one approximation covering both. The line belongs *outside* the scrolling container: a block child of an `overflow-x-auto` element is laid out in the scrollable coordinate space and slides out of view exactly when it becomes relevant.

**The One Container Rule.** Every page opens with the same `max-w-[1200px]` column and the same padding. A page that sets its own width is drifting.

**The Filled Right Rule.** A full-width container whose content is capped at a reading measure has a second column's worth of empty space in it, and the emptiness reads as unfinished rather than as restraint. Three surfaces were rebuilt for this: the Home header gained the session digest, the AI summary card runs narrative and bullets side by side, and every news row moved its timestamp and tickers into a right-hand column. If a measure cap leaves a third of a panel blank, the panel wants a second column, not a wider measure.

## Elevation & Depth

Depth is **real, systematic, and carried by four things at once**: the neutral ramp (a panel is lighter than its field), a face gradient, a lit top edge, and a cast shadow. No component composes these itself — they live in the `panel` utility and its two siblings, and that is the only place they are assembled.

The reason all four are needed is the dark theme. A cast shadow on a #0a0c11 field has almost nothing to darken, so in dark the **lit top edge does at least half the work** of separating a panel from the page, and the face gradient supplies the rest. In light the shadow reads directly and the gradient is nearly nothing. This is why the two themes carry visibly different shadow alphas — 5–18% in light, 45–70% in dark — rather than one scale reused.

Three steps, and there is no fourth:

- **Resting** (`elev-1`) — every panel, table, list, chart frame, and empty state.
- **Raised** (`elev-2`) — the sidebar rail, and **the one element per page that outranks its neighbours**, which in practice is only the AI Daily Summary card.
- **Overlay** (`elev-3`) — the watchlist picker and the symbol switcher, which float over the page and must detach from it completely.

### Shadow Vocabulary

- **Elevation 1** (light `0 1px 2px rgb(15 23 42 / 0.05), 0 4px 12px -2px rgb(15 23 42 / 0.07)` · dark `0 1px 2px rgb(0 0 0 / 0.45), 0 4px 14px -3px rgb(0 0 0 / 0.5)`): resting panels.
- **Elevation 2** (light `0 2px 4px rgb(15 23 42 / 0.05), 0 14px 30px -8px rgb(15 23 42 / 0.11)` · dark `0 2px 6px rgb(0 0 0 / 0.5), 0 16px 34px -10px rgb(0 0 0 / 0.6)`): the page's one raised element, and the sidebar.
- **Elevation 3** (light `0 4px 8px rgb(15 23 42 / 0.06), 0 26px 50px -12px rgb(15 23 42 / 0.18)` · dark `0 6px 12px rgb(0 0 0 / 0.55), 0 30px 60px -14px rgb(0 0 0 / 0.7)`): floating menus.
- **Lit Edge** (`--edge-lit`, light `inset 0 1px 0 rgb(255 255 255 / 0.9)` · dark `inset 0 1px 0 rgb(255 255 255 / 0.07)`): composed into all three, always first in the `box-shadow` list.
- **Surface Face** (`--surface-face`): a vertical gradient across the panel's top — in dark, canvas mixed 12% toward white, resolving to flat canvas by 140px; in light, white resolving toward a 4% mix of backdrop.

### Named Rules

**The One Material Rule.** Panels are built by applying `panel`, `panel-raised`, or `panel-overlay` — never by hand-assembling `bg-canvas border border-hairline rounded-3xl shadow-…`. The material was previously reassembled in sixteen components, which is why nothing could be changed system-wide. A component that inlines the recipe is drift even when the result looks identical.

**The One Raised Element Rule.** At most one thing per page sits at `elev-2` (the sidebar excepted, since it is shell rather than content). The scale exists to say *this outranks its neighbours*; two raised elements on one page say nothing.

**The Two-Channel Depth Rule.** Never add a cast shadow without checking the tonal relationship underneath it. If the surface is not lighter than its field, the shadow is decoration and the depth will not read.

## Shapes

The form language is **rounded rectangles and pills, with no other geometry**. There are no angles, no clipped corners, no dividers with weight, and no decorative shapes anywhere in the product.

Radius maps directly to what a thing *is*:

- **Full pill** (9999px) — anything that is a token of state or identity: Significant/Normal badges, change pills, ticker chips, pill buttons, news tabs and their track, logo plates, rank plates, status dots, timeline dots, the scrollbar thumb (Muted, hovering to Body).
- **24px** — every container: panels, tables, lists, the AI summary, the chart frame, empty-state blocks.
- **16px** — floating menu surfaces.
- **12px** — interactive rows and inline message blocks inside menus, and the symbol switcher's own trigger.
- **8px** — the smallest interactive affordances: sidebar nav items and the theme toggle.
- **2px** — intraday volume bars, the only radius that exists for optical reasons rather than semantic ones.

Borders are always exactly 1px in Hairline. Icons are stroked at 1.5–1.75px with round caps and joins, drawn inline as SVG at 18–20px; there is no icon library and the entire set is a sun, a moon, a chevron, and the three-bar wordmark glyph.

### Named Rules

**The Pill-For-Tokens Rule.** If it is a token — a small object standing for a state, a category, or an identity — it is a full pill. If it is a container, it is 24px. There is no in-between case at container scale.

## Components

### Buttons

- **Shape:** full pill (9999px) for standalone actions; 8px for navigation rows.
- **Pill button:** Surface Strong plate, Ink text, 600 weight, 8px × 16px padding — the "Edit watchlist (7/10)" trigger. It states its own count, so the cap is legible before the menu opens.
- **Filled button:** Signal Blue Fill under white text, with `elev-1`. Hover moves to Signal Blue Fill Pressed — **darker**, in both themes.
- **Hover / Focus:** `transition-colors` only. Pill buttons move Surface Strong → Hairline; menu rows move transparent → Surface Soft with Body → Ink text. Nothing scales or lifts.
- **Icon button:** 32px square, 8px radius, Body icon at 18px, Surface Soft plate on hover — the theme toggle.
- **Disabled:** `opacity-50` with `cursor-not-allowed`, on menu rows and on the `+`/`−` controls alike. This was `opacity-30` on the controls, which resolved to 1.51:1 light / 1.58:1 dark — invisible, on the state that was supposed to be communicating the watchlist floor (1) and cap (10). At 50% it measures 2.08:1 / 2.26:1: recessive, as a disabled control should be, but distinguishable from the 5.24:1 enabled glyph beside it. **A dimmed control is never the whole message.** It cannot state a reason, and `disabled` also drops a button out of the tab order, so both menus name the bound in words in their group headers.

### Chips

- **Badge (Significant):** Tint Primary plate, Signal Blue text, a 1px inset Accent Edge ring, and a 6px accent dot before the label.
- **Badge (Normal):** Surface Strong plate, Body text, a Muted dot. Both badges are the same size and shape so a column of them scans, and they differ in fill, in dot colour, and in the word itself — the last of which is the one that does not depend on sight at all. The ring was previously counted as a channel here; it measures 1.45:1 light / 1.50:1 dark against its own plate, so it is an edge rather than a signal and nothing should be built on it being read.
- **Change pill:** Tint Up / Tint Down plate carrying the signed change in mono. This is the only place a directional figure is set on a field rather than as loose coloured text: the Market Overview cells and the Today's Activity header price.
- **Ticker chip:** Surface Strong, Body text, 11px/600, 2px × 10px padding. Up to four per article.
- **News tab:** full pill, 8px × 16px, inside a Canvas track with 4px padding and `elev-1`. Active is a solid Signal Blue Fill with white text; inactive is Body text on nothing, hovering to Surface Soft.

### Cards / Containers

- **Built by:** `panel` / `panel-raised` / `panel-overlay`. See The One Material Rule.
- **Corner Style:** 24px (16px for overlays).
- **Border:** 1px Hairline on all sides.
- **Internal Padding:** 20px standard; 24–32px on the AI summary card; 20px × 16px per table cell.
- **Internal rules:** rows inside a container are separated by a bottom hairline with `last:border-0`, so the container's own border is never doubled.
- **Row hover:** Surface Soft, `transition-colors`, **only where the row is actually interactive**. Market Overview's cells have no hover because nothing in them responds to a click.

### Inputs / Fields

The product has no text inputs, no forms, and no search. Every interaction is a button, a link, or a menu row. **Do not invent an input style** — if one becomes necessary, it should be designed against this system rather than borrowed from a default.

### Navigation

- **Sidebar:** three items, 8px radius, 14px/500. Inactive is Body text on transparent, hovering to Surface Soft with Ink text. Active is a Tint Primary plate with Signal Blue text and a 1px inset accent ring — plate, ring *and* colour.
- **Wordmark:** "US TechMarket" at 18px/600, tracking-tight, preceded by a three-bar glyph in stepped accent opacities (40 / 70 / 100%). It is the product's only mark of its own, on a page otherwise full of other companies' logos.
- **Section headings:** a Title-scale heading, a hairline rule running from it to the right, and an optional Muted meta at the end of the rule. Built once in `section-heading.tsx`; eight sections previously carried three different ad-hoc versions of this.
- **Empty states:** every list and panel has one, written as a plain sentence in Muted inside the same panel as the populated state. They explain *why* the data is absent — "The timeline is built after the close, from the session's stored snapshots" — rather than just reporting emptiness.

### Signature Components

**The Logo Plate.** An 80×32 pill in the always-light `logo-plate` colour, holding a brand mark capped at 16px tall and `max-w-full`. Fixed dimensions mean every row in every table and list aligns identically regardless of mark shape. The width cap has a consequence worth knowing: because a mark keeps its aspect ratio, capping a wide wordmark's *width* sets its drawn *height* — square symbols draw the full 16px, while wide lockups come out smaller (ServiceNow, the widest at 6.9:1, draws about 10.5px). Padding is 4px rather than 8px specifically to buy those marks about a pixel of height. Marks are hotlinked from a CDN and can never be vendored; the plate carries `aria-hidden` and the mark an empty `alt`, because the symbol is always stated in adjacent text. **Known failure mode:** an unreachable CDN renders every plate blank and silently, because `alt=""` suppresses even the broken-image glyph. There is no in-app fallback, and adding one would require a client component.

**The Sparkline.** A 96×28 (140×36 on Market Overview) polyline drawn directly from stored intraday snapshots — no chart library, no axes, no dots except one. 1.5px stroke in Session Green or Session Red, over a gradient area fill closed to the baseline, with a 2px dot marking the session's close. Fewer than two points renders an em dash rather than an empty box. It carries `role="img"` with a label stating direction, open, close, session low and high.

**The Session Digest.** The right half of the Home header, and the page's one-glance answer to its own heading: market state and session date, a breadth bar splitting the tracked universe into advancing and declining with both counts written out, then a two-row ledger — how many crossed the significance rule, and which stock moved furthest. Every figure is a count or a max over tickers the page already fetched; it adds no query.

**The Intraday Chart.** Price and volume as two stacked panels sharing a time axis and *nothing else*. They never share a y-axis, and this is a rule rather than a layout preference: a dual-axis chart lets the crossing point of two unrelated scales imply a relationship that is not in the data. Price is a 2px stroke over three hairline gridlines with values in a 64px right gutter, carrying the same gradient fill as the sparklines and a ringed dot at the last reading; volume is Chart Bar columns on their own baseline and their own scale. The hover readout is a native SVG `<title>` on a transparent hit column — a tooltip with no JavaScript at all.

**The Timeline.** A 2px dot ringed 4px in Canvas, on a 1px Hairline rail drawn per row so the rail terminates cleanly at the final entry. Dot colour encodes kind: Muted for market open and close, Signal Blue for price milestones and volume spikes, Ink for news. Time is mono, label is Ink/600, detail is Body.

**The AI Summary Card.** The densest panel in the product and the only one at `elev-2`. A generation timestamp sits opposite the heading; a single low-alpha radial wash of the accent bleeds in from the top-left corner at `-z-10` — the one authored surface in the system, and it appears exactly here. From `lg` the body runs two columns: the narrative at Lede scale on a 58ch measure, and the bullets beside it behind a left hairline, each with a 6px Signal Blue dot. It closes with a full-width rule and a Muted provenance line that names its inputs and states the product's boundary in plain language — "It describes what happened — not why, and not what happens next. Not investment advice." That line is part of the component, not decoration.

## Do's and Don'ts

### Do:

- **Do** build every container with `panel`, `panel-raised`, or `panel-overlay`, and add the elevation, face and lit edge nowhere else.
- **Do** define every new colour token in **both** `:root` and `:root[data-theme="dark"]`, then expose it once in `@theme inline`.
- **Do** bake a tinted plate as a flat token rather than writing it as an alpha, so its contrast does not change with whatever sits behind it.
- **Do** check that a surface is *lighter* than the field it sits on before adding a shadow to it.
- **Do** render every number in JetBrains Mono with `tabular-nums`, and format changes with an explicit `+`/`−` so direction survives without colour.
- **Do** put a `ch` measure on the element whose font size it describes, never on a wrapper.
- **Do** give a right-hand column to any full-width panel whose content is capped at a reading measure.
- **Do** wrap anything with a hard minimum width in `overflow-x-auto`, and check that its flex ancestors carry `min-w-0` — the wrapper alone does nothing. Then tell the visitor it scrolls, at the widths where it does.
- **Do** state a bound in words wherever a control is disabled to enforce it. A dimmed control shows that something is unavailable and can never say why, and `disabled` removes it from the tab order as well.
- **Do** give a headline a heading element when it is the content. Every article row on News is an `h2`; the page previously carried one heading for sixty articles.
- **Do** give every chart and sparkline `role="img"` and an `aria-label` that states what it shows, including its range where a range exists.
- **Do** let the global `:focus-visible` rule in `globals.css` supply the focus ring, and never remove an outline without authoring a replacement.
- **Do** mark the current item with `aria-current="page"` wherever an active state is drawn, and give a status or error message `role="status"`.
- **Do** theme the browser's own surfaces from the palette — selection, scrollbar, focus ring, underline offset — when adding anything new that exposes one.
- **Do** write an empty state for every list and panel, in Muted, inside the same panel as the populated state, explaining why the data is not there yet.
- **Do** keep new work on the server. The only client components in the product are the ones that genuinely need browser state (sidebar active link, theme toggle, and the two watchlist menus).
- **Do** attach a plain-language provenance line to any surface that displays model-written text.

### Don't:

- **Don't** give a colour its only definition inside one theme block — it will be missing in the other.
- **Don't** reassemble the panel recipe inline. If it needs a variant, add one to the utility.
- **Don't** raise a second element to `elev-2` on a page that already has one.
- **Don't** reach for `primary-active` on a plate that carries white text. That is `primary-fill-hover`, and the distinction is worth 4.7:1.
- **Don't** place a real brand mark on a theme-aware surface. Marks go on `logo-plate`, which stays light in both themes.
- **Don't** apply Session Green or Session Red to volume, counts, or anything that is not a directional price change. Neutral values stay Ink or Muted.
- **Don't** use the accent as decoration — a tick beside a heading, a rule under a section, a dot for rhythm. It means *active* or *significant* and nothing else.
- **Don't** give a hover state to something that is not interactive.
- **Don't** put two unrelated scales on one pair of axes. Stack them as separate panels sharing only time.
- **Don't** use article photography, publisher images, or stock imagery as a thumbnail. Thumbnails are marks: company logo for a per-symbol article, the data provider's mark for market news.
- **Don't** convey gain or loss by colour alone — pair it with the sign, an arrow, or a label.
- **Don't** introduce a client component, an icon package, or a chart library for a purely visual gain.
- **Don't** set a label in uppercase or add letter-spacing to small text. Tier is communicated by weight and colour in this system, not by case.
- **Don't** let a reason internal to the build ("free tier rejects index symbols") reach user-facing copy. State the fact the visitor needs, not why we had to.
