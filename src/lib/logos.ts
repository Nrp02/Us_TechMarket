// Company logo marks, vendored locally under public/logos/ as static SVG files
// rather than pulled from an npm package at runtime.
//
// Two sources, per the logo-sourcing rule in CLAUDE.md (a free-to-use icon
// library, never scraped off an arbitrary page):
//   - Simple Icons (CC0-1.0) — the monochrome 24-grid marks: AAPL, AMD, AVGO,
//     CSCO, INTC, INTU, NVDA, PLTR, QCOM, TSLA.
//   - thesvg (github.com/glincker/thesvg) — the full-colour marks Simple Icons
//     no longer ships: ADBE, AMZN, CRM, GOOGL, META, MSFT, MU.
//
// Companies with no freely-licensed mark at all (Texas Instruments,
// ServiceNow) or whose only mark is a wordmark too wide to read at any badge
// size (Oracle, ~7.7:1) fall back to a lettermark plate in the components
// below.
export const HAS_LOGO = new Set([
  "NVDA",
  "AAPL",
  "MSFT",
  "GOOGL",
  "META",
  "AVGO",
  "TSLA",
  "PLTR",
  "AMD",
  "CSCO",
  "ADBE",
  "INTC",
  "QCOM",
  "INTU",
  "CRM",
  "AMZN",
  "MU",
]);

export function logoSrc(symbol: string): string {
  return `/logos/${symbol}.svg`;
}

/**
 * Marks whose visual mass sits off the centre of their own bounding box, with a
 * Tailwind class nudging them back. Lives here rather than in a component
 * because more than one place renders a logo — the watchlist badge and the news
 * thumbnail do it independently — and a correction applied in only one of them
 * is the bug this replaced.
 *
 * Amazon is the only entry. Its artwork is the "amazon" wordmark over the orange
 * swoosh: measured against the vendored SVG, the wordmark occupies the top 59%
 * of the canvas and the swoosh the rest, putting the dark text's centre 20% of
 * the canvas height above the box centre. Centring the box is geometrically
 * correct and reads as sitting high, because the eye tracks the wordmark and not
 * the pale arc. The nudge is expressed as a percentage of the image's own
 * height, so it holds at every size the mark is drawn at.
 */
const OPTICAL_NUDGE: Record<string, string> = {
  AMZN: "translate-y-[15%]",
};

/** Vertical correction for `symbol`'s mark, or "" when it needs none. */
export function logoNudge(symbol: string): string {
  return OPTICAL_NUDGE[symbol] ?? "";
}
