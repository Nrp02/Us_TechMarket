import Link from "next/link";

import { NewsList } from "@/components/news-list";
import type { NewsCategory } from "@/lib/news-category";
import { getNews } from "@/lib/queries";
import { readWatchlist } from "@/lib/watchlist";

// Reads the cached news table only. Fetching and summarising happen in the
// scheduled ingestion job, never on a page view.
export const dynamic = "force-dynamic";

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
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">News</h1>
        <p className="mt-1 text-sm text-body">
          Every summary is AI-written from the source article. Latest first.
        </p>
      </header>

      {/* Fixed latest-first list — no sort control and no grid toggle by design. */}
      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/news" : `/news?tab=${t.key}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-surface-strong text-ink hover:bg-hairline"
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
