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

          The heading is capped so it reads as a block rather than a ribbon,
          which is what leaves room for the digest beside it. Previously it ran
          the full width and the remaining ~800px of the header held nothing.

          **Two lines, not four.** The cap was 13ch, chosen against Inter, and
          it broke the 33-character headline at every word: "What / happened to
          / your stocks / today". The serif is the wider face, so a measure that
          gave three lines in Inter gave four here, and four lines of display
          type is a wall rather than an opening. At 20ch it breaks once, near
          the middle, and `text-balance` evens the two halves.

          Below about 1200px the heading column shrinks against the digest,
          which is `shrink-0`, so this returns to three lines rather than
          overflowing. That is the intended degradation, not a regression.

          The cap is on the h1 itself, not on the wrapper. `ch` resolves against
          the element's own font size, so the same number on a 16px wrapper
          means something completely different from what it means on a 52px
          heading — at 16ch the wrapper measured 270px and broke the headline
          into six one-word lines. Being in `ch` also makes the break points
          scale-invariant: the clamp can move the size from 36px to 52px and the
          line breaks stay where they are. */}
      <header className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <h1 className="page-title max-w-[20ch] text-balance text-ink">
            What happened to your stocks today
          </h1>
          <p className="mt-4 max-w-[52ch] text-sm text-body">
            Prices recorded every 15 minutes across 20 US technology stocks.
          </p>
        </div>

        <SessionDigest tickers={top20} sessionDay={sessionDay} />
      </header>

      <MarketOverview tickers={indices} />

      {/* Watchlist and Top Movers side by side — and the breakpoint is measured
          rather than chosen. The watchlist table's real min-content width is
          788px (916px before this pass tightened its cells), and Top Movers
          stops being readable under about 260px. 788 + 24 gap + 260 = 1072px of
          inner content, which needs 1072 + 80 padding + 272 rail = 1424px of
          viewport. Hence 1440: the first standard step that clears it.

          Below that they stack, because the alternative is a watchlist that
          scrolls sideways permanently and hides two of its eight columns. The
          table is the page's primary object; Top Movers is a digest of it, and
          a digest does not get to cost the thing it summarises.

          minmax on the second track lets Top Movers give its slack back to the
          table between 1440 and about 1600, where the table is still the
          tighter of the two. */}
      {/* 790px, not 788: the track sizes the panel's border box while the
          table's min-width sizes its content box, and the panel carries a 1px
          border on each side. At 788 the table scrolled by exactly 2px — the
          borders — which is invisible to the eye and not to the scrollbar. */}
      <div className="grid grid-cols-1 gap-10 min-[1440px]:grid-cols-[minmax(790px,1fr)_minmax(260px,340px)] min-[1440px]:gap-6">
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
