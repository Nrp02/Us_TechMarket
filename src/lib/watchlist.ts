import { TOP_20_SYMBOLS } from "@/lib/symbols";

// The watchlist is per-browser, stored in a cookie. It used to be a single
// Postgres table, which meant any visitor editing it edited it for everyone.
//
// A cookie rather than localStorage, deliberately: Home, News and Today's
// Activity are server components that need the watchlist *at render time*, and
// a cookie arrives with the request. With localStorage those pages would have
// to fetch all 20 symbols and filter after hydration — a first-paint flash —
// and the cap could then only be enforced in the browser, which is exactly the
// failure this project already hit once, when the read path and the API
// disagreed about what the list was and let the cap reach 11.
//
// A cookie is not shared between visitors; it lives in one browser, the same as
// localStorage would. Neither separates two people sharing a browser profile —
// only accounts would, and there are none in this app.

export const WATCHLIST_COOKIE = "watchlist";

/** Removing the last stock is refused — every page assumes a non-empty list. */
export const WATCHLIST_MIN = 1;
export const WATCHLIST_MAX = 10;

/**
 * Seven rather than five, so Company News is not too thin on a first visit.
 * Order follows the Top 20, which is ordered by size.
 */
export const DEFAULT_WATCHLIST = TOP_20_SYMBOLS.slice(0, 7);

export const WATCHLIST_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
  // Nothing in the browser reads this directly — the picker mutates it through
  // /api/watchlist and the pages read it on the server.
  httpOnly: true,
} as const;

/**
 * The cap and the contents are enforced here, on every read, rather than only
 * where the list is written. A cookie is visitor-editable, so a hand-edited one
 * must not be able to break a page: unknown symbols, duplicates and an
 * over-long list are dropped instead of trusted.
 */
export function normaliseWatchlist(symbols: string[]): string[] {
  const kept = new Set<string>();

  for (const raw of symbols) {
    const symbol = raw.trim().toUpperCase();
    if (!TOP_20_SYMBOLS.includes(symbol)) continue;

    kept.add(symbol);
    if (kept.size === WATCHLIST_MAX) break;
  }

  return kept.size ? [...kept] : [...DEFAULT_WATCHLIST];
}

export function serialiseWatchlist(symbols: string[]): string {
  return symbols.join(",");
}

/**
 * The visitor's watchlist for this request. Never empty.
 *
 * `next/headers` is imported here rather than at the top of the file so the
 * rules above stay loadable outside a request: the test runner resolves modules
 * with plain Node, and the `next` package has no "exports" map, so its subpaths
 * do not resolve without a bundler. Nothing else in the module touches Next.
 */
export async function readWatchlist(): Promise<string[]> {
  const { cookies } = await import("next/headers");
  const raw = (await cookies()).get(WATCHLIST_COOKIE)?.value;
  return normaliseWatchlist(raw ? raw.split(",") : []);
}
