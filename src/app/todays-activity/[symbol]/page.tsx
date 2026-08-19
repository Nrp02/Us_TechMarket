import { notFound } from "next/navigation";

import { ActivityStats } from "@/components/activity-stats";
import { ActivityTimeline } from "@/components/activity-timeline";
import { AddStockMenu } from "@/components/add-stock-menu";
import { CompanyLogo } from "@/components/company-logo";
import { DailySummaryCard } from "@/components/daily-summary-card";
import { IntradayChart } from "@/components/intraday-chart";
import { SectionHeading } from "@/components/section-heading";
import { StatusBadge } from "@/components/status-badge";
import { SymbolSwitcher } from "@/components/symbol-switcher";
import { UpcomingEvents } from "@/components/upcoming-events";
import { formatChange, formatDay, formatPercent, formatPrice } from "@/lib/format";
import { getActivity } from "@/lib/queries";
import {
  readWatchlist,
  WATCHLIST_MAX,
  WATCHLIST_MIN,
} from "@/lib/watchlist";

// One page per stock, reached through the nav card and the header switcher. There
// is no secondary tab bar by design — the dense AI summary below replaces the
// Overview/News/Events/Financials/Charts/Peers tabs the early mockups had.
//
// Reads cached tables only. No upstream call, and no AI call: the narrative was
// written once, after the close.
//
// Not "force-dynamic" — see the note on the Home page: it implies revalidate 0
// and disables the data cache getActivity depends on. readWatchlist reads a
// cookie below, which is what keeps the route dynamic.

// Every route shared the one <title> from layout.tsx, so NVDA and AAPL were
// indistinguishable in the tab strip, in history and in a bookmark — on a
// product whose unit of value is one page per stock.
//
// The tab now carries the session's move as well as the symbol, and that is
// utility rather than decoration. This is a once-a-day product: the realistic
// visit leaves three or four of these open across a lunch break, and a tab
// strip reading "NVDA −0.06%  AAPL +0.22%  AVGO −5.93%" answers the page's own
// question without any of them being focused. It stays inside the product's
// rules — a figure the ingestion job already stored, signed, stated, with no
// claim about why or what next.
//
// It reads from the same `unstable_cache`d query the page body uses, so within
// the 60s window it costs nothing. If the symbol is untracked the page 404s
// anyway; the fallback keeps the tab sane on the way there.
export async function generateMetadata({
  params,
}: PageProps<"/todays-activity/[symbol]">) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();
  const activity = await getActivity(upper);
  if (!activity) return { title: upper };
  return { title: `${upper} ${formatPercent(activity.ticker.changePercent)}` };
}

export default async function TodaysActivityForSymbol({
  params,
}: PageProps<"/todays-activity/[symbol]">) {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase();

  // Still needed for the header dropdown's +/- controls, even though the
  // activity read itself no longer splits news by watchlist.
  const watchlist = await readWatchlist();
  const activity = await getActivity(symbol);

  // No cached price for this symbol means it is not one we track at all.
  if (!activity) notFound();

  const { ticker } = activity;
  const up = ticker.changePercent >= 0;

  return (
    <div className="page-enter flex flex-col gap-10 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-4">
          <CompanyLogo symbol={ticker.symbol} name={ticker.name} />
          <div>
            {/* Ticker only — the header is the switcher, not a company title.
                Wrapped in an h1 because the page had no heading at all: the
                ticker was a bare <button>, so a screen reader's heading list
                gave this page no identity. The button keeps its own type
                styling; the h1 is purely structural.

                Adding a stock is a separate control from the switcher now —
                see add-stock-menu.tsx for why the two were split. */}
            <div className="flex flex-wrap items-center gap-2">
              <h1>
                <SymbolSwitcher symbol={ticker.symbol} symbols={watchlist} min={WATCHLIST_MIN} />
              </h1>
              <AddStockMenu symbols={watchlist} max={WATCHLIST_MAX} />
            </div>
            <p className="px-2 text-sm text-body">
              {ticker.name} · session of {formatDay(activity.sessionDay)}
            </p>
          </div>
        </div>

        {/* The number the visitor came for, and it now sits at `text-figure`
            like every other large reading in the product.

            It was `text-display` — 52px, measured, which is the size of the
            Home page's h1 and 22px above the five stat cells directly beneath
            it. That inverted the page's own hierarchy twice over: the h1 here
            is the ticker at 30px, so the value shouted louder than the thing it
            describes, and the same figure appeared at two sizes depending on
            which card it was in.

            One step for a large mono reading, everywhere: Market Overview's
            index levels, the five stat cells, and this. What separates the
            price from the readings below is now position, the tinted change
            plate under it and the badge beside it — three channels, none of
            them size, which is the right way round for a value that is already
            the only figure in the header. */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end">
            <p className="font-mono text-figure font-medium tabular-nums text-ink">
              {formatPrice(ticker.price)}
            </p>
            <p
              className={`mt-2 inline-flex items-center rounded-full px-3 py-1 font-mono text-base font-medium tabular-nums ${
                up
                  ? "bg-tint-up text-semantic-up"
                  : "bg-tint-down text-semantic-down"
              }`}
            >
              {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
            </p>
          </div>
          {/* Same shared rule as the Home page badge and Top Movers ranking. */}
          <StatusBadge significant={ticker.significant} onGlass />
        </div>
      </header>

      <ActivityStats activity={activity} />

      <DailySummaryCard summary={activity.summary} symbol={ticker.symbol} />

      <section>
        <SectionHeading meta="Recorded every 15 minutes">
          Price &amp; Volume
        </SectionHeading>
        <IntradayChart points={activity.intraday} up={up} />
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ActivityTimeline entries={activity.timeline} />
        <UpcomingEvents events={activity.events} />
      </div>
    </div>
  );
}
