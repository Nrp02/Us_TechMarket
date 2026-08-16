import Link from "next/link";

import { CompanyLogo } from "@/components/company-logo";
import { SectionHeading } from "@/components/section-heading";
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
import { SIGNIFICANCE_RULE_TEXT } from "@/lib/significance";
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
      <SectionHeading
        meta={
          <WatchlistPicker
            universe={TOP_20}
            selected={selected}
            min={WATCHLIST_MIN}
            cap={WATCHLIST_MAX}
          />
        }
      >
        My Watchlist
      </SectionHeading>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[788px] border-collapse text-left">
          <thead>
            {/* The header row was the same canvas as the body, separated by one
                hairline, so a scrolled table lost its column labels into the
                data. surface-soft is a half-step and reads as a header band. */}
            <tr className="border-b border-hairline bg-surface-soft">
              {HEADINGS.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  // The Status column's badge never explained its own rule
                  // anywhere in the UI. Stated once here, on the header, rather
                  // than on every row's badge — a screen reader hits it once
                  // per table instead of once per stock, and a sighted visitor
                  // gets it on hover exactly where the column is labelled.
                  title={heading === "Status" ? SIGNIFICANCE_RULE_TEXT : undefined}
                  className="px-3 py-3 text-xs font-semibold text-muted"
                >
                  {heading}
                  {heading === "Status" && (
                    <span className="sr-only"> — {SIGNIFICANCE_RULE_TEXT}</span>
                  )}
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
                  className="border-b border-hairline transition-colors last:border-0 hover:bg-surface-soft"
                >
                  <td className="px-3 py-3">
                    {/* The route to this stock's own page. Home's whole job is
                        to say which stock is worth looking at, and until this
                        link existed the answer led nowhere: the visitor had to
                        memorise the ticker, open Today's Activity (which lands
                        on a different stock), and hunt it down in a dropdown. */}
                    <Link
                      href={`/todays-activity/${ticker.symbol}`}
                      // The symbol and company name render as two sibling divs
                      // with no separator between them — measured via
                      // textContent as "NVDANVIDIA", which a screen reader is
                      // liable to announce as one run-together word rather
                      // than the two-part identity a sighted reader gets from
                      // the line break. The explicit name is the fix.
                      aria-label={`${ticker.symbol} – ${ticker.name}`}
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
                  {/* Price is what the row is about, so it carries the one size
                      step above the rest of the cells. Change % is the second
                      read and takes the weight instead of a third size. */}
                  <td className="px-3 py-3 font-mono text-base font-medium tabular-nums text-ink">
                    {formatPrice(ticker.price)}
                  </td>
                  <td className={`px-3 py-3 font-mono text-sm tabular-nums ${moveColor}`}>
                    {formatChange(ticker.change)}
                  </td>
                  <td
                    className={`px-3 py-3 font-mono text-sm font-semibold tabular-nums ${moveColor}`}
                  >
                    {formatPercent(ticker.changePercent)}
                  </td>
                  <td className="px-3 py-3 font-mono text-sm tabular-nums text-body">
                    {formatVolume(ticker.volume)}
                  </td>
                  <td className="px-3 py-3 font-mono text-sm tabular-nums text-body">
                    {formatRelVolume(ticker.relativeVolume)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge significant={ticker.significant} />
                  </td>
                  <td className="px-3 py-3">
                    <Sparkline values={ticker.spark} up={up} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!tickers.length && (
          <p className="px-3 py-8 text-sm text-muted">
            No prices stored for this session yet. Prices are recorded every 15
            minutes while the US market is open.
          </p>
        )}
      </div>

      {/* The Scrolling Island Rule works — the table scrolls inside its own
          wrapper instead of widening the page — but nothing ever *said* so. At
          iPad portrait the content column is 480px against an 880px table, so
          five of the eight columns are off screen, and the only affordance was
          a scrollbar measuring 1.20:1 that iPadOS hides entirely until a scroll
          is already under way. A visitor had no way to know Status and Chart
          existed.

          The breakpoint is arithmetic, not a guess: the content column is
          min(1200, viewport − 240 sidebar) − 80 padding, so the table stops
          scrolling at exactly 1200px of viewport. Tailwind's xl (1280) would
          have shown this line at widths where it is not true. */}
      {tickers.length > 0 && (
        <p className="mt-3 px-1 text-xs text-muted min-[1200px]:hidden">
          Scroll the table sideways for volume, relative volume, status and the
          day chart.
        </p>
      )}
    </section>
  );
}
