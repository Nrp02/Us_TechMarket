import Link from "next/link";

import { CompanyLogo } from "@/components/company-logo";
import { Sparkline } from "@/components/sparkline";
import { StatusBadge } from "@/components/status-badge";
import { WatchlistPicker } from "@/components/watchlist-picker";
import {
  formatChange,
  formatPercent,
  formatPrice,
  formatRelVolume,
  formatVolume,
} from "@/lib/format";
import type { Ticker } from "@/lib/queries";
import { TOP_20 } from "@/lib/symbols";
import { WATCHLIST_MAX, WATCHLIST_MIN } from "@/lib/watchlist";

const HEADINGS = [
  "Symbol",
  "Price",
  "Change",
  "Change %",
  "Volume",
  "Rel. Volume",
  "Status",
  "Chart (Day)",
];

export function WatchlistTable({
  tickers,
  selected,
}: {
  tickers: Ticker[];
  selected: string[];
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">My Watchlist</h2>
        <WatchlistPicker
          universe={TOP_20}
          selected={selected}
          min={WATCHLIST_MIN}
          cap={WATCHLIST_MAX}
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-hairline bg-canvas">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline">
              {HEADINGS.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-5 py-3 text-xs font-semibold text-muted"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickers.map((ticker) => {
              const up = ticker.changePercent >= 0;
              const moveColor = up ? "text-semantic-up" : "text-semantic-down";

              return (
                <tr
                  key={ticker.symbol}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-5 py-4">
                    {/* The route to this stock's own page. Home's whole job is
                        to say which stock is worth looking at, and until this
                        link existed the answer led nowhere: the visitor had to
                        memorise the ticker, open Today's Activity (which lands
                        on a different stock), and hunt it down in a dropdown. */}
                    <Link
                      href={`/todays-activity/${ticker.symbol}`}
                      className="group flex items-center gap-3"
                    >
                      <CompanyLogo symbol={ticker.symbol} name={ticker.name} />
                      <div>
                        <div className="text-sm font-semibold text-ink transition-colors group-hover:text-primary">
                          {ticker.symbol}
                        </div>
                        <div className="text-xs text-muted">{ticker.name}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm tabular-nums text-ink">
                    {formatPrice(ticker.price)}
                  </td>
                  <td className={`px-5 py-4 font-mono text-sm tabular-nums ${moveColor}`}>
                    {formatChange(ticker.change)}
                  </td>
                  <td className={`px-5 py-4 font-mono text-sm tabular-nums ${moveColor}`}>
                    {formatPercent(ticker.changePercent)}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm tabular-nums text-body">
                    {formatVolume(ticker.volume)}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm tabular-nums text-body">
                    {formatRelVolume(ticker.relativeVolume)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge significant={ticker.significant} />
                  </td>
                  <td className="px-5 py-4">
                    <Sparkline values={ticker.spark} up={up} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!tickers.length && (
          <p className="px-5 py-8 text-sm text-muted">
            No prices stored for this session yet. Prices are recorded every 15
            minutes while the US market is open.
          </p>
        )}
      </div>
    </section>
  );
}
