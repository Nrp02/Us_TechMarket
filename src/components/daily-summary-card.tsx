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
    // panel-raised, not panel: this is the only element in the product that
    // sits a full elevation step above its neighbours, which is the whole
    // reason the scale has more than one step.
    //
    // `isolate` is what lets the wash below sit at -z-10 — behind this section's
    // own text but still in front of the page, rather than disappearing under
    // the backdrop.
    <section className="panel-raised relative isolate overflow-hidden p-6 sm:p-8">
      {/* The one authored surface in the system. A single wide, very low-alpha
          wash of the accent bleeding in from the top-left corner — it does not
          tint the text, it does not repeat anywhere else, and it exists so the
          page's centrepiece is lit differently from the panels around it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 -z-10 size-96 rounded-full opacity-[0.09]"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-primary), transparent)",
        }}
      />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          AI Daily Summary
        </h2>
        {summary && (
          <span className="font-mono text-xs tabular-nums text-muted">
            Generated {formatEtTime(summary.generatedAt)}
          </span>
        )}
      </div>

      {summary ? (
        <>
          {/* Narrative and bullets sit side by side from lg up. The narrative
              holds a ~58ch reading measure, which on the widest panel in the
              product left roughly 40% of the card empty when the bullets ran
              underneath it — the same dead right-hand column the Home header
              had. Beside it, the two halves fill the card and the bullets stop
              reading as an appendix to the paragraph.

              Below lg they stack in source order and the divider flips from a
              left border to a top one. */}
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,58ch)_minmax(0,1fr)] lg:gap-10">
            {/* text-pretty, not text-balance: balance is capped at a handful of
                lines by every engine that implements it and is meant for
                headings. This is a passage — pretty only fixes the orphan on
                the last line. */}
            <p className="text-pretty text-xl leading-[1.55] text-ink">
              {summary.narrative}
            </p>

            {summary.bullets.length > 0 && (
              <ul className="flex flex-col gap-3 border-t border-hairline pt-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                {summary.bullets.map((bullet, i) => (
                  // Indexed because the model can return two identical bullets
                  // and this list is static — never reordered, never filtered.
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
          </div>

          {/* The product's boundary, stated in the component rather than in a
              footer. It is the positioning, so it gets a rule above it instead
              of trailing the bullets as an afterthought.

              The rule sits on the wrapper and the measure on the paragraph. Put
              both on one element and the border stops where the text does,
              which reads as a stub rather than as the card's closing line. */}
          <div className="mt-6 border-t border-hairline pt-4">
            <p className="max-w-[86ch] text-xs leading-relaxed text-muted">
              Written by AI from {symbol}&apos;s recorded prices, volume, news
              and calendar for this session. It describes what happened — not
              why, and not what happens next. Not investment advice.
            </p>
          </div>
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
