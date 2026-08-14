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
