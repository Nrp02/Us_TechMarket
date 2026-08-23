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
      <SectionHeading>Top Movers Today</SectionHeading>

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
            {/* Two lines, not one. This row used to run rank, logo, name,
                price and badge across a single flex line, which worked while
                Top Movers had half the page. Beside the watchlist it has about
                308px of usable width, and the fixed parts alone — a 24px rank,
                an 80px logo plate, a ~92px badge and the padding — spend 236 of
                it before a single character of text. The symbol overlapped the
                price and the badge was clipped.

                Splitting by role rather than by what happened to fit: line one
                identifies the stock and states its price, line two carries the
                movement that earned it a place in the list. Line two is
                indented past the rank so the two lines read as one row. */}
            <Link
              href={`/todays-activity/${ticker.symbol}`}
              className="group flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-surface-soft"
            >
              <div className="flex items-center gap-2.5">
                {/* The rank was a bare digit in muted, so five rows of a *ranked*
                    list opened with the least emphatic thing on them. As a plate
                    it is the row's anchor, and the leader keeps the accent
                    because first place is the one fact this list exists to
                    state. */}
                <span
                  // text-body, not text-muted: muted on surface-strong measured
                  // 4.09:1 — the one pair in the product under AA, on 12px
                  // semibold text. body still sits a tier below the accented
                  // leader, which is the only rank this list really claims.
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold tabular-nums ${
                    index === 0
                      ? "bg-tint-primary text-primary ring-1 ring-accent-edge ring-inset"
                      : "bg-surface-strong text-body"
                  }`}
                >
                  {index + 1}
                </span>
                <CompanyLogo symbol={ticker.symbol} name={ticker.name} eager />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink transition-colors group-hover:text-primary">
                    {ticker.symbol}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {ticker.name}
                  </span>
                </span>

                {/* The change, not the price, at the row's largest step. This
                    panel ranks by the significance score, and the price is the
                    one figure in the row that has nothing to do with that
                    ranking — drawn at 16px in ink it was the brightest thing
                    on a row whose order it does not explain, while the value
                    that does explain it sat at 12px underneath. Swapped, the
                    reader can see why row 1 outranks row 4 without reading the
                    small print. */}
                {/* text-sm/600, matching the watchlist's Change % exactly:
                    both panels state the same value about the same session, and
                    the same role rendered at two sizes is the defect the shared
                    `figure` step was created to stop. It was text-base while
                    the price sat here, which made the row's biggest number the
                    one that has nothing to do with the ranking. */}
                <span
                  className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${
                    ticker.changePercent >= 0
                      ? "text-semantic-up"
                      : "text-semantic-down"
                  }`}
                >
                  {formatPercent(ticker.changePercent)}
                </span>
              </div>

              {/* The company name sits under the symbol on line one, where the
                  flex track gives it ~100px, rather than on line two competing
                  with the change and the badge — there it truncated to "A…" and
                  "Br…" on exactly the significant rows, because those carry the
                  wider badge. Line two carries the price, the relative volume
                  and the badge, right-aligned: context under the ranking value
                  rather than beside it.

                  pl-[34px] = the rank's 24px plus the 10px gap beside it, so
                  the line starts under the logo rather than under the rank. */}
              <div className="flex items-center justify-end gap-2 pl-[34px]">
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs tabular-nums">
                    {/* The price keeps its place in the row and gives up its
                        weight: it is context for the change above, not a rank. */}
                    <span className="text-muted">
                      {formatPrice(ticker.price)}
                    </span>
                    {/* Relative volume was coloured by the price direction it has
                        nothing to do with — the two values shared one span.
                        Volume stays neutral, per the rule that it is neither good
                        nor bad. */}
                    <span className="text-muted">
                      {" · "}
                      {formatRelVolume(ticker.relativeVolume)}
                    </span>
                  </span>
                  <StatusBadge significant={ticker.significant} />
                </span>
              </div>
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
