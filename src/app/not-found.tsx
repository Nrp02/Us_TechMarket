import Link from "next/link";

// `notFound()` in the [symbol] route had no page to render, so an unknown
// ticker fell through to Next's bare default — on a product that ships a
// carefully written error boundary. Same voice as error.tsx: say what happened,
// say what is still fine, and give a way back.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-8 lg:px-10">
      {/* Display step, matching every other page's h1 — see error.tsx. */}
      <h1 className="page-title text-ink">
        That page isn&apos;t here
      </h1>

      <p className="max-w-[68ch] text-sm leading-relaxed text-body">
        This app tracks a fixed list of 20 US technology stocks, so a ticker
        outside that list has no page. Nothing is broken — the stored prices,
        news and summaries are all still there.
      </p>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href="/"
          className="rounded-full bg-primary-fill px-4 py-2 text-sm font-semibold text-white shadow-[var(--elev-1)] transition-colors hover:bg-primary-fill-hover"
        >
          Go to the watchlist
        </Link>
        <Link
          href="/todays-activity"
          className="rounded-full bg-surface-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-hairline"
        >
          Browse today&apos;s activity
        </Link>
      </div>
    </div>
  );
}
