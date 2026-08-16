"use client";

// The fallback for a render that threw. Without this file Next serves its own
// bare "Application error: a server-side exception has occurred" page, which
// drops the sidebar and leaves a visitor with no way back.
//
// Sitting at the app root means it covers all three routes — an error bubbles to
// the nearest boundary above it, and there is no closer one. It renders inside
// the root layout, so the sidebar stays and navigation still works.
//
// What actually reaches here is narrower than it looks, and both halves were
// measured rather than assumed:
//
//   - An upstream outage never does. Pages read cached tables only, the
//     ingestion job absorbs a Finnhub failure per symbol, and a Supabase query
//     error comes back as `{ data: null }` rather than a throw.
//   - A throw during *module evaluation* never does either — a missing
//     SUPABASE_SECRET_KEY makes lib/supabase.ts throw on import, which happens
//     before the React tree exists, and Next serves a bare "Internal Server
//     Error" body no boundary can intercept.
//
// What remains is a throw during render, and the reachable one is a malformed
// timestamp in a row: Intl.DateTimeFormat rejects an Invalid Date, so every
// format helper in lib/format.ts that takes an ISO string can raise a
// RangeError on data that reached the table in the wrong shape.
//
// Note when testing: this renders on the client after hydration. The SSR shell
// is <html id="__next_error__">, so curl sees only "Internal Server Error" —
// check the boundary in a real browser.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <header>
        {/* text-display, like every other page's h1. At text-2xl this sat 4px
            above a section heading, so the one thing on the page read as a
            subsection of nothing — two adjacent steps doing different jobs at
            almost the same size, which is the hierarchy failure the ramp exists
            to prevent. Display clamps down to 36px at narrow widths. */}
        <h1 className="page-title text-ink">
          This page could not be loaded
        </h1>
        <p className="mt-1 text-sm text-body">
          The rest of the app still works — the sidebar links are unaffected.
        </p>
      </header>

      <div className="panel px-5 py-6">
        <p className="text-sm text-body">
          Cached market data could not be read. Nothing was lost: the stored
          prices, news and summaries are still there, and the next scheduled
          refresh will pick up where it left off.
        </p>

        {/* The message itself is redacted in production, so the digest is the
            only thing that ties this page to a line in the Vercel logs. */}
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted">
            Reference: {error.digest}
          </p>
        )}

        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-full bg-surface-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-hairline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
