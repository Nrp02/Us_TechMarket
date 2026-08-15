import { notFound } from "next/navigation";

import { ActivityStats } from "@/components/activity-stats";
import { ActivityTimeline } from "@/components/activity-timeline";
import { CompanyLogo } from "@/components/company-logo";
import { DailySummaryCard } from "@/components/daily-summary-card";
import { IntradayChart } from "@/components/intraday-chart";
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

// One page per stock, reached through the sidebar and the header switcher. There
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
export async function generateMetadata({
  params,
}: PageProps<"/todays-activity/[symbol]">) {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} — Today's Activity · US TechMarket` };
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
  const moveColor = up ? "text-semantic-up" : "text-semantic-down";

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-8 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-4">
          <CompanyLogo symbol={ticker.symbol} name={ticker.name} />
          <div>
            {/* Ticker only — the header is the switcher, not a company title.
                Wrapped in an h1 because the page had no heading at all: the
                ticker was a bare <button>, so a screen reader's heading list
                gave this page no identity. The button keeps its own type
                styling; the h1 is purely structural. */}
            <h1>
              <SymbolSwitcher
                symbol={ticker.symbol}
                symbols={watchlist}
                min={WATCHLIST_MIN}
                max={WATCHLIST_MAX}
              />
            </h1>
            <p className="px-2 text-sm text-body">
              {ticker.name} · session of {formatDay(activity.sessionDay)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="font-mono text-2xl font-medium tabular-nums text-ink">
              {formatPrice(ticker.price)}
            </p>
            <p className={`font-mono text-sm tabular-nums ${moveColor}`}>
              {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
            </p>
          </div>
          {/* Same shared rule as the Home page badge and Top Movers ranking. */}
          <StatusBadge significant={ticker.significant} />
        </div>
      </header>

      <ActivityStats activity={activity} />

      <DailySummaryCard summary={activity.summary} symbol={ticker.symbol} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Price & Volume</h2>
        <IntradayChart points={activity.intraday} up={up} />
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ActivityTimeline entries={activity.timeline} />
        <UpcomingEvents events={activity.events} />
      </div>
    </div>
  );
}
