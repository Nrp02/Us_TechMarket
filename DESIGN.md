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
  section: "40px"
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

The atmosphere is authored in exactly one place — five masses of fractal cloud over near-black, in `night-sky.tsx` — and everything else in the product is a pane in front of it. That is the whole material idea, and it is what replaced an earlier system of flat tonal rectangles: a panel now sits at 4.5× the luminance of unlit sky and 15.3× that of a lit cloud, and it is the *range*, not any single value, that makes the material read as glass. The consequence is a discipline: a pane's face is a range, so every colour pair in the product is measured at the brightest end of it.

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

**As of the five-mass sky, `canvas` is conservative and is deliberately left where it is.** Re-taken at 1470×1000 with panels and stars hidden, the brightest 16px block behind any pane measures **L 0.00670 on Home** (rgb 6/19/42, at 1264,304) and **0.00620 on News** — against the 0.01663 / 0.01951 the three-mass sky produced, a fall of about 60%. Back-solved, `#16243f` models a field of roughly rgb 26/39/65 where the page now renders 6/19/42; re-deriving it would give about `#091730`. Every pair in the product therefore still passes, with more margin than it was measured for — the error is in the safe direction, which is the whole point of measuring the bright end. The token is not chased downward, because it is also what the reduced-transparency fallback paints and what the tints are baked over, and moving it means re-running all three tints first. **A conservative canvas costs nothing; an optimistic one fails silently.**

**The Two Blues Rule.** Blue does two jobs and they must not blur together, or the Significant badge stops meaning anything. **Signal Blue** is light and saturated, always sits *on* a surface, and means only "active" or "significant". **Weather Blue** is deep, lives in the cloud gradient in `night-sky.tsx`, is always *behind* glass, and never lands on an object. The test: a blue inside a panel's content is a state; a blue behind glass is light. The two are separated by living in different files, which is a stronger guarantee than a rule anyone has to remember.

**The One Translucent Layer Rule.** Exactly one layer in any stack is translucent: the pane's own face. Nothing nested inside it is. The corollary settles a mistake made three times in three components: **a plate's material is decided by what is behind it, not by what it is.** On glass, use glass (`panel-control`, `panel-chip`). Inside a panel, use the baked token — `surface-strong` there is correct and must not be "upgraded".

**The Baked Tint Rule.** A tinted plate is a flat token, never an alpha (`bg-primary/8`). An alpha composites against whatever happens to be behind it, so the Significant badge once measured 4.76:1 at rest and 4.49:1 on a hovered row — contrast that depended on where the pointer was. Under glass that failure is worse, not better: the thing behind is now a gradient. The three tints are pre-composited at **8%** over Canvas. The dose keeps falling for one reason: adding accent to a plate pulls the plate toward the text it has to contrast with. This pair is the binding constraint on every pass — re-run it **first** whenever the glass or the weather changes, because it fails before anything else does.

**The Climbing Ramp Rule.** A surface that sits *on* another surface is the lighter of the two. If a new surface is darker than its field, the depth will not read no matter what shadow is applied. The `panel-rail` tier is the single sanctioned exception: it resolves darker than `glass-panel` because it is shell, and shell should be recessive relative to content. The tier keeps the name it was given as a left rail — it was always defined by the role, not by the axis, and every measurement taken against it survived the move to a top card unchanged.

**The Always-Light Plate Rule.** `logo-plate` is the one token that stays light, and it is load-bearing rather than an oversight. Real marks sit on this plate; the lettermark fallback and category glyphs use `surface-strong` instead so their text stays legible against the glass. Alpha is safe here despite the Baked Tint Rule for two reasons: at 0.85 the surface underneath moves the result by about 3 RGB units, and a brand mark is exempt from 1.4.11 as a logotype anyway.

**The One Meaning Per Hue Rule.** A colour already carries a meaning in this product, so an *action* may not borrow it. The watchlist picker drew "Remove" in the loss red and "Add" in Signal Blue, which put red meaning "a price fell" beside red meaning "this button destroys something", and blue meaning "crossed the significance rule" beside blue meaning "you may click this" — in the same viewport, at the same moment. Both verbs are now Body ink and the distinction is carried by the `−` and `+` glyphs the symbol switcher already uses for the same two actions, so it survives for a reader who cannot separate the two hues at all. **Before colouring anything, ask what that hue already says on this screen.**

**The Reverted-On-Sight Rule.** Two changes this system has now made twice and undone twice, both from an argument that was correct in the abstract and wrong on the page. Do not re-propose either without new evidence.

- **The Volatility card in neutral ink.** The argument: a falling volatility future is a calmer market, so red would be the product judging the news. The page's answer: VIXY is an ETF with a price, the price did fall, and red reports the same fact here as on the other four cards. The "bad news" reading is the viewer's inference, not the card's claim — and one card in a row of five wearing a different colour reads as a fault rather than as a distinction.
- **"Normal" replaced with an em-dash in the Status column.** The argument: a badge marking an exception should not be printed on every row that is not one — the column held six identical pills and one Significant, 191px wide at 1920. The page's answer: most days nothing crosses the rule at all, so the column became seven dashes and read as data that had failed to load. **A quiet answer still has to look like an answer.**

**The Measured Floor Rule.** A colour pair ships only once its ratio has been computed: 4.5:1 for text, 3:1 for a graphical object that carries data. Many tokens here are the value they are because the prettier value failed — `muted`, `body`, `chart-bar`, all three tints, and `primary` wherever it would have to sit on a plate.

## Typography

**Display Font:** Source Serif 4 (with ui-serif, Georgia, serif)
**Body Font:** Inter (with ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace)

**Character:** A financial paper's evening edition, not a terminal. This product does not trade, does not tick and does not advise — its output is written prose, a daily narrative and summarised news — so a serif carries the words and a grotesque carries the instruments. That pairing says "read, edited, considered", which is exactly the product's claim and precisely what a competitor optimising for confident prediction cannot say. Source Serif 4 rather than a fashionable display serif: drawn for screens, sober rather than mannered, and variable, so the whole 200–900 range costs one file.

### Hierarchy

- **Display** (Source Serif 4, 600, `clamp(2.25rem, 4vw, 3.25rem)`, 1.06): **at most** one per page, and two of the three routes now have none. News takes its name. **Home has no display element** — its `<h1>` is `sr-only` — and Today's Activity has none either; its `<h1>` is a ticker and stays in Inter as a measured identifier. Set through the `page-title` utility, which also carries the mask sweep; `error.tsx` and `not-found.tsx` use it too.

  Home's display element was the session date, spelled out at 52px, and losing it is a **deletion rather than a demotion**. Once the nav card gained a session marker, the day was stated on every route in the shell; keeping a 52px copy of it on one route would have been the same defect that moved the product's name out of Home's heading in the first place — one fact, two places, drifting the moment either changes. The eye now meets the session digest instead, which answers *how the day went* rather than *which day it was*.

  A page that has nothing to say at display size should say nothing at display size. A display element is not a slot to fill.
- **Figure** (JetBrains Mono, 500, 1.875rem, 1.05, `tnum`): the one large tabular reading — Market Overview levels and the Today's Activity stat cells. Both surfaces import this step rather than spelling a size, because the same role rendered 38px on one page and 30px on another before it existed.
- **Title** (Inter, 600, 1.25rem, 1.75rem): section headings. One step, always paired with the hairline rule running to the meta slot.
- **Lede** (Source Serif 4, 400, 1.125rem, 1.59): the AI narrative — the one passage long enough for optical bleed to accumulate, and **the one passage in the product with no measure cap, deliberately**. Capping it was tried and made the page worse rather than better: the panel is the full content column, so a cap simply moved the emptiness from the end of each line to the right third of a tall card. The card takes a second column instead — see The Filled Right Rule.
- **Story** (Source Serif 4, 600, 1rem, 1.375): news headlines, on both the News page and the Home teaser. A headline is one role and must not change size or face between two surfaces showing the same three articles.
- **Body** (Inter, 400, 0.875rem, 1.5rem): running interface prose, table cells, straplines. Measure caps run **48–60ch**, each one computed from the passage's own average character width rather than taken off a scale: 60ch on a timeline entry, 53ch on a news blurb, 52ch on the two provenance notes, 49ch on the News strapline and the not-found line. The band used to read 62–86ch, which was the same numbers copied across six elements at three font sizes.
- **Label** (Inter, 600, 0.75rem): column headers, cell labels, tab labels.
- **Micro** (Inter, 600, 0.6875rem): the second line inside a cell — relative volume under volume, the lettermark inside a plate.

### Named Rules

**The Written-And-Measured Rule.** The three faces divide by provenance, and the rule states in one line: **what somebody or something *wrote* is set in the serif; what the machine *measured* is set in Inter or in mono.**

**The Mono Numerals Rule.** Every number that is *data* renders in JetBrains Mono with `tabular-nums`. A figure set in Inter is a defect: it breaks column alignment and severs the visual promise that numbers here are measured rather than written.

The session date has been on both sides of this rule and the second answer is the right one. As Home's 52px title it was *written* and set in the serif, correctly. In the nav card's session marker it is not a title — it is the day being reported, stamped beside the time it was read, and it is set in mono with the rest of the measured values. **The face follows the role the element is playing, not the kind of value it holds.**

**The Signed Value Rule.** Change values always carry an explicit `+` or `−` (U+2212, not a hyphen) and are formatted from the absolute value. Direction is legible without colour, which is what keeps the change columns usable for a colour-blind reader.

**The Dark-Compensation Rule.** Light-on-dark bleeds — the glyph spreads optically into the field, closing counters and tightening the gaps between letters — so a setting that reads as composed on white reads as clotted on near-black. `lede` carries +0.003em tracking and 1.59 leading for this, unlayered so it beats the utility on the element. Weight is deliberately left alone: 500 would put the narrative at the same weight as the figures around it and cost more in voice than it buys in legibility.

**The Measure-On-The-Text Rule.** A `ch` cap belongs on the element whose font size it is meant to describe, never on a wrapper. `ch` resolves against the element's *own* font size, so `max-w-[16ch]` on a 16px wrapper containing a 52px heading yields about 270px and shatters the heading into one-word lines.

And `ch` is **not** a character count. It is the advance of the digit zero, which in Inter is wider than the average letter — measured, 12px Inter runs about 5.79px a character against a 7.58px `0`, so `52ch` holds roughly 68 characters. A cap copied from a typographic rule of thumb about *characters* therefore sets a line about 30% longer than intended. Every cap in this file was derived by measuring the passage it governs; none was chosen.

**The Intact Heading Rule.** Never split a heading into per-character boxes to animate it. A browser cannot kern across boxes — measured, "US TechMarket" rendered 376.7px split against 368.3px intact, about 0.7px lost on every pair. Animate a heading with a mask that travels across an intact text node instead; kerning, ligatures and text selection all survive.

## Layout

One centred group, `max-w-[1680px]`, stacked as a column. Padding and the gap under the nav card are the same value and it is the only responsive step in the shell: `16px` below 600px, `24px` above. A phone is 390px wide and 48px of it is gutter at the desktop figure — the one screen where the shell's own margin is a material fraction of the content column. Pages carry **no horizontal padding of their own** — the shell owns every gutter. This replaced three unrelated sources of margin that never agreed: measured at 1470px the viewport-to-rail gap was 16px, rail-to-content 56px and content-to-viewport 40px, diverging to 16 / 280 / 264 at 1920px.

The navigation is a full-width `62px` card across the top, and it used to be a `240px` rail down the left. It holds **three** things, not two — the nameplate, the session marker, and the nav — and its height is the only chrome in the product that is not fixed:

| width | height | what changed |
|---|---|---|
| ≥ 1000px | `62px` | all three on one row |
| 430–999px | `86px` | the marker takes a row of its own (`w-full` forces the wrap) |
| < 430px | `104px` | the marker itself needs two lines |

(The nameplate is dropped below 600px, which costs no height — the marker already has the row.)

Each figure is arithmetic, not a stock step. One row costs `120` nameplate + `32` gap + `368` marker + `32` gap + `349` nav + `32` card padding + `48` shell = 981px, rounded up to a clean 1000. 950 was tried first from an estimate of the marker at ~300px; at that width the *nav* wrapped instead and the card came out at 93px — the same 24px of chrome spent on a worse arrangement.

**The second row is a composition rather than a fallback.** A name with the date beneath it is what a masthead does, and it is the arrangement every newspaper reaches for at exactly the width where the two stop sitting side by side. The cost is 24px of chrome below 1000px, accepted for one reason: after this change the shell is the only surface that always names the session, and an element that disappears on the narrowest screen is one nobody can rely on.

`<main>` is still a flex item and still carries `min-w-0` — load-bearing, not tidying: without it a flex item cannot shrink below its content's min-content width, and the two `overflow-x-auto` wrappers in the product become dead code that widens the page instead of scrolling inside itself. The axis changed; the default it guards against did not.

**The content column is `viewport − 48` at 600px and above, `viewport − 32` below, and that is the whole consequence.** It was `viewport − 48 − 240 rail − 24 gap`, so content gained exactly 264px: measured, `main` is 1422px at a 1470px viewport where it was 1158px, and 358px at 390. Every breakpoint derived from the shell arithmetic moved with it, and one of them changes what a laptop sees — Home's two-column split now engages at 1130px instead of 1390px, so a 1280px screen gets the composition the page was drawn for instead of a stacked column. The cost runs the other way: `84px` of permanent vertical chrome (62 card + 24 gap, from a viewport top of 24) that a rail did not charge, on the axis that is scarcer on a laptop.

Sections stack at a `40px` rhythm. Every section opens with a `SectionHeading`: a title, a hairline running from it to the right edge, and an optional meta slot. The row carries a `38px` minimum height — the height of a `panel-control` pill — because two side-by-side sections with different metas otherwise started 10px apart.

Breakpoints are chosen arithmetically rather than from a stock scale, and they move whenever the shell or the column set does. The watchlist's sideways-scroll hint appears below `800px` because the table's panel needs 748px and the content column is `viewport − 48 shell` — an exact crossing of 796, rounded up to a clean ten. It read `1060px` while the rail took 264px out of that same column. Tailwind's nearest steps (768, 1024) would both show the line at widths where it is false.

Four surfaces take a second column, each at its own derived width:

| surface | at | split |
|---|---|---|
| Home (watchlist / aside) | `1130px` | `minmax(748px,1fr)` + `minmax(300px,360px)` |
| News list | `1130px` | two equal columns, divider drawn per cell |
| Today's Timeline | `1130px` | two equal columns, **split in the server component**, not in CSS |
| AI Daily Summary | `1050px` | `1fr` + a `30rem` rail |

The news figure is the row's own arithmetic and lands on Home's number by coincidence rather than by copying it: a row is a 96px plate, a 16px gap and text, and at 45 characters the text needs about 340px — so a column is ~452px, a pair ~928, plus the 48px shell. 1130 clears it with room.

**Target viewports are laptop and iPad, and phone now fits as well.** Measured on all three routes at 390 / 430 / 600 / 768 / 834 / 1024 / 1050 / 1130 / 1280 / 1470 / 1920: `documentElement.scrollWidth` equals the viewport at every one of them, so nothing overflows anywhere.

390px used to overflow, and the diagnosis recorded here was right — the rail never yielded its 240px, leaving `main` 78px against min-content widths of 117–224px. Moving navigation to the top is the collapse behaviour that was missing: `main` measures 358px at 390, which clears the widest of those minimums.

**Phone has since been composed rather than merely fitted**, and the nav card no longer wraps its items there. It used to: "Today's Activity" is 152px of the ~330px three labelled items need against a 358px column, so the row broke and the card went to `110px`. Dropping the `Today's ` prefix below 600px brings the row to ~292px and holds one line at 390 — **48px of permanent chrome returned on every route, on the axis a phone has least of.** The card is 104px there rather than 62 only because the session marker takes two lines, which is a fact worth stating on the narrowest screen rather than a wrap to absorb. Below ~330px the items would wrap again, and should: degrading beats overflowing.

### Named Rules

**The Scrolling Island Rule.** Anything with a hard minimum width — the 746px watchlist table, the 560px intraday chart — lives inside its own `overflow-x-auto` container and scrolls internally. The page body never scrolls horizontally. A wrapper alone does not achieve this; the flex ancestor must also carry `min-w-0`, or the wrapper is dead code and the page widens anyway. **And a scrolling island must say so**: iPadOS hides the scrollbar until a scroll is already under way, so the affordance needs words at the widths where content is actually off screen.

**The One Container Rule.** Every page renders directly into the shell's `max-w-[1680px]` group. A page that sets its own width or its own horizontal padding is drifting.

**The Orphaned Card Rule.** Five is prime, so **every** column count that is not five leaves the last card alone on its row. **Let it be orphaned.** Five equal cards with an empty cell beside the last one, at every width, on both Market Overview and Today's Activity.

This reverses the rule that stood here, and the reversal was paid for in three rounds. The last child used to span the remainder, introduced because an orphan measured a 373×165 hole at 1024–1279px. That trade was made against a breakpoint rather than a device, and it lost twice when someone finally looked at a real one: at **1180px — iPad landscape** — the spanned card measured 748px beside siblings of 366, and at **390px** it measured 358×193 beside four siblings of 173×147. **An empty grid cell reads as an empty grid cell; a card twice its neighbours' size reads as a mistake.** The hole the span was invented to hide is cheaper than the hole it dug.

Two things went with it. A `--spark-cap` variable existed only to spend the width a spanned card won, and left with the span — the trace is back to the same `max-w-[100px]` every other card uses. And the grid string itself is now identical in **four** files; see The Mirrored Grid Rule.

**Check a grid at every column count it passes through, not only at its widest** — and check it at the device's real width, not the breakpoint above it. An iPad 10th gen is 820×1180pt, so the widths that decided this were 820 and 1180, neither of which is 768.

**The Lone Wrapped Item Rule.** `justify-between` does nothing for a single item on a wrapped line — it places it at `flex-start`. Every `flex-wrap` row whose children separate onto their own lines at some width needs an explicit `ml-auto` (or a grid) on whatever is supposed to hold the right edge, or it silently jumps to the left the moment it wraps. This has been found three times in three different files: the News date picker sat hard left at 390, 430 and 600 under a comment describing it as right-aligned; the Today's Activity price group did the same; and the nav label hit the inverse, where a `gap` meant for icon-to-label landed *inside* a two-word label because a bare text node had become an anonymous flex item. **A whitespace-only text node is not rendered as a flex item at all**, so making a container `inline-flex` can delete a space outright — from the rendering *and* from the accessible name. Wrap the label in one element; a flex `gap` restores the pixels and not the name.

**The One Axis Rule.** A stacked header has one left axis, and it is a *visual* axis, not a box axis. Today's Activity's phone header had six elements on four left edges and two right ones — logo 16, ticker box 112, ticker text 120, change pill 119, price 156, badge flush at 374 — and the pill missing the ticker by 7px is what made it read as broken: far enough to see, close enough to look like a mistake rather than an offset. It is a two-column grid now, the logo hanging in column one and everything else running down column two, **with the axis taken from the logo's own width rather than a hardcoded indent**. The controls beside it carry `px-2`, so the price column carries it too: aligning boxes while the text inside them is inset by 8px is the same defect one step further in.

**The Mirrored Grid Rule.** Four files carry the Market Overview / Activity Stats grid string — the two components and the two `loading.tsx` skeletons — and they must stay byte-identical. Two of them say so in comments and it happened anyway: one change to Market Overview alone left News & Events double-width on Today's Activity and left the Home skeleton drawing a spanned card that snapped to equal width when content arrived, worst on exactly the slow connection a skeleton exists for. `grep -ho 'grid grid-cols-2[^"]*' <the four files> | sort -u` must return one line.

**The Filled Right Rule.** A full-width container whose content is capped at a reading measure has a second column's worth of empty space in it, and the emptiness reads as unfinished rather than as restraint. If a measure cap leaves a third of a panel blank, the panel wants a second column, not a wider measure.

**The width has to be spent, not reclaimed** — this is the half that was learned the hard way. Capping the AI summary to a readable measure in the pass before this one made the page worse: it moved the emptiness from the end of each line into the right third of a tall card, where it is far more visible. Three measurements settled it, all at 1470px: a news row ran 1420px with content stopping at ~780, leaving 491px on each of sixty rows — about **4.1 million px²** of empty panel; the timeline left **482,608px²**; Home's old header left **~114,000px²**. Each one is now a second column or a re-composed band.

The rule has a floor. A short list is left alone: two columns of three rows is an arrangement, not a composition.

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

**The Every-Tier Fallback Rule.** There are three accessibility tiers that turn the glass off — `prefers-reduced-transparency`, `prefers-contrast: more`, and the shared lit-rim rule — and each one must name **every** material utility, not the big ones. Both tiers were missing `panel-control` and `panel-chip`, so a visitor who asked to reduce transparency still got translucent controls on every route: measured with the setting emulated, 13 of 14 panes went solid on Home and the picker button stayed glass. The contrast tier already hid the control's lit rim, so it knew about the control and simply never turned its blur off. When a new material variant is added — `panel-track-block` was — it must be added to all three lists in the same change, or the variant and its parent diverge the moment somebody turns a setting on. All three now measure 0 glass panes on all three routes with contrast still passing.

**The One Raised Element Rule.** At most one thing per page sits at `elev-2` (the nav card excepted, since it is shell rather than content). The scale exists to say *this outranks its neighbours*; two raised elements on one page say nothing.

**The Two-Channel Depth Rule.** Never add a cast shadow without checking the tonal relationship underneath it. If the surface is not lighter than its field, the shadow is decoration and the depth will not read.

## Shapes

Two radii and almost nothing between them. **Containers are 24px** — every panel, the nav card, the raised card. **Tokens are full pills** — badges, chips, change values, the controls that float on the field, the news category track. Inside an overlay the scale steps down concentrically: a `16px` pane holding `12px` rows on `4px` of padding, so the rows sit inside the corner rather than cutting across it. Navigation rows take `8px`.

Borders are 1px and always translucent where they meet the sky, solid only where they land on a known panel face. Nothing in the system uses a hard offset shadow, a coloured left border, or a clip-path silhouette.

### Named Rules

**The Pill-For-Tokens Rule.** If it is a token — a small object standing for a state, a category, or an identity — it is a full pill. If it is a container, it is 24px. There is no in-between case at container scale.

**The Stadium-Is-One-Row Rule.** A full-pill track is the right form for a segmented control on **one** row and the wrong one the moment it wraps, because a stadium's corner radius is half its height. The news category track at 390px grows to two rows of 44px pills — a 51px corner arc against the 4px of `p-1` holding the pills in — so the first pill's own rounded corner ends up as much as 7.6px *outside* the track it sits in. Two stacked rows are a block, and a block takes the container radius: `panel-track-block` is that variant, and it must be mirrored into every fallback tier that names `panel-track`, since `--rim-radius` has to move with `border-radius` or the lit rim keeps tracing a stadium the surface no longer has.

**A bounding-rect test cannot catch this.** The pill was inside the track's *rect* and outside its *shape*. Check a child against its parent's rounded outline by sampling points along it — and prove the check can fail before believing a clean result: forcing the 9999px radius back makes it flag two pills immediately.

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

**The middle is now the session marker**, and it is what turned this card from shell into a masthead. It states three things — whether the market is open, which day is on screen, and the timestamp the data was read at — in muted micro type, with the open/closed dot the session digest used to carry, minus its halo. It lives here rather than on Home because all three are true on *every* route; stating them on one page only was the same defect that moved the product's name out of Home's heading. It is rendered by the server and handed to this client component as a prop, since the card may not read data itself.

`justify-between` rather than `ml-auto` on the nav, deliberately: below 600px the nameplate is hidden, and a lone `ml-auto` child would still be shoved to the right edge with nothing opposite it, while `justify-between` with one child simply left-aligns. The narrow case gets the right answer for free.

The state is written as a word beside the dot and nothing is dropped to buy back the 16px the second line costs at 390px — colour is never the only channel, including on the screen with the least room to spare.

**It is deliberately not sticky, and that reverses the rail's own behaviour.** A rail can be sticky for free: content scrolls past its side, so its backdrop holds nothing but the fixed sky and the blur is never recomputed. A pinned top card has content passing *underneath* it, which re-composites a 10px `backdrop-filter` on every scroll frame — the case The Bounded Motion Rule exists to forbid. The card scrolls away with the page instead, and `g h` / `g n` / `g a` cover switching from any scroll position. It carries no entrance animation either: it is the frame, present from the first paint like the sky, which also holds peak animation concurrency at three.

Items are 44px tall, `8px` radius, Body text with an 18px icon at 1.5 stroke. The active item is `nav-active` — a translucent 18% accent plate, a lit inset ring, a soft cast — with **Signal Blue Active** text and a 1.75 stroke on the icon. The icon carries no colour decision of its own; its stroke is `currentColor`, so it is exactly as blue as the label beside it. `aria-current="page"` is always set: the active state is a plate and a colour, and neither is reported by a screen reader.

Each row carries its shortcut — `g h`, `g n`, `g a` — in `aria-keyshortcuts`, and draws nothing. The hint *was* printed at the trailing edge in muted mono and was removed on report: it read as characters somebody had forgotten to delete. See The Keycap-Or-Nothing Rule.

`nav-active` is the one sanctioned exception to The Baked Tint Rule, and it earns it only by being measured at both ends of its range: `primary` fails every alpha (4.49:1 at its most generous), `primary-active` clears at 5.43:1 against the card's bright end and 7.06:1 against its dim end.

A nav label carries `whitespace-nowrap` for the reason the watchlist's column headers do: a label naming a destination is an identity, and the one thing in a row that must never reflow. Without it, "Today's Activity" broke across two lines inside its own item at 390px and took the card from 62px to 82px doing it.

**Below 600px one label is shortened, not wrapped and not abbreviated.** "Today's Activity" is 152px of the ~330px three labelled items need against a 342px column, so on a phone the item reads **Activity**. It is authored as a `phonePrefix` on the single label rather than as a second `shortLabel` string, so the two spellings cannot drift — there is one label, and a phone shows the tail of it. The tail is also what the route is called everywhere else a visitor meets it (`/todays-activity`, and the nav glyph is the sparkline shape), so the short form names the destination rather than abbreviating a title.

The three glyphs are authored to one convention — 24×24 viewBox, `currentColor` stroke, round caps and joins, no fill — and each is drawn as the thing it leads to rather than as a stock icon: a house, a folded sheet with a headline rule over two body lines, and the same jagged line as the sparklines the page is full of. Stroke width is the range's own two ends, `1.5` inactive and `1.75` active, which gives the active state a second, non-colour channel; before that, active and inactive differed by colour alone.

### Menus and Disclosures

Every popover is `panel-overlay`: the heaviest blur in the product (16px), nearly opaque at 0.82, `elev-3`, a plain border rather than the lit rim, and `4px` of padding around `12px` rows. It is nearly opaque for a reason the other tiers do not share — what shows through it is *text*, and text through glass is unreadable in a way weather never is.

The selected row takes `surface-strong` with **Signal Blue Active** text (4.82:1). One is a `<details>`/`<summary>` — every option is a link, so opening costs no JavaScript — and three are client popovers sharing one hook. Busy and blocked are never the same signal: dimming says "you cannot", and "working on it" is said in words, in the same live region the errors use.

Those three declare `role="menu"` on the list (not on the panel — the panel also holds a group header and a `role="status"` line, neither of which is a menu item), and they keep the promise the role makes: focus enters on open, landing on the row marked current where there is one; Up/Down move between rows and Left/Right between the two controls on a row; Home/End jump the ends; a typed ticker jumps to it (`n`, `v` → NVDA, with a 700ms buffer); Escape closes and returns focus to the trigger; Tab returns focus to the trigger and then keeps going, because a menu does not trap. Nothing inside is in the tab order — focus is moved, not tabbed.

### Named Rules

**The Keycap-Or-Nothing Rule.** A keyboard hint is drawn as a **key** — a plate with a border, inset like a keycap — or it is not drawn at all. Bare letters set quietly beside a label have no container, no affordance and nothing punctuating them as an input: the only thing separating them from the interface's own text is that they are fainter, and faint stray text reads as debris, not as an offer. Tested the hard way here — the first version was read as characters somebody had forgotten to delete. Loudness is not the missing ingredient; shape is.

**The Kept-Promise Rule.** An ARIA role is a specification, not a label. `role="menu"` and `aria-haspopup="menu"` commit you to focus-on-open, arrow navigation, type-ahead and Tab-exits; ship the attribute without the behaviour and a screen-reader visitor is told to press keys that do nothing, which is worse than declaring a plain disclosure. Either build the pattern or use `aria-expanded` alone and mean it.

### Data Table

`12px` cells, a `surface-soft` header band (a scrolled table otherwise loses its column labels into the data), `hairline` dividers, `surface-soft` row hover. Column labels never wrap — the header should be the one thing in a column that never reflows. The row's primary value takes one size step above the rest of the cells; the second read takes weight instead of a third size.

**A cell holding a drawing fills its column rather than sitting at a fixed size in it.** The session sparkline was 96px inside a 193px column at 1920; because the SVG carries a viewBox, a wider box *redraws* the session rather than stretching it, which is the treatment the Market Overview card already gave the same mark. Capped at 140px so it does not outgrow the figures beside it.

**A brand mark above the fold loads eagerly.** The watchlist and Top Movers are the first thing under Home's session band, and a lazy request that starts after layout leaves an empty light plate where a logo should be for several hundred milliseconds — on first paint, on the page a visitor judges the product by. Sixty news thumbnails still pay for themselves lazily.

### Surfaces That Take a Second Column

Three surfaces split above their breakpoints, and each one is instructive about a different constraint.

- **The news list** is a CSS grid, and its dividers are drawn **per cell** rather than as a grid gap. A gap showing a hairline-coloured background through it would require every row to become an opaque plate — The One Translucent Layer Rule broken for the sake of a line. The odd child takes a right border; the last two lose their bottom one.
- **Today's Timeline splits its array in the server component**, not in CSS, and this is the case where CSS genuinely cannot do the job. `columns-2` will not work because the rail is drawn per row as "a segment unless this is the last entry", and CSS decides where a multi-column list breaks, so the rail runs off the bottom of the first column into nothing. A two-column grid will not work either: in row-major flow the sequence reads *across* while the rail runs *down*, and the two contradict each other. Splitting the array is also what makes the columns read the way a newspaper column does — down the first, then down the second, each with a rail that starts and ends on an entry. The seam is the one thing left to CSS: a single connector, drawn while the columns are stacked and hidden once they sit side by side.
- **The AI Daily Summary** takes a `1fr` + `30rem` split instead of a measure cap. See the Lede role and The Filled Right Rule.

### The Session Digest

The first thing on Home and the only thing above Market Overview: one horizontal band answering how the session went, before a visitor scrolls into any of the detail that explains it. It was a 352×191 card in the right half of a header whose left half was the 52px date; once that date moved into the shell the header had nothing left to balance, and the digest inherited the slot outright — which is what it was written to be. Laid along the full content column it reads as one line of consequence and costs ~90px of height instead of 191, closing ~114,000px² of empty header.

It carries `flex-wrap` with **no breakpoint of its own**: the four groups have their own natural widths, so the band folds wherever they stop fitting rather than at a number somebody picked. The market-open dot and its label are no longer here — they are true on every route, so they live in the shell's session marker instead.

### Signature Component — the Night Sky

A single fixed layer at `z-index: -1`, inside the root stacking context so every backdrop-filter above it has something to sample. **Five masses** of cloud built from lobe clusters displaced by `feTurbulence` + `feDisplacementMap`, and 313 silver stars in three tiers.

The masses are a composition and are balanced by measurement, not by eye. In the 1600×1000 viewBox they run `haze` 0.07 — large, low, felt and not seen, because at a readable opacity a mass that size floods the frame — then `drift` 0.16 upper middle-left, the dominant at 0.22, its companion at 0.19, and a fifth at 0.20. The dominant–companion pair keeps the relationship the composition was solved for: centres 175 apart against a combined radius of 260, a ratio of **0.67**, inside the 0.55–0.85 band where two masses read as one weather system rather than as two blobs or one lump.

**The frame's centre of gravity sits at x 961 of 1600 (60%), where it used to sit at 1192 (74%).** The old right-heavy composition was counterweighting a 240px rail down the left side of the page, and that reason expired the moment navigation moved into a card across the top — it is recorded in a comment at the definition so it is not re-derived from the shape. Three things brought it back: the dominant mass shrank by a fifth and dropped from 0.28 opacity, it moved out of the crop's edge, and the left-hand `drift` was raised from a faint trace to real mass (0.12 → 0.16, 5.1% → 13.5% of the frame's weight).

Two invariants: the **bright** stars are excluded from the union of every panel rectangle on all three routes with 24 units of margin — a dim star bleeding through glass is what the material is for, a crisp bright one under text is a hot spot, and the Worst-Case Composite Rule does not model point sources. And a star must be **big enough to survive the blur**: a Gaussian of standard deviation σ reduces a disc of radius r to roughly `r²/(r²+2σ²)` of its peak, and Chrome's `blur(Npx)` is about σ = N/2, so the old 10px blur left a 1.3px star at six per cent of its brightness. Thinning the glass never revealed a star because the alpha was never the binding constraint — the blur was.

**The Cropped-Frame Rule.** The sky is drawn with `preserveAspectRatio="xMidYMid slice"`, so the viewBox is **cropped, never fitted**: a viewport narrower than 1.6:1 sees only the middle band of it, and a phone sees very little else. **Compose against the crop, not against the viewBox.** The dominant mass was centred at x 1530 of 1600 and at a 1470px viewport the visible range is 65–1535 — so what reached the screen was the mass's side, with no silhouette, reading as a wall of colour pinned to the right edge rather than as a shape. Moving its centre to 1450 gave it back its own form at every width. Anything authored near the frame edge is authored where most viewports will not see it whole.

### Motion

One authored moment, and it belongs to the material rather than to a component: **the pane focusing.** An overlay enters slightly small, a little high, and nearly clear — 2px of blur against its resting 16 — so for a fifth of a second the sky behind it is almost sharp and then frosts over as the surface settles. Blur is the one property in this system that literally means "there is glass here", so it is the honest thing to animate when glass appears.

Everything else is arrival, and it arrives in **two phases**. First the room: the masthead resolves behind a travelling mask, four sections rise 14px over 700ms on a 100ms stagger (budgeted so the last lands at exactly 1.00s), and two meteors cross the sky. Then the instruments: at `--enter-instruments` (800ms) the sparklines and the intraday line draw themselves left to right in the direction of the session they plot, and the breadth bar's segments grow from the outside toward the split between them.

The phase split is the entire motion budget. Every one of these used to start at t=0 — measured at **seven animation families over about fifty elements** between 700 and 900ms. None was wrong alone; a page where fifty things move at once simply reads as unsettled however gentle each one is. Sequencing drops peak concurrency to **five families on Home** (`meteor-fall`, `page-section-in`, `bar-grow`, `chart-fade`, `chart-draw`), four on Today's Activity and three on News — re-measured from `getAnimations()`, counting only animations in their active phase. Three is what News does and what this said for all three routes. The two Home carries on top are the ambient meteors, which never stop, and the 200ms in which the room's stagger (to 1.00s) overlaps the instruments' start (at 800ms) — both are the budget working, not leaking. No animation was shortened or removed to get there: only delays moved, and the page's tail grew from 1.3s to ~2.1s. The only loop in the product is the bright stars breathing.

`prefers-reduced-motion` is honoured with an **alternative, not a kill**: ambient motion stops entirely, but feedback keeps an arrival — the overlay still fades in over 160ms, because a menu that blinks into existence is harder to follow than one that arrives, not easier.

### Named Rules

**The Room-Then-Instruments Rule.** Arrival happens in two phases and never in one. Structure first — masthead, panels, weather — then the things drawn inside the panels, offset by `--enter-instruments`. When the budget is too loud, **sequence before you shorten and shorten before you delete**: a slower page that moves in one place at a time reads calmer than a fast page that moves everywhere at once, and it costs nothing anyone asked for.

**The Arrival-Not-Recurrence Rule.** Arrival is allowed; recurrence is not. A line drawing itself once, as the page appears, is the same event as the panel under it arriving — it says "here is the session". The same line redrawing on a timer would say "the session is still running", which is the lie this product's whole motion design exists to prevent.

**The Bounded Motion Rule.** Motion is affordable exactly where it is bounded. Animating `backdrop-filter` is expensive, which is precisely why it happens on one small element, once, on an explicit user action. The tempting place to put motion in this world is the sky — drifting the clouds behind everything — and it is forbidden: **fourteen** glass surfaces sample that sky on Home and twelve on Today's Activity, so anything moving behind them invalidates every backdrop-filter on the page, on every frame, continuously. (This said *eight* and was measured again: `panel` ×12, `panel-rail`, `panel-control`. The count grew with the pages; the rule it justifies only got stronger.) **None of the fourteen is nested inside another** — checked on both routes, zero containment — so the One Translucent Layer Rule holds and the cost is fourteen single passes rather than a stack. The stars get away with breathing only because they are kept off the panel rectangles, so their invalidation never intersects a pane.

**Scrolling is movement behind the glass, and this rule never accounted for it.** The sky is `position: fixed` and the panes are not, so every pane's sampled region changes on every scrolled frame — the same invalidation the rule forbids animating into, arriving by a route it did not consider. Reported as whole blocks arriving late on an **iPad 10th gen**, an A14 from 2022, which is worth stating because "the device is old" was the first explanation and it was wrong: the page was at fault. The fix is `transform: translateZ(0)` on `.night-sky`, promoting it so WebKit caches the filtered SVG as a texture instead of re-rasterising two `feTurbulence` filters at `numOctaves="4"` across a Retina viewport. It resolved the report on the device.

`translateZ(0)` rather than `will-change`: the hint is permanent, not tied to a known animation, and `will-change` left on at rest is overuse. **Nothing on this layer animates — it is promoted to be cached, not moved.** The risk that had to clear first is that a transform creates a stacking context, and the sky must stay in the root one for the panes to sample it; verified by pixel-diffing Home rather than by counting panes, since a pane count cannot tell a sampled backdrop from a dead one. Mean absolute difference 0.056 at 1440 and 0.007 at 390, with the pane interiors byte-identical and nowhere near the flat backdrop.

**Two hypotheses died on the way and should not be re-run.** The 18 `star-breathe` loops were the prime suspect until "only while scrolling, never idle" ruled them out — continuous filter re-evaluation would be hot sitting still. And local Chrome measurement showed nothing at all: 6× CPU throttle, a synthetic 60-row list, a 17,469px pane, glass on versus off, all pinned at a vsync-capped 16.7ms median with zero dropped frames. **That measured the Mac's headroom, not the page's cost.** Blink does not schedule fixed-layer compositing the way WebKit does; a clean local profile is not evidence about Safari.

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
- **Do** derive a `ch` cap by measuring the passage it governs. `ch` is the width of a zero, not of a character.
- **Do** give a wide panel a second column rather than a narrower measure. The width has to be spent, not reclaimed.
- **Do** compose the sky against the *cropped* frame. `slice` means most viewports never see the viewBox whole.
- **Do** check a grid at every column count it passes through, not only at its widest.
- **Do** state a busy state in words. Dimming can only say "no", never "wait".
- **Do** sequence a loud arrival into phases before shortening or deleting any of it.
- **Do** declare a keyboard shortcut in `aria-keyshortcuts` on the control it operates, whether or not it is drawn.
- **Do** give every control a 44px target on `pointer-coarse` and leave it alone on a mouse. Where the box cannot grow — a link inside a heading row whose height other sections align to — grow the *target* instead: `py` on an inline element, or a `pointer-coarse` `::after` overlay, both of which take pointer events without entering the line box.
- **Do** check a child against its parent's rounded outline, not its bounding rect, and prove the check can fail before trusting a clean run.
- **Do** measure at the device's real width. An iPad 10th gen is 820 and 1180; a report about "iPad" is not a report about 768.
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
- **Don't** colour an action in a hue that already means something else on the same screen. Use a glyph.
- **Don't** replace a quiet answer with a dash or a blank. On the ordinary day it becomes a column of dashes that reads as data that failed to load.
- **Don't** state the same fact in the shell and on a page. One of the two will drift.
- **Don't** fill a display slot because the page has one. Home has no display element on purpose.
- **Don't** split a heading into per-character boxes. The kerning does not survive it.
- **Don't** author the weather anywhere but `night-sky.tsx`, or mirror its colours into a CSS token that nothing can check.
- **Don't** span an orphaned card across the remainder of its row. Let the cell stay empty.
- **Don't** trust `justify-between` to hold a right edge on a row that wraps, or a flex `gap` to replace a space that belonged to the text.
- **Don't** conclude a page is cheap because the app is small. Fill rate is what a scroll costs, and it has nothing to do with how little data or JavaScript is behind it.
- **Don't** add an eyebrow, a section number, a gradient text fill, or a hard offset shadow. None of them belong to this world.
