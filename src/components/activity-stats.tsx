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
    <article className="panel px-4 py-4 min-[600px]:px-5 min-[600px]:py-5">
      <h3 className="text-micro font-semibold text-muted">{label}</h3>
      {/* text-figure, not text-3xl. Both resolved to a large mono reading in a
          stat card, but Market Overview's ran at a clamp topping out at 38px
          while these sat at 30px — the same role at two sizes on two pages of
          one product. The token is the shared step now and both import it. */}
      <p
        className={`mt-3 font-mono text-figure font-medium tabular-nums ${toneClass}`}
      >
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-body">{detail}</p>
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

      {/* Five cards rather than one divided band, and the same gap Market
          Overview uses — see the note at the top of that file for why the
          earlier merge was reversed. These two rows are the same object on two
          pages and must stay identical; changing one alone is the drift the
          shared step above was introduced to stop. */}
      {/* Two up on a phone rather than one, which is the difference between
          this section being a glance and being two full screens of scrolling
          before the visitor reaches their own stocks. Five stacked cards ran
          ~810px at 390; paired they run ~420.

          It fits by measurement, not by hope: at 390 the content column is
          358px, so a card is (358 - 12 gap) / 2 = 173px wide and 141px inside
          its 16px padding. The largest reading here is six mono characters at
          the shared `text-figure` step, which is ~108px. The padding steps down
          with the shell's own phone tier to buy those pixels — the figure step
          itself does not change, because it is one shared step across this
          section and Today's Activity and forking it by width is how the same
          role ended up at two sizes before it existed. */}
      {/* Five is prime, so every column count that is not five orphans the
          last card: 2+2+1 below lg, and 3+2 between lg and xl, which measured
          a 373x165 hole at 1024-1279 — iPad landscape and most laptop
          windows. The last child spans the remainder instead, and the span is
          reset at xl where the row is exactly full. It falls on the odd one
          out of each set anyway: Volatility is the only non-index card here,
          and News & Events the only non-price card on Today's Activity. */}
      <div className="grid grid-cols-2 gap-3 min-[600px]:gap-4 lg:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
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
    </section>
  );
}
