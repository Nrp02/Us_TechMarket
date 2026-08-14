// Which of the three News tabs an article belongs to.
//
// This is decided per request, from the tickers Finnhub attached to the article
// and the watchlist in the visitor's cookie — it is deliberately not stored on
// the row. Ingestion used to write it, splitting the Top 20 into watched and
// unwatched at fetch time, but with a per-visitor watchlist a stored value
// describes nobody: the visitor whose watchlist produced it may never return,
// and every other visitor sees a split drawn for someone else.
//
// Deriving it instead has three consequences worth knowing:
//   - Company and Industry together are always the whole Top 20, so changing
//     the watchlist never makes an article disappear from the page.
//   - A change takes effect on the next render, with no re-ingestion, because
//     all 20 symbols' articles are already stored.
//   - An article tagged with several companies counts as Company as soon as any
//     one of them is on the watchlist.

export type NewsCategory = "company" | "industry" | "market";

/**
 * `market` is the general feed, which carries no tickers at all — measured
 * across the whole stored table, 19 of 19 general-feed rows had none and 116 of
 * 116 per-symbol rows had at least one, so an empty tag list identifies it
 * exactly. Everything else is a company article, and the watchlist decides
 * whose.
 */
export function categoriseNews(
  relatedSymbols: string[],
  watchlist: string[],
): NewsCategory {
  if (!relatedSymbols.length) return "market";
  return relatedSymbols.some((symbol) => watchlist.includes(symbol))
    ? "company"
    : "industry";
}
