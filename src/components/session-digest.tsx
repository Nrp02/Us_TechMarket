import { formatPercent } from "@/lib/format";
import { isMarketOpen } from "@/lib/market";
import type { Ticker } from "@/lib/queries";

// The right half of the Home header.
//
// The heading asks "what happened to your stocks today" and the page then made
// the visitor scroll three sections to start answering it, while the 800px
// beside the heading held nothing. This is the one-glance answer: how the Top 20
// split, how many crossed the significance rule, and which moved furthest.
//
// Every figure is counted from tickers the page already fetched — no query, no
// upstream call, and nothing derived that is not a count or a max of stored
// values. Direction is stated in words as well as colour, per the Signed Value
// Rule, so the bar is not the only channel.

export function SessionDigest({ tickers }: { tickers: Ticker[] }) {
  const open = isMarketOpen();
  const advancing = tickers.filter((t) => t.changePercent > 0).length;
  const declining = tickers.filter((t) => t.changePercent < 0).length;
  const moved = advancing + declining;
  const significant = tickers.filter((t) => t.significant).length;

  const widest = tickers.reduce<Ticker | null>(
    (best, t) =>
      !best || Math.abs(t.changePercent) > Math.abs(best.changePercent)
        ? t
        : best,
    null,
  );

  return (
    // Fixed width only from lg, which is where the header actually splits into
    // two columns. Pinned at sm it stayed 352px while stacked under the
    // heading, leaving an iPad with a short panel and a gap beside it.
    <aside className="panel w-full shrink-0 p-5 lg:w-[22rem]">
      {/* The session date used to sit opposite this line. It is the page's
          <h1> now — stating it twice in one viewport is the same defect as the
          product's name appearing twice, which is what moved it. What is left
          is one statement, so the row no longer has two ends to balance. */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold text-ink">
          <span className="relative flex size-2">
            {/* The dot is the market-state indicator the Market Overview
                heading also carries; this one leads, so it gets a halo to read
                at a glance rather than on inspection. */}
            <span
              className={`absolute inline-flex size-full rounded-full opacity-40 ${
                open ? "bg-semantic-up" : "bg-muted"
              }`}
              style={{ transform: "scale(2)" }}
            />
            <span
              className={`relative inline-flex size-2 rounded-full ${
                open ? "bg-semantic-up" : "bg-muted"
              }`}
            />
          </span>
          {open ? "Market open" : "Market closed"}
        </span>
      </div>

      {moved > 0 ? (
        <>
          {/* Breadth across the tracked universe, as one bar rather than two
              numbers. The split is a count of directional price changes, which
              is the one thing the gain/loss pair is allowed to colour. */}
          <div
            className="mt-5 flex h-2 gap-1 overflow-hidden rounded-full"
            role="img"
            aria-label={`${advancing} of ${tickers.length} tracked stocks advanced, ${declining} declined`}
          >
            <span
              className="bar-advancing rounded-full bg-semantic-up"
              style={{ width: `${(advancing / moved) * 100}%` }}
            />
            <span
              className="bar-declining rounded-full bg-semantic-down"
              style={{ width: `${(declining / moved) * 100}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-baseline justify-between font-mono text-xs tabular-nums">
            <span className="text-semantic-up">{advancing} advancing</span>
            <span className="text-semantic-down">{declining} declining</span>
          </div>
        </>
      ) : (
        <p className="mt-5 text-sm text-muted">
          No prices stored for this session yet.
        </p>
      )}

      <dl className="mt-5 flex flex-col gap-2.5 border-t border-hairline pt-4 text-xs">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Crossed the significance rule</dt>
          <dd className="font-mono tabular-nums text-ink">
            {significant} of {tickers.length}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted">Widest move</dt>
          <dd className="font-mono tabular-nums text-ink">
            {widest ? (
              <>
                {widest.symbol}{" "}
                <span
                  className={
                    widest.changePercent >= 0
                      ? "text-semantic-up"
                      : "text-semantic-down"
                  }
                >
                  {formatPercent(widest.changePercent)}
                </span>
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
