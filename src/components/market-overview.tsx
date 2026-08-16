import { SectionHeading } from "@/components/section-heading";
import { Sparkline } from "@/components/sparkline";
import { formatChange, formatPercent } from "@/lib/format";
import type { Ticker } from "@/lib/queries";
import { INDEX_CARDS } from "@/lib/symbols";

// Five cards, one per index.
//
// This reverses an earlier pass, which merged these into a single divided band
// on the argument that five equal plates read as a template rather than as a
// reading of the market. That argument is not wrong, and the Midnight Glass
// brief points the same way ("do not unnecessarily split one existing panel
// into multiple cards") — but the owner asked for the split directly, after
// seeing both. Recorded here so the reversal reads as a decision rather than as
// drift, and so nobody merges them back citing a note that has been overruled.
//
// The glass is what changes the calculus. Under the flat system a card was a
// bordered rectangle and five of them were five rectangles; the band genuinely
// carried more meaning. As translucent panels on a lit sky each card is an
// object with its own edge, shadow and slice of the atmosphere behind it, and
// the row reads as five instruments rather than five slots in a template.
//
// Wrapping is unchanged at 1 -> 2 -> 3 -> 5, so nothing regresses on an iPad; a
// single non-wrapping row would force horizontal scrolling below 1280. What
// went with the band is the -1px grid offset and the clipping wrapper it
// needed: each card now draws its own border on all four sides, which is the
// `panel` utility's job and no longer this component's.

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

      {/* gap-4 against the 40px that separates whole sections: five cards that
          belong to one reading sit close, and the distance to the next section
          is more than twice that. The contrast is the rhythm — one repeated
          interval everywhere would flatten the two relationships into one. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {INDEX_CARDS.map((card) => {
          const ticker = bySymbol.get(card.symbol);

          return (
            <article
              key={card.symbol}
              // No hover state: these cards are not links and nothing here
              // responds to a click. A hover response on inert content is a
              // promise the card cannot keep.
              className="panel px-5 py-5"
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
    </section>
  );
}
