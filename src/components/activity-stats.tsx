import {
  formatPercent,
  formatPrice,
  formatRelVolume,
  formatVolume,
} from "@/lib/format";
import type { Activity } from "@/lib/queries";

// The same divided band as Market Overview, for the same reason: five equally
// bordered plates read as a template, and this page already has a stronger
// element above it. Every value here is on the page's Activity payload — these
// cells add no query and certainly no fetch.
//
// The readings sit a step below Market Overview's figure scale on purpose. Here
// they support the header price and the summary; on Home the index levels are
// the page's primary content. Same component shape, different rank.

function Cell({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "up" | "down";
}) {
  const toneClass =
    tone === "up"
      ? "text-semantic-up"
      : tone === "down"
        ? "text-semantic-down"
        : "text-ink";

  return (
    <article className="border-l border-t border-hairline px-5 py-5">
      <h3 className="text-[11px] font-semibold text-muted">{label}</h3>
      <p
        className={`mt-3 font-mono text-2xl font-medium tabular-nums ${toneClass}`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs text-body">{detail}</p>
    </article>
  );
}

function tone(value: number | null | undefined) {
  if (value == null) return "neutral" as const;
  return value >= 0 ? ("up" as const) : ("down" as const);
}

export function ActivityStats({ activity }: { activity: Activity }) {
  const { ticker, sector, market, news, events } = activity;

  return (
    <section>
      <h2 className="sr-only">Today&apos;s statistics</h2>

      {/* Same one-panel construction as Market Overview — see the note there
          for why the cells draw their own top and left edge instead of using
          divide-x. */}
      <div className="overflow-hidden rounded-3xl border border-hairline bg-canvas">
        <div className="-ml-px -mt-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Cell
            label="Price Movement"
            value={formatPercent(ticker.changePercent)}
            detail={`${formatPrice(ticker.price)} at last close`}
            tone={tone(ticker.changePercent)}
          />

          <Cell
            label="Trading Activity"
            value={formatRelVolume(ticker.relativeVolume)}
            detail={
              ticker.volume == null
                ? "Volume unavailable"
                : `${formatVolume(ticker.volume)} shares vs 10-day average`
            }
            // Heavy volume is not good or bad in itself, so this cell stays
            // neutral rather than borrowing the up/down colours.
          />

          <Cell
            label="Sector Performance"
            value={sector ? formatPercent(sector.changePercent) : "—"}
            detail="Technology sector (XLK)"
            tone={tone(sector?.changePercent)}
          />

          <Cell
            label="Market Performance"
            value={market ? formatPercent(market.changePercent) : "—"}
            detail="S&P 500 (SPY)"
            tone={tone(market?.changePercent)}
          />

          <Cell
            label="News & Events"
            value={String(news.length + events.length)}
            detail={`${news.length} article${news.length === 1 ? "" : "s"}, ${
              events.length
            } upcoming event${events.length === 1 ? "" : "s"}`}
          />
        </div>
      </div>
    </section>
  );
}
