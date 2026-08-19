import { MarketOverview } from "@/components/market-overview";
import { NewsTeaser } from "@/components/news-teaser";
import { SessionDigest } from "@/components/session-digest";
import { TopMovers } from "@/components/top-movers";
import { WatchlistTable } from "@/components/watchlist-table";
import { formatDayLong } from "@/lib/format";
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
    <div className="page-enter flex flex-col gap-10 pb-10">
      {/* The page's one display-scale element. It was 24px — barely 1.3x the
          section headings under it — so the page opened with nothing leading.
          The session date IS the heading now — see the block below for why it
          took the slot from the product's name. What has not changed is that
          nothing is set above it: a date, or anything else, placed over a title
          is a kicker, and the heading carries its own weight.

          The heading is capped so it reads as a block rather than a ribbon,
          which is what leaves room for the digest beside it. Previously it ran
          the full width and the remaining ~800px of the header held nothing.

          The heading is one line and is meant to stay one. The longest date
          this can render is "Wednesday, September 30" at 23 characters, which
          clears the left column at every target width — `text-display` clamps
          to 52px only where there is room for it.

          `w-fit` shrinks the h1 to its own text rather than to the header
          column, which is what keeps the strapline's 52ch measure reading
          against the heading instead of against the page.

          items-start, not items-end. The header used to bottom-align the title
          block against the session digest, which put the h1's top edge 45px
          below the digest card's — the two things flanking the top of the page
          visibly disagreed about where the top was. */}
      <header className="flex flex-col items-start justify-between gap-8 lg:flex-row">
        <div>
          {/* The session being reported, as the headline.

              This slot held the product's name, under a newspaper reading that
              was correct at the time: masthead over strapline, with the digest
              opposite carrying the date and the market's state — the top-right
              corner of a front page. That reading depended on the nameplate
              being the largest thing here. Navigation moved into a card across
              the top and took the nameplate with it, so the front page needed a
              new headline, and it is the same structure one level down: the
              paper's name in the running head, the dated slug on page one.
              (Before either, it was "What happened to your stocks today" — the
              product's core question, which Home does not answer. This page
              shows where things STAND; the prose answer lives on Today's
              Activity, and the question is that card's heading now.)

              The date earns the slot on two grounds beyond removing a
              duplicate. Home is a surface where somebody is finding something
              out, and at 52px the product's own name is the least useful
              element on it — you know which app you opened. And it states the
              product's central caveat in the first thing the eye lands on:
              nothing here ticks, and a visitor is looking at a completed
              session rather than a live tape. On a Monday this reads "Friday,
              August 15" beside "Market closed", which is exactly true and
              exactly what a live-tape dashboard would obscure.

              Serif, like every other page-title, and not mono. The Mono
              Numerals Rule governs a number that is DATA — a value in a column,
              comparable down it. This is the page's title, which is written.

              Falling back to the product's name when there is no session at
              all: "No session yet" is a bleak thing to set at 52px, and the
              name is never wrong. The duplicate reappears only in that state,
              which is degenerate.

              The sr-only prefix is there because a page's accessible name
              should not be a bare date. The vocabulary already exists on
              Today's Activity ("session of Tue, Aug 18"). It is inside the
              conditional so the fallback does not announce itself as "Market
              session of US TechMarket". */}
          <h1 className="page-title w-fit text-ink">
            {sessionDay ? (
              <>
                <span className="sr-only">Market session of </span>
                {formatDayLong(sessionDay)}
              </>
            ) : (
              "US TechMarket"
            )}
          </h1>
          <p className="mt-4 max-w-[52ch] text-sm text-body">
            Prices recorded every 15 minutes across 20 US technology stocks.
          </p>
        </div>

        <SessionDigest tickers={top20} />
      </header>

      <MarketOverview tickers={indices} />

      {/* Watchlist and Top Movers side by side, and the breakpoint is measured
          rather than chosen — it is the smallest viewport at which both can be
          themselves at once.

          The table's panel needs 748px (746px of min-content plus its own 1px
          borders — the track sizes a border box while min-width sizes a content
          box, and at 788 against 790 that 2px difference alone made the table
          scroll). Top Movers needs about 300px: below that its two-line row runs
          out of room for the company name, since a 24px rank, an 80px logo
          plate and the padding are fixed before any text.

          748 + 24 gap + 300 + 48 shell padding = 1120px of viewport. Hence
          1130 — the same round-up-to-a-clean-ten this file already took when
          1384 became 1390.

          It was 1440 until Rel. Volume was folded into the Volume cell, which
          took the table from 788px to 736px and bought 60px of breakpoint, and
          1390 until navigation moved out of the 240px left rail. That last
          move is worth 260px here and it changes what a laptop sees: at 1280
          this page went from one stacked column to the two-column composition
          it was drawn for. Below the breakpoint they stack, because the
          alternative is a watchlist that scrolls sideways permanently — and
          the table is the page's primary object while Top Movers is a digest
          of it. A digest does not get to cost the thing it summarises. */}
      <div className="grid grid-cols-1 gap-10 min-[1130px]:grid-cols-[minmax(748px,1fr)_minmax(300px,360px)] min-[1130px]:gap-6">
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
