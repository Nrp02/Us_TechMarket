import { MarketOverview } from "@/components/market-overview";
import { NewsTeaser } from "@/components/news-teaser";
import { SessionDigest } from "@/components/session-digest";
import { TopMovers } from "@/components/top-movers";
import { WatchlistTable } from "@/components/watchlist-table";
import { getNewsTeaser, getSessionDay, getTickers } from "@/lib/queries";
import { INDEX_SYMBOLS, TOP_20_SYMBOLS } from "@/lib/symbols";
import { readWatchlist } from "@/lib/watchlist";

// Reads cached tables only, never an upstream API.
//
// Deliberately not "force-dynamic": that setting also means revalidate 0, which
// switched off the data cache in lib/queries.ts and made every render re-query
// Supabase. The page is still rendered per request — readWatchlist reads a
// cookie, which is what makes a route dynamic — so removing it changes nothing
// a visitor sees except how often the query underneath actually runs.

export default async function Home() {
  const watchlist = await readWatchlist();

  // One ticker fetch covering indices + Top 20 (watchlist is always a subset of
  // Top 20), sliced into the three views below — INDEX_SYMBOLS and
  // TOP_20_SYMBOLS each independently trigger a full-session sparkline scan, so
  // three separate calls would run that scan three times for the same day.
  const [all, news, sessionDay] = await Promise.all([
    getTickers([...INDEX_SYMBOLS, ...TOP_20_SYMBOLS]),
    getNewsTeaser(watchlist, 3),
    getSessionDay(),
  ]);
  const bySymbol = new Map(all.map((t) => [t.symbol, t]));
  const indices = INDEX_SYMBOLS.map((s) => bySymbol.get(s)).filter((t) => t != null);
  const top20 = TOP_20_SYMBOLS.map((s) => bySymbol.get(s)).filter((t) => t != null);
  const watched = watchlist.map((s) => bySymbol.get(s)).filter((t) => t != null);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-8 lg:px-10">
      {/* The page's one display-scale element. It was 24px — barely 1.3x the
          section headings under it — so the page opened with nothing leading.
          The session date sits below the heading rather than above it: a date
          set above a title is a kicker, and the heading carries its own weight.

          The heading is capped so it breaks into three short lines and reads as
          a block rather than a ribbon, which is what leaves room for the digest
          beside it. Previously it ran the full width and the remaining ~800px
          of the header held nothing at all.

          The cap is on the h1 itself, not on the wrapper. `ch` resolves against
          the element's own font size, so the same number on a 16px wrapper
          means something completely different from what it means on a 52px
          heading — at 16ch the wrapper measured 270px and broke the headline
          into six one-word lines. */}
      <header className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <h1 className="max-w-[13ch] text-balance text-display font-semibold text-ink">
            What happened to your stocks today
          </h1>
          <p className="mt-4 max-w-[52ch] text-sm text-body">
            Prices recorded every 15 minutes across 20 US technology stocks.
          </p>
        </div>

        <SessionDigest tickers={top20} sessionDay={sessionDay} />
      </header>

      <MarketOverview tickers={indices} />
      <WatchlistTable tickers={watched} selected={watchlist} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <TopMovers tickers={top20} />
        <NewsTeaser items={news} />
      </div>
    </div>
  );
}
