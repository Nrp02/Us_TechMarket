import {
  formatPercent,
  formatPrice,
  formatRelVolume,
  formatVolume,
} from "@/lib/format";
import type { Activity } from "@/lib/queries";

// The five stat cards. Every value here is already on the page's Activity
// payload — these cards add no query of their own and certainly no fetch.

function Card({
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
    <article className="rounded-3xl border border-hairline bg-canvas p-5">
      <h3 className="text-xs font-semibold text-muted">{label}</h3>
      <p className={`mt-3 font-mono text-xl font-medium tabular-nums ${toneClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-body">{detail}</p>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card
          label="Price Movement"
          value={formatPercent(ticker.changePercent)}
          detail={`${formatPrice(ticker.price)} at last close`}
          tone={tone(ticker.changePercent)}
        />

        <Card
          label="Trading Activity"
          value={formatRelVolume(ticker.relativeVolume)}
          detail={
            ticker.volume == null
              ? "Volume unavailable"
              : `${formatVolume(ticker.volume)} shares vs 10-day average`
          }
          // Heavy volume is not good or bad in itself, so this card stays
          // neutral rather than borrowing the up/down colours.
        />

        <Card
          label="Sector Performance"
          value={sector ? formatPercent(sector.changePercent) : "—"}
          detail="Technology sector (XLK)"
          tone={tone(sector?.changePercent)}
        />

        <Card
          label="Market Performance"
          value={market ? formatPercent(market.changePercent) : "—"}
          detail="S&P 500 (SPY)"
          tone={tone(market?.changePercent)}
        />

        <Card
          label="News & Events"
          value={String(news.length + events.length)}
          detail={`${news.length} article${news.length === 1 ? "" : "s"}, ${
            events.length
          } upcoming event${events.length === 1 ? "" : "s"}`}
        />
      </div>
    </section>
  );
}
