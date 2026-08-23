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

// Drawn, not a Unicode arrow: the product has no icon package and every glyph
// in it is authored SVG on one convention — 24x24 viewBox, currentColor stroke,
// round caps and joins. A "↑" would be the text face's arrow, which is a
// different weight and a different vertical centre from everything else here.
//
// 1.75 rather than 1.5, the top of the range the system allows, because this is
// the smallest icon in the product at 12px and the bottom of the range goes
// thin at that size.
function TrendArrow({ up }: { up: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 shrink-0"
      aria-hidden
    >
      {up ? (
        <path d="M12 19V5M12 5l-5.5 5.5M12 5l5.5 5.5" />
      ) : (
        <path d="M12 5v14M12 19l-5.5-5.5M12 19l5.5-5.5" />
      )}
    </svg>
  );
}

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
      {/* Spanning the last card closes the hole, but it does not spend the
          width it wins — measured at 390 the Volatility card is 358px against
          the others' 173px and lays its contents out identically, so 185px of
          it is void and the plate reads as half-empty. The session trace is
          the one mark here that grows honestly: it carries a viewBox, so a
          wider box REDRAWS the session rather than stretching it — the same
          treatment the watchlist's chart column already takes. The cap travels
          as a variable so the span rule and the size rule stay one decision,
          and it resets at xl where the row is exactly full and nothing spans.

          It is raised BELOW lg only, and that boundary is the whole point.
          Under lg the spanned card is alone on its last row, so a taller trace
          costs its own card and nothing else — 358x193 against a sibling's
          173x147 at 390, which reads as the wide card doing more rather than
          as a broken row. From lg to xl the grid is three columns and five
          cards, so the span shares row two with Technology: a 300px trace drew
          90px tall, took the card to 225 against the siblings' 165, dragged
          its row-mate up with it and became the largest object on the page —
          a supporting mark outshouting every figure in the section. Measured
          at 1024 and reverted. The void this leaves at lg is the one the span
          was already accepted for; it is not what the audit found. */}
      <div className="grid grid-cols-2 gap-3 min-[600px]:gap-4 lg:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 [&>*:last-child]:[--spark-cap:220px] lg:[&>*:last-child]:[--spark-cap:100px] xl:[&>*:last-child]:col-span-1">
        {INDEX_CARDS.map((card) => {
          const ticker = bySymbol.get(card.symbol);

          return (
            <article
              key={card.symbol}
              // No hover state: these cards are not links and nothing here
              // responds to a click. A hover response on inert content is a
              // promise the card cannot keep.
              className="panel px-4 py-4 min-[600px]:px-5 min-[600px]:py-5"
            >
              <h3 className="text-micro font-semibold text-ink">
                {card.label}
              </h3>

              {ticker ? (
                <>
                  <p className="mt-2 font-mono text-figure font-medium tabular-nums text-ink">
                    {ticker.price.toFixed(2)}
                  </p>

                  {/* The change and the sparkline are one row, not two stacked
                      ones. They are the same fact at two resolutions — where
                      the session ended up, and the shape of how it got there —
                      so reading them together is the point, and putting the
                      trace on its own full-width line below made the card a
                      third taller for no extra meaning.

                      items-end so the figure and the sparkline's baseline
                      agree rather than their box tops, which differ by the
                      chart's own headroom. */}
                  <div className="mt-3 flex items-end gap-3">
                    <span
                      // Loose coloured text with an arrow rather than the
                      // tinted pill this used to carry. The pill made the
                      // change the card's second object; at five cards across
                      // that is five filled plates competing with five large
                      // figures. The arrow is what replaces the plate as the
                      // thing that catches the eye, and it is a better one —
                      // it is a second, non-colour channel for direction,
                      // which the Don't list explicitly asks for.
                      className={`inline-flex shrink-0 items-center gap-1 font-mono text-xs font-semibold tabular-nums ${
                        ticker.changePercent >= 0
                          ? "text-semantic-up"
                          : "text-semantic-down"
                      }`}
                    >
                      <TrendArrow up={ticker.changePercent >= 0} />
                      {formatPercent(ticker.changePercent)}
                    </span>

                    {/* The sparkline is a flexible track capped at 100px, not a
                        fixed 100px box. At a fixed size it overflowed its own
                        card between 1280 and 1400, where five columns leave
                        only 141px of inner width against the 171px the change,
                        the gap and the chart needed together — measured, and
                        invisible on a screenshot because the panel clips.

                        It scales rather than truncating because the SVG carries
                        a viewBox, so a narrower box redraws the whole session
                        instead of cropping the end off it. `ml-auto` keeps it
                        on the right edge once it stops filling the space. */}
                    <span className="ml-auto flex min-w-0 max-w-[var(--spark-cap,100px)] flex-1 justify-end [&>svg]:h-auto [&>svg]:w-full">
                      <Sparkline
                        values={ticker.spark}
                        up={ticker.changePercent >= 0}
                        width={100}
                        height={30}
                      />
                    </span>
                  </div>

                  {/* The absolute change sits here rather than beside the
                      percentage. Both are required by the content contract,
                      but they are not equal reads: the percentage is what the
                      card is compared on and the points figure is the detail
                      behind it. It shares the line with the proxy note, which
                      is the same tier of information — provenance. */}
                  <p className="mt-2 text-micro text-muted">
                    <span className="font-mono tabular-nums">
                      {formatChange(ticker.change)}
                    </span>
                    {" · "}
                    {card.note}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-muted">
                    No level stored for this session yet.
                  </p>
                  {/* The proxy note survives the empty state: VIXY tracking
                      futures rather than spot is true whether or not a level
                      was recorded, and it is the one thing here the interface
                      must not imply otherwise about. */}
                  <p className="mt-2 text-micro text-muted">{card.note}</p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
