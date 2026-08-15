import { formatEtTime } from "@/lib/format";
import type { DailySummary } from "@/lib/queries";

// The core of the page. The narrative was written once by the end-of-day job and
// stored — rendering this component makes no AI call, so two visitors reading the
// same stock cost nothing between them.

export function DailySummaryCard({
  summary,
  symbol,
}: {
  summary: DailySummary | null;
  symbol: string;
}) {
  return (
    // The one container on the page that is not a 20px card. This is the
    // product's centrepiece and it was rendered at exactly the weight of a news
    // row; the extra padding and the reading size below are what make it read
    // as the thing the page is for.
    <section className="rounded-3xl border border-hairline bg-canvas p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">AI Daily Summary</h2>
        {summary && (
          <span className="text-xs text-muted">
            Generated {formatEtTime(summary.generatedAt)}
          </span>
        )}
      </div>

      {summary ? (
        <>
          {/* Set as a lede, not as body copy. This paragraph is the single
              thing the whole pipeline exists to produce — every scheduled job,
              every quota decision, the entire three-part prompt — and it was
              styled identically to a news snippet. At this size the measure
              tightens to ~58ch, which is also why the cap moved off 68ch. */}
          <p className="mt-5 max-w-[58ch] text-xl leading-[1.55] text-ink">
            {summary.narrative}
          </p>

          {summary.bullets.length > 0 && (
            <ul className="mt-5 flex flex-col gap-2.5 border-t border-hairline pt-5">
              {summary.bullets.map((bullet, i) => (
                // Indexed because the model can return two identical bullets and
                // this list is static — never reordered, never filtered.
                <li key={i} className="flex gap-3 text-sm text-body">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 text-xs leading-relaxed text-muted">
            Written by AI from {symbol}&apos;s recorded prices, volume, news and
            calendar for this session. It describes what happened — not why, and
            not what happens next. Not investment advice.
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-body">
          No summary for this session yet. Summaries are written once per stock
          after the US market closes.
        </p>
      )}
    </section>
  );
}
