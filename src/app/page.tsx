import { MarketOverview } from "@/components/market-overview";
import { NewsTeaser } from "@/components/news-teaser";
import { TopMovers } from "@/components/top-movers";
import { WatchlistTable } from "@/components/watchlist-table";
import { getNewsTeaser, getTickers } from "@/lib/queries";
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
  const [all, news] = await Promise.all([
    getTickers([...INDEX_SYMBOLS, ...TOP_20_SYMBOLS]),
    getNewsTeaser(watchlist, 3),
  ]);
  const bySymbol = new Map(all.map((t) => [t.symbol, t]));
  const indices = INDEX_SYMBOLS.map((s) => bySymbol.get(s)).filter((t) => t != null);
  const top20 = TOP_20_SYMBOLS.map((s) => bySymbol.get(s)).filter((t) => t != null);
  const watched = watchlist.map((s) => bySymbol.get(s)).filter((t) => t != null);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-8 lg:px-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          What happened to your stocks today
        </h1>
        <p className="mt-1 text-sm text-body">
          Daily intelligence across US technology markets.
        </p>
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
