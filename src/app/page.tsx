import { MarketOverview } from "@/components/market-overview";
import { NewsTeaser } from "@/components/news-teaser";
import { TopMovers } from "@/components/top-movers";
import { WatchlistTable } from "@/components/watchlist-table";
import { getNewsTeaser, getTickers, getWatchlistSymbols } from "@/lib/queries";
import { INDEX_SYMBOLS, TOP_20_SYMBOLS } from "@/lib/symbols";

// Reads the cached tables on every request, so the page always reflects the
// latest refresh without making any upstream API call itself.
export const dynamic = "force-dynamic";

export default async function Home() {
  const watchlist = await getWatchlistSymbols();

  const [indices, top20, watched, news] = await Promise.all([
    getTickers(INDEX_SYMBOLS),
    getTickers(TOP_20_SYMBOLS),
    getTickers(watchlist),
    getNewsTeaser(3),
  ]);

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
