import { CompanyLogo } from "@/components/company-logo";
import { StatusBadge } from "@/components/status-badge";
import { formatPercent, formatPrice, formatRelVolume } from "@/lib/format";
import type { Ticker } from "@/lib/queries";

// Ranked by the shared significance score across the full Top 20, not just the
// watchlist — a stock can lead Top Movers without being on the watchlist.
export function TopMovers({ tickers }: { tickers: Ticker[] }) {
  const movers = [...tickers].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Top Movers Today</h2>
        <span className="text-xs text-muted">Ranked across the Top 20</span>
      </div>

      <ol className="rounded-3xl border border-hairline bg-canvas">
        {movers.map((ticker, index) => (
          <li
            key={ticker.symbol}
            className="flex items-center gap-4 border-b border-hairline px-5 py-4 last:border-0"
          >
            <span className="w-4 font-mono text-sm tabular-nums text-muted">
              {index + 1}
            </span>
            <CompanyLogo symbol={ticker.symbol} name={ticker.name} />

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">{ticker.symbol}</div>
              <div className="truncate text-xs text-muted">{ticker.name}</div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm tabular-nums text-ink">
                {formatPrice(ticker.price)}
              </div>
              <div
                className={`font-mono text-xs tabular-nums ${
                  ticker.changePercent >= 0
                    ? "text-semantic-up"
                    : "text-semantic-down"
                }`}
              >
                {formatPercent(ticker.changePercent)} ·{" "}
                {formatRelVolume(ticker.relativeVolume)}
              </div>
            </div>

            <StatusBadge significant={ticker.significant} />
          </li>
        ))}

        {!movers.length && (
          <li className="px-5 py-8 text-sm text-muted">
            No price data cached yet — run a refresh.
          </li>
        )}
      </ol>
    </section>
  );
}
