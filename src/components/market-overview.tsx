import { Sparkline } from "@/components/sparkline";
import { formatChange, formatPercent } from "@/lib/format";
import { isMarketOpen } from "@/lib/market";
import type { Ticker } from "@/lib/queries";
import { INDEX_CARDS } from "@/lib/symbols";

export function MarketOverview({ tickers }: { tickers: Ticker[] }) {
  const bySymbol = new Map(tickers.map((t) => [t.symbol, t]));
  const open = isMarketOpen();

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-ink">Market Overview</h2>
        <span className="flex items-center gap-2 text-xs font-medium text-body">
          <span
            className={`size-2 rounded-full ${open ? "bg-semantic-up" : "bg-muted"}`}
            aria-hidden
          />
          {open ? "Market open" : "Market closed"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {INDEX_CARDS.map((card) => {
          const ticker = bySymbol.get(card.symbol);

          return (
            <article
              key={card.symbol}
              className="rounded-3xl border border-hairline bg-canvas p-5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{card.label}</h3>
                <span className="text-[11px] text-muted">{card.note}</span>
              </div>

              {ticker ? (
                <>
                  <p className="mt-3 font-mono text-lg font-medium tabular-nums text-ink">
                    {ticker.price.toFixed(2)}
                  </p>
                  <p
                    className={`mt-1 font-mono text-sm tabular-nums ${
                      ticker.changePercent >= 0
                        ? "text-semantic-up"
                        : "text-semantic-down"
                    }`}
                  >
                    {formatChange(ticker.change)} ({formatPercent(ticker.changePercent)})
                  </p>
                  <div className="mt-3">
                    <Sparkline
                      values={ticker.spark}
                      up={ticker.changePercent >= 0}
                      width={140}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  No data yet — run a refresh.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
