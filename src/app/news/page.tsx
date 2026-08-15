import Link from "next/link";

import { NewsList } from "@/components/news-list";
import type { NewsCategory } from "@/lib/news-category";
import { getNews } from "@/lib/queries";
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

export default async function News({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active: TabKey = isTab(tab) ? tab : "all";

  // Company and Industry are split against this visitor's watchlist at read
  // time, so the same stored articles land differently for different visitors.
  const watchlist = await readWatchlist();
  const items = await getNews(
    watchlist,
    active === "all" ? undefined : (active as NewsCategory),
  );

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8 lg:px-10">
      {/* This page's h1 was 24px while Home's ran to 52px, so the two pages
          opened at completely different ranks. Both are the one display element
          on their surface and both take the display step. */}
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-display font-semibold text-ink">News</h1>
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
          a thing lifted out of it. */}
      <nav
        aria-label="News categories"
        className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-full border border-hairline bg-canvas p-1 shadow-[var(--edge-lit),var(--elev-1)]"
      >
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/news" : `/news?tab=${t.key}`}
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

      <NewsList items={items} />
    </div>
  );
}
