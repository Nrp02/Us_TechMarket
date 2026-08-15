import Link from "next/link";

import { NewsList } from "@/components/news-list";
import { formatDay } from "@/lib/format";
import { tradingDay } from "@/lib/market";
import type { NewsCategory } from "@/lib/news-category";
import { resolveNewsDate } from "@/lib/news-date";
import { getNews, getNewsDates } from "@/lib/queries";
import { readWatchlist } from "@/lib/watchlist";

// Reads the cached news table only. Fetching and summarising happen in the
// scheduled ingestion job, never on a page view.
//
// Not "force-dynamic" — see the note on the Home page: it implies revalidate 0
// and disables the data cache these reads depend on. The cookie read below is
// what keeps the route dynamic.

const TABS = [
  { key: "all", label: "All News" },
  { key: "company", label: "Company News" },
  { key: "industry", label: "Industry News" },
  { key: "market", label: "Market News" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTab(value: string | undefined): value is TabKey {
  return TABS.some((t) => t.key === value);
}

/** How many past dates the picker offers beyond Today and All dates. */
const RECENT_DATES_SHOWN = 9;

// A tab switch used to also silently reset the date filter, and a date switch
// reset the tab, because each control only ever wrote its own query param.
// Every link on this page is built through here so both survive together.
function buildHref(tab: TabKey, date?: string): string {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("tab", tab);
  if (date) params.set("date", date);
  const qs = params.toString();
  return qs ? `/news?${qs}` : "/news";
}

export default async function News({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; date?: string }>;
}) {
  const { tab, date } = await searchParams;
  const active: TabKey = isTab(tab) ? tab : "all";
  const today = tradingDay();

  // Company and Industry are split against this visitor's watchlist at read
  // time, so the same stored articles land differently for different visitors.
  const watchlist = await readWatchlist();

  // Resolved before the article read, since the read needs to know which day
  // (or "no day") to filter to. A hand-edited or stale `date` param falls back
  // to today rather than showing an empty page with no explanation — same
  // reasoning as a bad watchlist cookie normalising instead of breaking a page.
  const availableDates = await getNewsDates();
  const resolved = resolveNewsDate(date, today, availableDates);

  const items = await getNews(
    watchlist,
    active === "all" ? undefined : (active as NewsCategory),
    resolved.date,
  );

  const dateLabel = resolved.isAll
    ? "All dates"
    : resolved.isToday
      ? "Today"
      : formatDay(resolved.date!);

  const otherDates = availableDates
    .filter((d) => d !== today)
    .slice(0, RECENT_DATES_SHOWN);

  const emptyMessage = resolved.isToday
    ? "No articles recorded yet today. News is fetched four times during the trading day — check back after the next cycle, or switch to All dates to see recent coverage."
    : resolved.isAll
      ? "No articles in this category yet."
      : `No articles from ${formatDay(resolved.date!)} in this category.`;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 lg:px-10">
      {/* This page's h1 was 24px while Home's ran to 52px, so the two pages
          opened at completely different ranks. Both are the one display element
          on their surface and both take the display step. */}
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="page-title text-ink">News</h1>
          {/* The measure belongs on the paragraph, not on a 16px wrapper — see
              the note on the Home header for what `ch` actually resolves to. */}
          <p className="mt-3 max-w-[62ch] text-sm text-body">
            Every summary is AI-written from the source article. Latest first.
          </p>
        </div>
        <p className="shrink-0 font-mono text-xs tabular-nums text-muted">
          {items.length} article{items.length === 1 ? "" : "s"} in this tab
        </p>
      </header>

      {/* Fixed latest-first list — no sort control and no grid toggle by design.
          The tabs sit in their own recessed track rather than floating loose on
          the page field, so the set reads as one control and the active pill as
          a thing lifted out of it. The date picker is a second, independent
          filter on the same row, right-aligned so the two read as separate
          controls rather than one continuous strip. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="News categories"
          className="panel-track inline-flex w-fit max-w-full flex-wrap gap-1 p-1"
        >
          {TABS.map((t) => {
            const isActive = t.key === active;
            const dateParam = resolved.isAll
              ? "all"
              : resolved.isToday
                ? undefined
                : (resolved.date ?? undefined);
            return (
              <Link
                key={t.key}
                href={buildHref(t.key, dateParam)}
                // The active tab was colour-only to a screen reader.
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary-fill text-white shadow-[var(--elev-1)]"
                    : "text-body hover:bg-surface-soft hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {/* Native disclosure rather than a client component — every option here
            is a link, so opening it costs no JavaScript and closing it happens
            naturally on navigation, the same reasoning that already keeps this
            page a server component. */}
        <details className="group relative shrink-0">
          <summary className="flex w-fit list-none items-center gap-2 rounded-full bg-surface-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-hairline [&::-webkit-details-marker]:hidden">
            {dateLabel}
            <svg
              viewBox="0 0 20 20"
              className="size-4 text-muted transition-transform group-open:rotate-180"
              aria-hidden
            >
              <path
                d="M5 8l5 5 5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>

          <div className="panel-overlay absolute right-0 z-20 mt-2 w-56 rounded-2xl py-1">
            <ul>
              <li>
                <Link
                  href={buildHref(active)}
                  aria-current={resolved.isToday ? "page" : undefined}
                  className={`block px-4 py-2 text-sm font-medium transition-colors ${
                    resolved.isToday
                      ? "bg-surface-strong text-primary"
                      : "text-body hover:bg-surface-soft hover:text-ink"
                  }`}
                >
                  Today
                </Link>
              </li>
              {otherDates.map((d) => (
                <li key={d}>
                  <Link
                    href={buildHref(active, d)}
                    aria-current={resolved.date === d && !resolved.isToday ? "page" : undefined}
                    className={`block px-4 py-2 text-sm font-medium transition-colors ${
                      resolved.date === d && !resolved.isToday
                        ? "bg-surface-strong text-primary"
                        : "text-body hover:bg-surface-soft hover:text-ink"
                    }`}
                  >
                    {formatDay(d)}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-hairline">
                <Link
                  href={buildHref(active, "all")}
                  aria-current={resolved.isAll ? "page" : undefined}
                  className={`block px-4 py-2 text-sm font-medium transition-colors ${
                    resolved.isAll
                      ? "bg-surface-strong text-primary"
                      : "text-body hover:bg-surface-soft hover:text-ink"
                  }`}
                >
                  All dates
                </Link>
              </li>
            </ul>
          </div>
        </details>
      </div>

      <NewsList items={items} emptyMessage={emptyMessage} />
    </div>
  );
}
