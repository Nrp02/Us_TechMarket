// The oldest ET day the News page will show.
//
// Its own module rather than a helper inside queries.ts for the mechanical
// reason recorded for news-select.ts and watchlist.ts: queries.ts imports
// lib/supabase, which builds the client at module load and throws without env
// vars, so a rule defined there cannot be loaded by the test runner at all.

import { tradingDay } from "@/lib/market";

/** How many ET trading days of news the product keeps, and will show. */
export const RETENTION_DAYS = 7;

/**
 * Calendar-day arithmetic on a YYYY-MM-DD ET date, done in UTC parts so no
 * timezone is involved at all.
 *
 * Not `Date.now() - 6 * 86_400_000`, which is what this used to be: 144 fixed
 * hours is not six ET calendar days across a DST transition. Measured for 2026,
 * it drifted in both directions — the window opened to 8 days between 00:00 and
 * 00:59 ET in spring-forward week (the picker then dropped the extra day, since
 * it only offers six past dates) and closed to 6 days in fall-back week, hiding
 * a day that was still retained.
 */
function shiftDays(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

/**
 * The retention floor, given the newest ET day that actually has a stored
 * article (null when the table is empty).
 *
 * Anchored on the stored data rather than on the clock alone, which is what
 * keeps it from cancelling the guard in 0008_retention_keep_last.sql. That
 * guard exists because Supabase pauses a free-tier project after ~7 days of
 * inactivity and cron stops with it: on resume every surviving row is older
 * than a clock-only floor, so the whole News page, its date picker and the Home
 * teaser would render empty while the guard was busy preserving exactly the
 * rows meant to keep them full.
 *
 * The floor still never admits more than RETENTION_DAYS days, and is never
 * looser than the clock floor when fresh data exists — a future-dated
 * `published_at` from upstream cannot pull the window forward and hide days
 * that are legitimately retained.
 */
export function newsRetentionCutoff(
  newestStoredDay: string | null,
  now: Date = new Date(),
): string {
  const clockFloor = shiftDays(tradingDay(now), -(RETENTION_DAYS - 1));
  if (!newestStoredDay) return clockFloor;

  const anchored = shiftDays(newestStoredDay, -(RETENTION_DAYS - 1));
  return anchored < clockFloor ? anchored : clockFloor;
}
