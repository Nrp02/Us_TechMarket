// The Significant Movement rule. Defined once here and imported everywhere it is
// needed (Home Status badge, Top Movers ranking, Today's Activity badge in
// Phase 4). Do not reimplement it per page.
//
//   |price change| >= 5%                            -> Significant
//   relative volume >= 2.5x                         -> Significant
//   |price change| >= 3% AND relative volume >= 1.5x -> Significant
//   else                                            -> Normal

const PCT_STRONG = 5;
const RVOL_STRONG = 2.5;
const PCT_COMBO = 3;
const RVOL_COMBO = 1.5;

/**
 * Plain-language statement of the rule above, for the one place a visitor can
 * ask what "Significant" means — a hover title on the badge. The badge itself
 * never explained its own threshold anywhere in the UI; stating it in words
 * here is the same move already used for the watchlist's +/- bounds, which a
 * dimmed control also cannot explain on its own.
 */
export const SIGNIFICANCE_RULE_TEXT =
  "Significant: price moved 5% or more, relative volume was 2.5x or more, " +
  "or price moved 3% or more together with 1.5x relative volume or more.";

/**
 * Normalised intensity of a move. Crosses 1.0 at exactly the thresholds above,
 * so `score >= 1` is the Significant/Normal test and the same number also
 * orders Top Movers — one rule, not a rule plus a separate ranking heuristic.
 *
 * `relativeVolume` is null when volume is unavailable for the symbol, in which
 * case only the price-change branch can fire.
 */
export function significanceScore(
  changePercent: number,
  relativeVolume: number | null,
): number {
  const pct = Math.abs(changePercent);
  const rvol = relativeVolume ?? 0;

  let score = Math.max(pct / PCT_STRONG, rvol / RVOL_STRONG);
  if (pct >= PCT_COMBO && rvol >= RVOL_COMBO) score = Math.max(score, 1);

  return score;
}

export function isSignificant(
  changePercent: number,
  relativeVolume: number | null,
): boolean {
  return significanceScore(changePercent, relativeVolume) >= 1;
}
