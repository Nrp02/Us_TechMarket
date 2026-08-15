// Which trading day the News page filters to, resolved from the URL's `date`
// param plus the set of days that actually have stored articles.
//
// A hand-edited or stale URL must not be able to break the page — the same
// reasoning that makes a bad watchlist cookie normalise instead of breaking a
// render (see normaliseWatchlist in watchlist.ts). An unknown or malformed
// date here falls back to today rather than showing an empty page with no
// explanation.

export type ResolvedNewsDate = {
  /** The ET trading day to filter to, or null when nothing should be filtered. */
  date: string | null;
  isToday: boolean;
  isAll: boolean;
};

export function resolveNewsDate(
  requested: string | undefined,
  today: string,
  availableDates: string[],
): ResolvedNewsDate {
  if (requested === "all") return { date: null, isToday: false, isAll: true };

  // Today is always a valid choice even before any article has landed for it —
  // the page shows its own empty state rather than silently falling back to a
  // day the visitor did not ask for.
  if (requested === today) return { date: today, isToday: true, isAll: false };

  if (requested && availableDates.includes(requested)) {
    return { date: requested, isToday: false, isAll: false };
  }

  return { date: today, isToday: true, isAll: false };
}
