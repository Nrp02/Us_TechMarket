// Which trading day the News page filters to, resolved from the URL's `date`
// param plus the set of days that actually have stored articles.
//
// A hand-edited or stale URL must not be able to break the page — the same
// reasoning that makes a bad watchlist cookie normalise instead of breaking a
// render (see normaliseWatchlist in watchlist.ts). An unknown or malformed
// date here falls back to the day the page would have opened on anyway —
// today when today has articles, otherwise the newest day that does — rather
// than showing an empty page with no explanation.

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

  // Reached with no date param at all, or with a stale or malformed one. If
  // today has articles, fall through and show it. If it does not, land on the
  // most recent day that does, rather than opening the page on an empty state
  // nobody chose.
  //
  // This is what every other surface already does — getSessionStamp and
  // getLatestSessionDay in queries.ts read the session out of the newest stored
  // row, and getNewsTeaser is explicitly date-unfiltered so that "a quiet
  // morning before today's first news cycle should not empty out the Home
  // page". News was the one page still asking the clock, so the shell could
  // read "Session of Fri, Aug 21" beside a News page insisting there was
  // nothing. It is not a weekend-only case: `news-ingest` has no cycle between
  // 02:00 and 12:00 UTC, so every day has a ten-hour window where today is
  // genuinely empty.
  //
  // The `requested === today` branch above is untouched, so choosing Today from
  // the picker still reaches today's own empty state. Falling back is for
  // visitors who did not ask; it must not override one who did.
  // Clamped against today rather than taken as availableDates[0]. The list is
  // newest-first, but an upstream `published_at` stamped in the future sorts
  // ahead of every real day — the same possibility newsRetentionCutoff already
  // guards, except that clamp only protects the floor. Unclamped, one junk row
  // would land every unasked visitor on a future date holding that row alone,
  // with the real news hidden behind the picker.
  const newestPastDay = availableDates.find((d) => d <= today);
  if (newestPastDay && newestPastDay !== today) {
    return { date: newestPastDay, isToday: false, isAll: false };
  }

  return { date: today, isToday: true, isAll: false };
}
