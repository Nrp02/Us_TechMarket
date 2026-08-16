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
    <div className="flex flex-col gap-10 pb-10">
      {/* The page's one display-scale element. It was 24px — barely 1.3x the
          section headings under it — so the page opened with nothing leading.
          The session date sits below the heading rather than above it: a date
          set above a title is a kicker, and the heading carries its own weight.

          The heading is capped so it reads as a block rather than a ribbon,
          which is what leaves room for the digest beside it. Previously it ran
          the full width and the remaining ~800px of the header held nothing.

          **The break is authored, not measured.** It used to be a 20ch cap
          plus `text-balance`, which let the browser choose where to break and
          how to weight the halves — the result moved with the viewport and
          could not be centred on anything. The two lines are now separate
          spans, so the break is fixed and the shorter line can be centred over
          the longer one.

          `w-fit` is what makes that centring mean something: it shrinks the h1
          to the width of its longest line, so `text-center` on line one centres
          it over line two rather than over the whole header column.

          items-start, not items-end. The header used to bottom-align the title
          block against the session digest, which put the h1's top edge 45px
          below the digest card's — the two things flanking the top of the page
          visibly disagreed about where the top was. */}
      <header className="flex flex-col items-start justify-between gap-8 lg:flex-row">
        <div>
          <h1 className="page-title w-fit text-ink">
            <span className="block text-center">What happened</span>
            <span className="block">to your stocks today</span>
          </h1>
          <p className="mt-4 max-w-[52ch] text-sm text-body">
            Prices recorded every 15 minutes across 20 US technology stocks.
          </p>
        </div>

        <SessionDigest tickers={top20} sessionDay={sessionDay} />
      </header>

      <MarketOverview tickers={indices} />

      {/* Watchlist and Top Movers side by side, and the breakpoint is measured
          rather than chosen — it is the smallest viewport at which both can be
          themselves at once.

          The table's panel needs 738px (736px of min-content plus its own 1px
          borders — the track sizes a border box while min-width sizes a content
          box, and at 788 against 790 that 2px difference alone made the table
          scroll). Top Movers needs about 300px: below that its two-line row runs
          out of room for the company name, since a 24px rank, an 80px logo
          plate and the padding are fixed before any text.

          738 + 24 gap + 300 + 240 rail + 24 shell gap + 48 shell padding =
          1374px of viewport. Hence 1380.

          It was 1440 until Rel. Volume was folded into the Volume cell, which
          took the table from 788px to 736px and bought 60px of breakpoint.
          Below 1360 they stack, because the alternative is a watchlist that
          scrolls sideways permanently — and the table is the page's primary
          object while Top Movers is a digest of it. A digest does not get to
          cost the thing it summarises. */}
      <div className="grid grid-cols-1 gap-10 min-[1380px]:grid-cols-[minmax(738px,1fr)_minmax(300px,360px)] min-[1380px]:gap-6">
        <WatchlistTable tickers={watched} selected={watchlist} />
        <TopMovers tickers={top20} />
      </div>

      {/* Market News runs full width now, its three articles in a row rather
          than a column. It was sharing a two-up row with Top Movers, and losing
          that slot is what freed the width — the teaser is three headlines, and
          three headlines read better across than stacked in a half-column. */}
      <NewsTeaser items={news} />
    </div>
  );
}
