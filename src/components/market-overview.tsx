import { SectionHeading } from "@/components/section-heading";
import { Sparkline } from "@/components/sparkline";
import { formatChange, formatPercent } from "@/lib/format";
import type { Ticker } from "@/lib/queries";
import { INDEX_CARDS } from "@/lib/symbols";

// One instrument band, not five cards.
//
// Five separately bordered cards, each holding a tiny label and a 18px number,
// was the page's opening statement and it said nothing: five equal plates read
// as a template rather than as a reading of the market. As one divided band the
// levels can be set at figure scale — the size a number should be in a product
// whose content is numbers — and the plate count on the Home page drops by four.
//
// It still wraps 1 -> 2 -> 3 -> 5 exactly as the cards did, so nothing regresses
// on an iPad; a single non-wrapping row would have forced horizontal scrolling
// at every width below 1280. The one-panel reading comes from the cells sharing
// a container and being separated by rules instead of each carrying its own
// border: cells draw only their top and left edge, the grid is pulled up and
// left by one pixel, and the container clips the resulting outer overhang. That
// keeps every internal rule single-width at every breakpoint the grid reflows
// through, which a `divide-x` cannot do once the cells wrap.

export function MarketOverview({ tickers }: { tickers: Ticker[] }) {
  const bySymbol = new Map(tickers.map((t) => [t.symbol, t]));

  return (
    <section>
      {/* The market-open indicator used to live here. It now leads the session
          digest in the page header, about 200px above this line, and stating it
          twice on one screen made neither instance feel authoritative. */}
      {/* Not "free tier rejects index symbols", which was the reason the app
          uses proxies, not a fact about the market. The visitor needs to know
          the levels are ETFs, because VIXY tracks VIX futures rather than VIX
          itself and the interface must not imply otherwise. */}
      <SectionHeading meta="Levels shown via ETF proxies">
        Market Overview
      </SectionHeading>

      <div className="panel overflow-hidden">
        <div className="-ml-px -mt-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {INDEX_CARDS.map((card) => {
            const ticker = bySymbol.get(card.symbol);

            return (
              <article
                key={card.symbol}
                // No hover state: these cells are not links and nothing here
                // responds to a click. A hover response on inert content is a
                // promise the cell cannot keep.
                className="border-l border-t border-hairline px-5 py-5"
              >
                <h3 className="text-micro font-semibold text-ink">
                  {card.label}
                </h3>
                <p className="mt-0.5 text-micro text-muted">{card.note}</p>

                {ticker ? (
                  <>
                    <p className="mt-4 font-mono text-figure font-medium tabular-nums text-ink">
                      {ticker.price.toFixed(2)}
                    </p>
                    {/* The change was loose text at the same size as the note
                        above it. As a tinted pill it becomes the cell's second
                        object, and the tint is the only place a card carries a
                        field of colour rather than a line of it. */}
                    <p
                      className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium tabular-nums ${
                        ticker.changePercent >= 0
                          ? "bg-tint-up text-semantic-up"
                          : "bg-tint-down text-semantic-down"
                      }`}
                    >
                      {formatChange(ticker.change)} (
                      {formatPercent(ticker.changePercent)})
                    </p>
                    <div className="mt-4">
                      <Sparkline
                        values={ticker.spark}
                        up={ticker.changePercent >= 0}
                        width={140}
                        height={36}
                      />
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted">
                    No level stored for this session yet.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
