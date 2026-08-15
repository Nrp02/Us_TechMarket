import Link from "next/link";

import { CompanyLogo } from "@/components/company-logo";
import { SectionHeading } from "@/components/section-heading";
import { StatusBadge } from "@/components/status-badge";
import { formatPercent, formatPrice, formatRelVolume } from "@/lib/format";
import type { Ticker } from "@/lib/queries";

// Ranked by the shared significance score across the full Top 20, not just the
// watchlist — a stock can lead Top Movers without being on the watchlist.
export function TopMovers({ tickers }: { tickers: Ticker[] }) {
  const movers = [...tickers].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <section>
      <SectionHeading meta="Ranked across the Top 20">
        Top Movers Today
      </SectionHeading>

      <ol className="panel overflow-hidden">
        {movers.map((ticker, index) => (
          <li
            key={ticker.symbol}
            className="border-b border-hairline last:border-0"
          >
            {/* Top Movers ranks across the full Top 20, so this list is the only
                place several of these stocks appear at all — without the link
                they were unreachable by any route in the product. Every Top 20
                symbol has cached data, so the target page always resolves. */}
            <Link
              href={`/todays-activity/${ticker.symbol}`}
              className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-soft"
            >
            {/* The rank was a bare digit in muted, so five rows of a *ranked*
                list opened with the least emphatic thing on them. As a plate it
                is the row's anchor, and the leader keeps the accent because
                first place is the one fact this list exists to state. */}
            <span
              // text-body, not text-muted: muted on surface-strong measured
              // 4.09:1 in dark — the one pair in the product under AA, on 12px
              // semibold text, in the theme every visitor sees first. body
              // measures 6.27:1 dark / 5.54:1 light and still sits a tier below
              // the accented leader, which is the only rank this list is really
              // making a claim about.
              className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold tabular-nums ${
                index === 0
                  ? "bg-tint-primary text-primary ring-1 ring-accent-edge ring-inset"
                  : "bg-surface-strong text-body"
              }`}
            >
              {index + 1}
            </span>
            <CompanyLogo symbol={ticker.symbol} name={ticker.name} />

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink transition-colors group-hover:text-primary">
                {ticker.symbol}
              </div>
              <div className="truncate text-xs text-muted">{ticker.name}</div>
            </div>

            <div className="text-right">
              <div className="font-mono text-base font-medium tabular-nums text-ink">
                {formatPrice(ticker.price)}
              </div>
              <div className="font-mono text-xs tabular-nums">
                <span
                  className={
                    ticker.changePercent >= 0
                      ? "font-semibold text-semantic-up"
                      : "font-semibold text-semantic-down"
                  }
                >
                  {formatPercent(ticker.changePercent)}
                </span>
                {/* Relative volume was coloured by the price direction it has
                    nothing to do with — the two values shared one span. Volume
                    stays neutral, per the rule that it is neither good nor bad. */}
                <span className="text-muted">
                  {" · "}
                  {formatRelVolume(ticker.relativeVolume)}
                </span>
              </div>
            </div>

            <StatusBadge significant={ticker.significant} />
            </Link>
          </li>
        ))}

        {!movers.length && (
          <li className="px-5 py-8 text-sm text-muted">
            No prices stored for this session yet. Ranking appears once the
            session&apos;s snapshots are in.
          </li>
        )}
      </ol>
    </section>
  );
}
