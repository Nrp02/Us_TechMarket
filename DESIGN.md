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
  weather: "#1a4fc4"
  tint-primary: "#1d2d4e"
  tint-up: "#173145"
  tint-down: "#292943"
  accent-edge: "#2f477a"
  chart-bar: "#7c8dab"
  ink: "#f2f4f7"
  body: "#aeb7c8"
  muted: "#9ca6b9"
  backdrop: "#01040c"
  canvas: "#16243f"
  surface-soft: "#1c2f52"
  surface-strong: "#2b3f6c"
  hairline: "#25395e"
  edge-strong: "#6b80ad"
  logo-plate: "rgb(226 230 237 / 0.85)"
  glass-rail: "rgb(7 17 40 / 0.34)"
  glass-panel: "rgb(15 30 60 / 0.34)"
  glass-raised: "rgb(24 43 78 / 0.34)"
  glass-overlay: "rgb(14 28 56 / 0.82)"
  glass-control-hover: "rgb(34 56 98 / 0.52)"
  glass-edge: "rgb(150 190 255 / 0.07)"
  solid-rail: "#142038"
  solid-raised: "#192845"
  solid-overlay: "#101e39"
  solid-logo-plate: "#c3c9d3"
typography:
  display:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3.25rem)"
    fontWeight: 600
    lineHeight: "1.06"
    letterSpacing: "-0.012em"
  figure:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: "1.05"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
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
    lineHeight: "1.59"
    letterSpacing: "0.003em"
  story:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.375"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
  micro:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
rounded:
  container: "24px"
  overlay: "16px"
  row: "12px"
  nav: "8px"
  pill: "9999px"
spacing:
  shell: "24px"
  section: "24px"
  panel-x: "20px"
  panel-y: "16px"
  cell: "12px"
components:
  panel:
    backgroundColor: "{colors.glass-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "16px 20px"
  panel-raised:
    backgroundColor: "{colors.glass-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "16px 20px"
  panel-overlay:
    backgroundColor: "{colors.glass-overlay}"
    textColor: "{colors.body}"
    rounded: "{rounded.overlay}"
    padding: "4px"
  panel-rail:
    backgroundColor: "{colors.glass-rail}"
    textColor: "{colors.body}"
    rounded: "{rounded.container}"
    padding: "8px 16px"
    height: "62px"
  panel-control:
    backgroundColor: "{colors.glass-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  panel-control-hover:
    backgroundColor: "{colors.glass-control-hover}"
  panel-chip:
    backgroundColor: "{colors.glass-panel}"
    textColor: "{colors.body}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  nav-item:
    textColor: "{colors.body}"
    rounded: "{rounded.nav}"
    padding: "12px 12px"
    height: "44px"
  nav-item-active:
    backgroundColor: "{colors.tint-primary}"
    textColor: "{colors.primary-active}"
    rounded: "{rounded.nav}"
  button-primary:
    backgroundColor: "{colors.primary-fill}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-fill-hover}"
  badge-significant:
    backgroundColor: "{colors.tint-primary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  badge-normal:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.body}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  menu-row:
    textColor: "{colors.body}"
    rounded: "{rounded.row}"
    padding: "8px 12px"
  menu-row-selected:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.primary-active}"
    rounded: "{rounded.row}"
---

# Design System: US TechMarket

## Overview

**Creative North Star: "Midnight Glass"**

The market has closed. The numbers have stopped moving, the day is complete, and what is left is a desk under a window at night — panes of frosted glass laid over a sky that has weather in it. That room explains every decision below: there is **one theme** and it is a night, the surfaces are **translucent rather than painted**, and almost nothing moves. A product whose entire premise is "here is what happened today" would be lying with its motion design if it behaved like a live tape.

The atmosphere is authored in exactly one place — two banks of fractal cloud over near-black, in `night-sky.tsx` — and everything else in the product is a pane in front of it. That is the whole material idea, and it is what replaced an earlier system of flat tonal rectangles: a panel now sits at 4.5× the luminance of unlit sky and 15.3× that of a lit cloud, and it is the *range*, not any single value, that makes the material read as glass. The consequence is a discipline: a pane's face is a range, so every colour pair in the product is measured at the brightest end of it.

Nothing here is decorated. The light does legibility work — it is what separates a pane from the field behind it — and it has a direction, the same upper-left the clouds are lit from. Colour is rationed hard: blue is either *state* (on a surface) or *weather* (behind glass), and the two are kept in different files so they cannot blur together.

**Key Characteristics:**
- One theme. A midnight sky with frosted glass over it; no daylight counterpart exists or is wanted.
- Translucent surfaces over authored weather — never flat plates with a blue idea behind them.
- Exactly one translucent layer in any stack: the pane's own face. Everything nested inside it is baked opaque.
- Two type voices: a serif for what was *written*, a grotesque and a mono for what was *measured*.
- Motion is arrival, never recurrence. A line draws itself once; nothing loops except the stars.
- Every contrast pair measured at the worst-case composite, not estimated.

## Colors

A near-black sky with almost no red in it, weather painted over it in deep blue, and a single light periwinkle accent that only ever means *active* or *significant*.

### Primary

- **Signal Blue** (`primary`): the only accent in the system. It marks the Significant badge, the leading rank in Top Movers, inline links, the bullets in the AI summary, price-milestone and high-volume markers on the timeline, and the focus ring on every control. If Signal Blue appears as a token, something is active, focused, or crossed a threshold.
- **Signal Blue Active** (`primary-active`): accent *text that has to sit on an accent or raised plate*. It exists because adding accent to a plate pulls the plate toward the very text it must contrast with — `primary` on `surface-strong` measures 3.60:1 and fails, `primary-active` measures 4.82:1 and passes. Used on the active nav item, the active news tab, the selected row in every dropdown.
- **Signal Blue Fill** (`primary-fill`): the accent as a *filled plate under white text* — the skip link and the not-found action. Measured 5.57:1 for white on it. `primary` cannot do this job; it had to get light enough to read *on* a plate, which made it too light to sit *under* white text.
- **Signal Blue Fill Pressed** (`primary-fill-hover`): the hover for a filled accent plate, and the one accent token that goes **darker**. Reaching for `primary-active` on a white-text plate once measured 2.15:1 — the worst contrast in the product, on a control nobody thinks to check.

### Secondary

- **Weather Blue** (`weather`): the deep blue of the clouds, and the one token that is *light rather than state*. It exists in CSS for a single surface — the AI Summary Card's corner glow — which is the one element in the DOM that has to catch the same light the sky is lit by. It is hand-paired with the cloud gradient's body stop, because nothing can derive a value across the SVG boundary. At 22% it lifts a surface by −1/+6/+22: a colour change the eye reads as light, at almost no cost to the text sitting in it.

### Tertiary

- **Session Green** (`semantic-up`) and **Session Red** (`semantic-down`): gains and losses in the session being reported. They colour change values, sparkline and intraday strokes and fills, the breadth bar in the session digest, the market-open dot, and error text in the watchlist menus. They describe a completed day, not a live tape.
- **Three tinted plates** — `tint-primary`, `tint-up`, `tint-down` — carrying the Significant badge, the active nav item, the leading Top Movers rank, and every change pill. They are the accent and the session pair as a *field* rather than as a line, and they are the only way colour occupies area inside a panel. **Accent Edge** (`accent-edge`) is the 1px inset ring those plates carry.

### Neutral

- **Ink** (`ink`): headings, ticker symbols, primary values, and anything the eye should land on first.
- **Body** (`body`): running prose, summaries, secondary figures, inactive navigation and tabs. Measures 6.6:1 against the brightest panel face in the product.
- **Muted** (`muted`): table headers, cell labels, timestamps, axis labels, provenance notes, and the scrollbar thumb (hovering to Body). The quietest readable tier, at 5.5:1. Both tiers carry more blue than a neutral grey would: on a field this saturated, grey reads as *washed* rather than as quiet — the secondary tiers have to be made of the room's own light too.
- **Chart Bar** (`chart-bar`): the intraday volume bars, and nothing else. Separate from `surface-strong` because these bars *are* data and answer to the 3:1 floor for graphical objects, where a decorative surface does not.
- **Backdrop** (`backdrop`): the sky's base. Almost black, holding a near-pure blue cast (1/4/12 — red is effectively absent). Every trace of colour in the sky comes from the weather painted over this, never from the base: empty sky is meant to read as empty.
- **Canvas** (`canvas`): *not a colour anyone picked.* It is `glass-panel` composited over the brightest cloud a panel can sit in front of — see The Worst-Case Composite Rule. It does three jobs: it is what baked tints are computed over, what the reduced-transparency fallback paints, and the number the contrast harness measures against.
- **Surface Soft** / **Surface Strong** (`surface-soft`, `surface-strong`): surfaces *inside* a panel — row hover, the watchlist header band, lettermark plates, selected menu rows. Both opaque, both baked over Canvas, and both climbing in **blue** rather than in grey: a neutral step over a blue face reads as dirt on the glass.
- **Hairline** (`hairline`): internal rules only — table dividers, grid lines, the timeline rail, section rules. Solid, because it always lands on a known panel face. Distinct from `glass-edge`, which is the lit rim of the glass itself and has to composite over whatever is behind it.
- **Edge Strong** (`edge-strong`): the glass rim as a *drawn* line, for `prefers-contrast: more`. Measured 3.27:1 against the panel face, where `glass-edge` is deliberately below the threshold of notice.
- **Logo Plate** (`logo-plate`): frosted, deliberately light, and the one object that must not darken. Brand marks arrive with hardcoded fills — Apple #000000, Palantir #101113, Amazon #221f1f — that vanish on anything dark and cannot be recoloured.

### Named Rules

**The Worst-Case Composite Rule.** Glass is alpha over a field that varies, so a pane's face is a **range**, not a value. Every contrast pair in the product is measured at the bright end of that range; if it passes there, every pixel elsewhere passes. `canvas` *is* that bright end, and the peak behind it is **measured off the rendered page**, not modelled — a stack of radial gradients can be composited on paper, a seeded fractal cannot. Re-take it after any change to the weather. It has caught a real regression once: spreading the cloud masses to the frame edges raised the peak past its own model and five pairs failed the moment the true number was fed back in.

**The Two Blues Rule.** Blue does two jobs and they must not blur together, or the Significant badge stops meaning anything. **Signal Blue** is light and saturated, always sits *on* a surface, and means only "active" or "significant". **Weather Blue** is deep, lives in the cloud gradient in `night-sky.tsx`, is always *behind* glass, and never lands on an object. The test: a blue inside a panel's content is a state; a blue behind glass is light. The two are separated by living in different files, which is a stronger guarantee than a rule anyone has to remember.

**The One Translucent Layer Rule.** Exactly one layer in any stack is translucent: the pane's own face. Nothing nested inside it is. The corollary settles a mistake made three times in three components: **a plate's material is decided by what is behind it, not by what it is.** On glass, use glass (`panel-control`, `panel-chip`). Inside a panel, use the baked token — `surface-strong` there is correct and must not be "upgraded".

**The Baked Tint Rule.** A tinted plate is a flat token, never an alpha (`bg-primary/8`). An alpha composites against whatever happens to be behind it, so the Significant badge once measured 4.76:1 at rest and 4.49:1 on a hovered row — contrast that depended on where the pointer was. Under glass that failure is worse, not better: the thing behind is now a gradient. The three tints are pre-composited at **8%** over Canvas. The dose keeps falling for one reason: adding accent to a plate pulls the plate toward the text it has to contrast with. This pair is the binding constraint on every pass — re-run it **first** whenever the glass or the weather changes, because it fails before anything else does.

**The Climbing Ramp Rule.** A surface that sits *on* another surface is the lighter of the two. If a new surface is darker than its field, the depth will not read no matter what shadow is applied. The `panel-rail` tier is the single sanctioned exception: it resolves darker than `glass-panel` because it is shell, and shell should be recessive relative to content. The tier keeps the name it was given as a left rail — it was always defined by the role, not by the axis, and every measurement taken against it survived the move to a top card unchanged.

**The Always-Light Plate Rule.** `logo-plate` is the one token that stays light, and it is load-bearing rather than an oversight. Real marks sit on this plate; the lettermark fallback and category glyphs use `surface-strong` instead so their text stays legible against the glass. Alpha is safe here despite the Baked Tint Rule for two reasons: at 0.85 the surface underneath moves the result by about 3 RGB units, and a brand mark is exempt from 1.4.11 as a logotype anyway.

**The Measured Floor Rule.** A colour pair ships only once its ratio has been computed: 4.5:1 for text, 3:1 for a graphical object that carries data. Many tokens here are the value they are because the prettier value failed — `muted`, `body`, `chart-bar`, all three tints, and `primary` wherever it would have to sit on a plate.

## Typography

**Display Font:** Source Serif 4 (with ui-serif, Georgia, serif)
**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** A financial paper's evening edition, not a terminal. This product does not trade, does not tick and does not advise — its output is written prose, a daily narrative and summarised news — so a serif carries the words and a grotesque carries the instruments. That pairing says "read, edited, considered", which is exactly the product's claim and precisely what a competitor optimising for confident prediction cannot say. Source Serif 4 rather than a fashionable display serif: drawn for screens, sober rather than mannered, and variable, so the whole 200–900 range costs one file.

### Hierarchy

- **Display** (Source Serif 4, 600, `clamp(2.25rem, 4vw, 3.25rem)`, 1.06): one per page, carrying what the page is *about* rather than always its name. News takes its name; **Home takes the session date** — spelled out, `Tuesday, August 18` — because the nav card holds the product's name on every route now, and at 52px a name the visitor already knows is the least useful element on a surface where they are finding something out. It also states the product's central caveat in the first thing the eye meets: a completed session, not a live tape. Today's Activity has no display element at all; its `<h1>` is a ticker and stays in Inter as a measured identifier. Set through the `page-title` utility, which also carries the mask sweep.

  The date is set in the serif rather than in mono, and that is not an exception to The Mono Numerals Rule. That rule governs a number which is *data* — a value in a column, comparable down it. A page's title is written.
- **Figure** (JetBrains Mono, 500, 1.875rem, 1.05, `tnum`): the one large tabular reading — Market Overview levels and the Today's Activity stat cells. Both surfaces import this step rather than spelling a size, because the same role rendered 38px on one page and 30px on another before it existed.
- **Title** (Inter, 600, 1.25rem, 1.75rem): section headings. One step, always paired with the hairline rule running to the meta slot.
- **Lede** (Source Serif 4, 400, 1.125rem, 1.59): the AI narrative — the one passage long enough for optical bleed to accumulate.
- **Story** (Source Serif 4, 600, 1rem, 1.375): news headlines, on both the News page and the Home teaser. A headline is one role and must not change size or face between two surfaces showing the same three articles.
- **Body** (Inter, 400, 0.875rem, 1.5rem): running interface prose, table cells, straplines. Measure capped at 62–86ch.
- **Label** (Inter, 600, 0.75rem): column headers, cell labels, tab labels.
- **Micro** (Inter, 600, 0.6875rem): the second line inside a cell — relative volume under volume, the lettermark inside a plate.

### Named Rules

**The Written-And-Measured Rule.** The three faces divide by provenance, and the rule states in one line: **what somebody or something *wrote* is set in the serif; what the machine *measured* is set in Inter or in mono.**

**The Mono Numerals Rule.** Every number that is *data* renders in JetBrains Mono with `tabular-nums`. A figure set in Inter is a defect: it breaks column alignment and severs the visual promise that numbers here are measured rather than written.

**The Signed Value Rule.** Change values always carry an explicit `+` or `−` (U+2212, not a hyphen) and are formatted from the absolute value. Direction is legible without colour, which is what keeps the change columns usable for a colour-blind reader.

**The Dark-Compensation Rule.** Light-on-dark bleeds — the glyph spreads optically into the field, closing counters and tightening the gaps between letters — so a setting that reads as composed on white reads as clotted on near-black. `lede` carries +0.003em tracking and 1.59 leading for this, unlayered so it beats the utility on the element. Weight is deliberately left alone: 500 would put the narrative at the same weight as the figures around it and cost more in voice than it buys in legibility.

**The Measure-On-The-Text Rule.** A `ch` cap belongs on the element whose font size it is meant to describe, never on a wrapper. `ch` resolves against the element's *own* font size, so `max-w-[16ch]` on a 16px wrapper containing a 52px heading yields about 270px and shatters the heading into one-word lines.

**The Intact Heading Rule.** Never split a heading into per-character boxes to animate it. A browser cannot kern across boxes — measured, "US TechMarket" rendered 376.7px split against 368.3px intact, about 0.7px lost on every pair. Animate a heading with a mask that travels across an intact text node instead; kerning, ligatures and text selection all survive.

## Layout

One centred group, `max-w-[1680px]`, stacked as a column with a uniform `24px` of padding and a `24px` gap between the nav card and the content below it. Pages carry **no horizontal padding of their own** — the shell owns every gutter. This replaced three unrelated sources of margin that never agreed: measured at 1470px the viewport-to-rail gap was 16px, rail-to-content 56px and content-to-viewport 40px, diverging to 16 / 280 / 264 at 1920px.

The navigation is a full-width `62px` card across the top, and it used to be a `240px` rail down the left. `<main>` is still a flex item and still carries `min-w-0` — load-bearing, not tidying: without it a flex item cannot shrink below its content's min-content width, and the two `overflow-x-auto` wrappers in the product become dead code that widens the page instead of scrolling inside itself. The axis changed; the default it guards against did not.

**The content column is `viewport − 48` on every route, and that is the whole consequence.** It was `viewport − 48 − 240 rail − 24 gap`, so content gained exactly 264px: `main` measures 1422px at a 1470px viewport where it measured 1158px. Every breakpoint derived from the shell arithmetic moved with it, and one of them changes what a laptop sees — Home's two-column split now engages at 1130px instead of 1390px, so a 1280px screen gets the composition the page was drawn for instead of a stacked column. The cost runs the other way: `84px` of permanent vertical chrome (62 card + 24 gap, from a viewport top of 24) that a rail did not charge, on the axis that is scarcer on a laptop.

Sections stack at a `24px` rhythm. Every section opens with a `SectionHeading`: a title, a hairline running from it to the right edge, and an optional meta slot. The row carries a `38px` minimum height — the height of a `panel-control` pill — because two side-by-side sections with different metas otherwise started 10px apart.

Breakpoints are chosen arithmetically rather than from a stock scale, and they move whenever the shell or the column set does. The watchlist's sideways-scroll hint appears below `800px` because the table's panel needs 748px and the content column is `viewport − 48 shell` — an exact crossing of 796, rounded up to a clean ten. It read `1060px` while the rail took 264px out of that same column. Tailwind's nearest steps (768, 1024) would both show the line at widths where it is false.

**Target viewports are laptop and iPad, and phone now fits as well.** Measured on all three routes at 390 / 430 / 600 / 768 / 834 / 1024 / 1130 / 1280 / 1470 / 1920: `documentElement.scrollWidth` equals the viewport at every one of them, so nothing overflows anywhere.

390px used to overflow, and the diagnosis recorded here was right — the rail never yielded its 240px, leaving `main` 78px against min-content widths of 117–224px. Moving navigation to the top is the collapse behaviour that was missing: `main` gets 342px at 390, which clears the widest of those minimums. Phone is still not a *designed* target — nothing below 600px has been composed for, and the nav card wraps to two rows of items there (`110px` instead of `62px`) — but it is no longer broken, and the fix was a side effect rather than work.

### Named Rules

**The Scrolling Island Rule.** Anything with a hard minimum width — the 746px watchlist table, the 560px intraday chart — lives inside its own `overflow-x-auto` container and scrolls internally. The page body never scrolls horizontally. A wrapper alone does not achieve this; the flex ancestor must also carry `min-w-0`, or the wrapper is dead code and the page widens anyway. **And a scrolling island must say so**: iPadOS hides the scrollbar until a scroll is already under way, so the affordance needs words at the widths where content is actually off screen.

**The One Container Rule.** Every page renders directly into the shell's `max-w-[1680px]` group. A page that sets its own width or its own horizontal padding is drifting.

**The Filled Right Rule.** A full-width container whose content is capped at a reading measure has a second column's worth of empty space in it, and the emptiness reads as unfinished rather than as restraint. If a measure cap leaves a third of a panel blank, the panel wants a second column, not a wider measure.

## Elevation & Depth

The system is **layered and lit**, not flat. Depth comes from three sources at once: a tonal climb (each surface lighter than its field), a soft ambient cast, and a directional rim where the pane catches the sky. Shadows are always a tight contact shadow plus a wide ambient one, so a surface has both a seam and a cast. Alphas are high because the field they fall on is near-black — a 7% shadow is invisible there.

There is **no coloured glow around any panel**. A blue pool under each step was tried and removed, and the reasoning it came from was simply wrong: a pane does not emit. Every panel carrying its own coloured halo also meant the page's light source was wherever the layout happened to put a card, so the sky had no direction and the light had no cause. The light around a panel now comes from the cloud behind it and from the rim it catches.

### Shadow Vocabulary

- **elev-1** (`0 1px 2px rgb(0 0 0 / 0.45), 0 4px 14px -3px rgb(0 0 0 / 0.5)`): the resting panel, the track, and any control floating on the field.
- **elev-2** (`0 2px 6px rgb(0 0 0 / 0.5), 0 16px 34px -10px rgb(0 0 0 / 0.6)`): the nav card, and the one raised element per page.
- **elev-3** (`0 6px 12px rgb(0 0 0 / 0.55), 0 30px 60px -14px rgb(0 0 0 / 0.7)`): overlays only. It has to detach the pane from the page completely.

**The lit rim** (`--edge-rim`) is a masked 1px gradient ring, not a border: near-white where the light strikes the top-left corner, gone by the middle of the pane, picking up a last faint catch at the far corner the way a real edge bounces. A flat border states the same brightness on the lit edge and the shadowed one, which is exactly what made the earlier panels read as drawn rectangles. The pseudo-element's radius is the tier's radius **plus one**, because it sits a pixel outside; `inherit` leaves a visible notch at every corner.

**The face wash** (`--surface-face`) is 7% of the same cold blue over the top 96px — the sky catching the top of the pane, so it is the sky's colour and not a white one. It must stay translucent: an opaque gradient would paint over the backdrop-filter and the blur would do nothing. Its brightest band is folded into every contrast pair measured against a panel — the worst case for text is the top 96px of a raised card, not its body.

### Named Rules

**The One Material Rule.** Panels are built by applying one of the seven material utilities — `panel`, `panel-raised`, `panel-overlay`, `panel-track`, `panel-rail`, `panel-control`, `panel-chip` — never by hand-assembling `bg-canvas border border-hairline rounded-3xl shadow-…`. The material was previously reassembled in sixteen components, which is why nothing about it could be changed system-wide. **A component that inlines the recipe is drift even when the result looks identical.** If it needs a variant, add one to the utility.

**The One Raised Element Rule.** At most one thing per page sits at `elev-2` (the nav card excepted, since it is shell rather than content). The scale exists to say *this outranks its neighbours*; two raised elements on one page say nothing.

**The Two-Channel Depth Rule.** Never add a cast shadow without checking the tonal relationship underneath it. If the surface is not lighter than its field, the shadow is decoration and the depth will not read.

## Shapes

Two radii and almost nothing between them. **Containers are 24px** — every panel, the nav card, the raised card. **Tokens are full pills** — badges, chips, change values, the controls that float on the field, the news category track. Inside an overlay the scale steps down concentrically: a `16px` pane holding `12px` rows on `4px` of padding, so the rows sit inside the corner rather than cutting across it. Navigation rows take `8px`.

Borders are 1px and always translucent where they meet the sky, solid only where they land on a known panel face. Nothing in the system uses a hard offset shadow, a coloured left border, or a clip-path silhouette.

### Named Rules

**The Pill-For-Tokens Rule.** If it is a token — a small object standing for a state, a category, or an identity — it is a full pill. If it is a container, it is 24px. There is no in-between case at container scale.

**The Concentric Radius Rule.** A rounded thing inside a rounded thing takes the outer radius minus the padding between them. A square-cornered first row inside a 16px pane is the tell that this was skipped.

## Components

### Buttons

- **Shape:** full pill for anything floating on the field (`panel-control`); `12px` for a row inside an overlay; `8px` for a navigation item.
- **Primary (filled):** Signal Blue Fill under white text, `8px 16px`. Used only where an action must be found without context — the skip link and the not-found route. Hover goes **darker**, to Signal Blue Fill Pressed.
- **Control (glass):** the default. `panel-control` — the same material as a panel, pill-shaped, hovering to `glass-control-hover`: glass that has caught more light, never an opaque plate dropped on top.
- **Hover / Focus:** colour transitions at 150ms. Focus is a 2px Signal Blue outline at 2px offset, on every focusable element, rising to 3px under `prefers-contrast: more`.
- **Disabled:** 50% opacity plus `cursor: not-allowed`. At 30% the disabled state measured 1.51:1 and was invisible — on the one control whose disabled state was the *only* signal that a bound had been reached. A dimmed control cannot state a reason, so the reason is always also written in words nearby.

### Chips

- **Style:** `panel-chip` on the field, a baked tint inside a panel. Full pill, `2px 10px`, micro label at weight 600.
- **State:** Significant takes `tint-primary` with Signal Blue text; Normal takes `surface-strong` with Body text. The change pills take `tint-up` / `tint-down` with the session pair.

### Cards / Containers

- **Corner Style:** 24px.
- **Background:** `glass-panel` (or `glass-raised` for the one element that outranks its neighbours), plus the face wash.
- **Shadow Strategy:** `elev-1`, or `elev-2` for the raised card. See Elevation & Depth.
- **Border:** 1px `glass-edge`, plus the masked lit rim.
- **Internal Padding:** `16px 20px`; table cells `12px`.

### Navigation

Navigation is a card across the top, not a slab and not a rail: same 24px geometry and same material as every other panel, only darker and more blurred, because it is the one surface a visitor sees on every route and it should stay quiet while the page behind it changes. It is split to its two edges — the product's name at the left, the three items at the right — which is the masthead arrangement: the publication's name at one end, its sections at the other. The name is set in the display serif so the nameplate speaks in the brand voice while the items opposite speak in the interface voice, and it is text rather than a link, since a second control pointing at Home would compete with the item already carrying `aria-current`. Below 600px the name is dropped and the nav keeps the row, falling back to the left edge — measured, the two together need 533px against a content column of `viewport − 48`.

Nothing was invented to fill the middle, and nothing needs to be. The Filled Right Rule warns that emptiness inside a full-width container reads as unfinished — but that is about a panel of content whose measure cap strands a column. Splitting two real objects to the two edges is what a masthead does, and the gap between them is the arrangement rather than a hole in it.

**It is deliberately not sticky, and that reverses the rail's own behaviour.** A rail can be sticky for free: content scrolls past its side, so its backdrop holds nothing but the fixed sky and the blur is never recomputed. A pinned top card has content passing *underneath* it, which re-composites a 10px `backdrop-filter` on every scroll frame — the case The Bounded Motion Rule exists to forbid. The card scrolls away with the page instead, and `g h` / `g n` / `g a` cover switching from any scroll position. It carries no entrance animation either: it is the frame, present from the first paint like the sky, which also holds peak animation concurrency at three.

Items are 44px tall, `8px` radius, Body text with an 18px icon at 1.5 stroke. The active item is `nav-active` — a translucent 18% accent plate, a lit inset ring, a soft cast — with **Signal Blue Active** text and a 1.75 stroke on the icon. The icon carries no colour decision of its own; its stroke is `currentColor`, so it is exactly as blue as the label beside it. `aria-current="page"` is always set: the active state is a plate and a colour, and neither is reported by a screen reader.

Each row carries its shortcut — `g h`, `g n`, `g a` — in `aria-keyshortcuts`, and draws nothing. The hint *was* printed at the trailing edge in muted mono and was removed on report: it read as characters somebody had forgotten to delete. See The Keycap-Or-Nothing Rule.

`nav-active` is the one sanctioned exception to The Baked Tint Rule, and it earns it only by being measured at both ends of its range: `primary` fails every alpha (4.49:1 at its most generous), `primary-active` clears at 5.43:1 against the card's bright end and 7.06:1 against its dim end.

A nav label carries `whitespace-nowrap` for the reason the watchlist's column headers do: a label naming a destination is an identity, and the one thing in a row that must never reflow. Without it, "Today's Activity" broke across two lines inside its own item at 390px and took the card from 62px to 82px doing it.

### Menus and Disclosures

Every popover is `panel-overlay`: the heaviest blur in the product (16px), nearly opaque at 0.82, `elev-3`, a plain border rather than the lit rim, and `4px` of padding around `12px` rows. It is nearly opaque for a reason the other tiers do not share — what shows through it is *text*, and text through glass is unreadable in a way weather never is.

The selected row takes `surface-strong` with **Signal Blue Active** text (4.82:1). One is a `<details>`/`<summary>` — every option is a link, so opening costs no JavaScript — and three are client popovers sharing one hook. Busy and blocked are never the same signal: dimming says "you cannot", and "working on it" is said in words, in the same live region the errors use.

Those three declare `role="menu"` on the list (not on the panel — the panel also holds a group header and a `role="status"` line, neither of which is a menu item), and they keep the promise the role makes: focus enters on open, landing on the row marked current where there is one; Up/Down move between rows and Left/Right between the two controls on a row; Home/End jump the ends; a typed ticker jumps to it (`n`, `v` → NVDA, with a 700ms buffer); Escape closes and returns focus to the trigger; Tab returns focus to the trigger and then keeps going, because a menu does not trap. Nothing inside is in the tab order — focus is moved, not tabbed.

### Named Rules

**The Keycap-Or-Nothing Rule.** A keyboard hint is drawn as a **key** — a plate with a border, inset like a keycap — or it is not drawn at all. Bare letters set quietly beside a label have no container, no affordance and nothing punctuating them as an input: the only thing separating them from the interface's own text is that they are fainter, and faint stray text reads as debris, not as an offer. Tested the hard way here — the first version was read as characters somebody had forgotten to delete. Loudness is not the missing ingredient; shape is.

**The Kept-Promise Rule.** An ARIA role is a specification, not a label. `role="menu"` and `aria-haspopup="menu"` commit you to focus-on-open, arrow navigation, type-ahead and Tab-exits; ship the attribute without the behaviour and a screen-reader visitor is told to press keys that do nothing, which is worse than declaring a plain disclosure. Either build the pattern or use `aria-expanded` alone and mean it.

### Data Table

`12px` cells, a `surface-soft` header band (a scrolled table otherwise loses its column labels into the data), `hairline` dividers, `surface-soft` row hover. Column labels never wrap — the header should be the one thing in a column that never reflows. The row's primary value takes one size step above the rest of the cells; the second read takes weight instead of a third size.

### Signature Component — the Night Sky

A single fixed layer at `z-index: -1`, inside the root stacking context so every backdrop-filter above it has something to sample. Two banks of cloud built from lobe clusters displaced by `feTurbulence` + `feDisplacementMap`, and 313 silver stars in three tiers.

Two invariants: the **bright** stars are excluded from the union of every panel rectangle on all three routes with 24 units of margin — a dim star bleeding through glass is what the material is for, a crisp bright one under text is a hot spot, and the Worst-Case Composite Rule does not model point sources. And a star must be **big enough to survive the blur**: a Gaussian of standard deviation σ reduces a disc of radius r to roughly `r²/(r²+2σ²)` of its peak, and Chrome's `blur(Npx)` is about σ = N/2, so the old 10px blur left a 1.3px star at six per cent of its brightness. Thinning the glass never revealed a star because the alpha was never the binding constraint — the blur was.

### Motion

One authored moment, and it belongs to the material rather than to a component: **the pane focusing.** An overlay enters slightly small, a little high, and nearly clear — 2px of blur against its resting 16 — so for a fifth of a second the sky behind it is almost sharp and then frosts over as the surface settles. Blur is the one property in this system that literally means "there is glass here", so it is the honest thing to animate when glass appears.

Everything else is arrival, and it arrives in **two phases**. First the room: the masthead resolves behind a travelling mask, four sections rise 14px over 700ms on a 100ms stagger (budgeted so the last lands at exactly 1.00s), and two meteors cross the sky. Then the instruments: at `--enter-instruments` (800ms) the sparklines and the intraday line draw themselves left to right in the direction of the session they plot, and the breadth bar's segments grow from the outside toward the split between them.

The phase split is the entire motion budget. Every one of these used to start at t=0 — measured at **seven animation families over about fifty elements** between 700 and 900ms. None was wrong alone; a page where fifty things move at once simply reads as unsettled however gentle each one is. Sequencing drops peak concurrency to **three**, and no animation was shortened or removed to get there: only delays moved, and the page's tail grew from 1.3s to ~2.1s. The only loop in the product is the bright stars breathing.

`prefers-reduced-motion` is honoured with an **alternative, not a kill**: ambient motion stops entirely, but feedback keeps an arrival — the overlay still fades in over 160ms, because a menu that blinks into existence is harder to follow than one that arrives, not easier.

### Named Rules

**The Room-Then-Instruments Rule.** Arrival happens in two phases and never in one. Structure first — masthead, panels, weather — then the things drawn inside the panels, offset by `--enter-instruments`. When the budget is too loud, **sequence before you shorten and shorten before you delete**: a slower page that moves in one place at a time reads calmer than a fast page that moves everywhere at once, and it costs nothing anyone asked for.

**The Arrival-Not-Recurrence Rule.** Arrival is allowed; recurrence is not. A line drawing itself once, as the page appears, is the same event as the panel under it arriving — it says "here is the session". The same line redrawing on a timer would say "the session is still running", which is the lie this product's whole motion design exists to prevent.

**The Bounded Motion Rule.** Motion is affordable exactly where it is bounded. Animating `backdrop-filter` is expensive, which is precisely why it happens on one small element, once, on an explicit user action. The tempting place to put motion in this world is the sky — drifting the clouds behind everything — and it is forbidden: eight glass surfaces sample that sky, so anything moving behind them invalidates every backdrop-filter on the page, on every frame, continuously. The stars get away with breathing only because they are kept off the panel rectangles, so their invalidation never intersects a pane.

**The Resting-State-Is-Correct Rule.** Every animation's resting state is the finished state: masks rest at full opacity, `stroke-dashoffset` rests at 0, keyframes fill `backwards` rather than `both`. If the stylesheet never loads or the animation never runs, the page is simply the page. (`both` also leaves an identity `matrix()` behind, which creates a stacking context and once put a closed dropdown's ghost over the content underneath it.)

## Do's and Don'ts

### Do:

- **Do** measure every colour pair at the worst-case composite — `canvas`, not the average pane — and re-take the sky's peak after any change to the weather.
- **Do** build every container by applying a material utility. If it needs a variant, add one to the utility.
- **Do** pick a plate's material from what is *behind* it: glass on the field, a baked token inside a panel.
- **Do** use `primary-active` for accent text that sits on an accent or raised plate. `primary` fails there at every alpha.
- **Do** set data in JetBrains Mono with `tabular-nums`, and prose in Source Serif 4.
- **Do** give anything with a hard minimum width its own `overflow-x-auto` island — and a sentence telling the visitor it scrolls.
- **Do** derive breakpoints from the shell arithmetic, not from the nearest Tailwind step.
- **Do** state a busy state in words. Dimming can only say "no", never "wait".
- **Do** sequence a loud arrival into phases before shortening or deleting any of it.
- **Do** declare a keyboard shortcut in `aria-keyshortcuts` on the control it operates, whether or not it is drawn.
- **Do** theme the browser surfaces: selection, scrollbars, focus rings, underline offset, and the cursor on `<button>` and `<summary>` (Tailwind v4's preflight dropped `cursor: pointer`).

### Don't:

- **Don't** add a second theme. There is no honest daylight counterpart to a starfield, and every token would have to be defined twice to get one.
- **Don't** write a tinted plate as an alpha (`bg-primary/8`). It composites against whatever is behind it, and behind it is now a gradient.
- **Don't** put a coloured glow around a panel. A pane does not emit; the light comes from the cloud behind it and the rim it catches.
- **Don't** animate anything behind the glass. Every pane on the page re-samples on every frame.
- **Don't** loop, tick, pulse, or auto-refresh anything. The session being described is over.
- **Don't** start every animation at t=0. Structure arrives, then the instruments inside it.
- **Don't** declare an ARIA role you have not implemented the keyboard model for.
- **Don't** set a keyboard hint as bare quiet text next to a label. Draw it as a keycap or leave it out.
- **Don't** let Signal Blue become decorative. Outside a token of state, a dot, tick or rule in the accent colour is a violation even when it looks good.
- **Don't** split a heading into per-character boxes. The kerning does not survive it.
- **Don't** author the weather anywhere but `night-sky.tsx`, or mirror its colours into a CSS token that nothing can check.
- **Don't** add an eyebrow, a section number, a gradient text fill, or a hard offset shadow. None of them belong to this world.
