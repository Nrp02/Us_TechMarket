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
      {/* The one authored surface in the system. A single wide wash of the
          accent bleeding in from the top-left corner — it does not tint the
          text, it does not repeat anywhere else, and it exists so the page's
          centrepiece is lit differently from the panels around it.

          Was opacity-[0.09] — the same intensity the page's own backdrop wash
          started at and was raised past, once measured: at 9% over the near-
          black canvas it sat at a 3-5 unit RGB delta, imperceptible rather
          than felt. --backdrop-face settled on 16% for that reason. This wash
          sits on a lighter panel face rather than the near-black backdrop, so
          it does not need to travel as far to read; 14% is the value between
          the two — enough to be a felt corner of light rather than a trace,
          without competing with the narrative text it bleeds toward. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 -z-10 size-96 rounded-full opacity-[0.14]"
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

              The split engages at xl, not lg, and that is a fix rather than a
              preference. At the lg breakpoint the card has about 672px of
              inner width; the narrative track alone asks for 58ch, which at
              18px is roughly 580px, leaving under 100px for the bullets once
              the 40px gap is taken. The column did not just look tight, it
              collapsed — measured at 1024px the bullet list was 41px wide with
              its list items at zero, and the text spilled out of the card and
              pushed the page 9px wider than the viewport. At xl there is
              ~928px, which the two tracks share comfortably.

              Below xl they stack in source order and the divider flips from a
              left border to a top one.

              The size class on this grid container is load-bearing and is not
              styling anything it renders — every child sets its own size. It is
              here because the 58ch track resolves against *this* element's font
              size, and it must be kept equal to the narrative's own size below.
              It was inheriting 16px against a 20px paragraph, and the ch width
              of the face cancels out of that ratio, so the error was exact: the
              narrative rendered at 58 × 16/20 = 46 characters, not the 58 it
              asks for — a fifth narrower than designed, on the one long passage
              in the product.

              Both are `text-lg` now. The narrative was 20px, which read as
              shouty rather than as the centrepiece: the card already outranks
              its neighbours by an elevation step, an accent wash and a
              two-column split, so the type did not have to shout as well. At
              18px it still sits two steps above the 14px body around it and
              takes its own step in the ramp, where 20px collided with `title`.

              This is the Measure-On-The-Text Rule, which DESIGN.md records as
              having shipped once before. It shipped twice. The rule says a `ch`
              cap belongs on the element whose font size it describes; where
              that element is a grid track rather than the text itself, the
              track has to be told what size it is measuring. */}
          <div className="mt-5 grid gap-6 text-lg xl:grid-cols-[minmax(0,58ch)_minmax(0,1fr)] xl:gap-10">
            {/* text-pretty, not text-balance: balance is capped at a handful of
                lines by every engine that implements it and is meant for
                headings. This is a passage — pretty only fixes the orphan on
                the last line. */}
            {/* `lede` is the hook the dark-theme compensation in globals.css
                hangs on — see the note there for why only this passage gets it.
                The classes here are the light-theme setting; in dark, the rule
                in globals.css raises the leading past this `leading-[1.55]`,
                which it can do because it is unlayered and Tailwind's utilities
                are not. Change the base leading here and the dark value there
                together, or the two themes drift apart. */}
            <p className="lede text-pretty font-serif text-lg leading-[1.55] text-ink">
              {summary.narrative}
            </p>

            {/* These breakpoints must stay equal to the grid's above: the
                border flips from top to left exactly when the list stops being
                stacked underneath the narrative and moves beside it. Split them
                and the list gets a left rule while still stacked. */}
            {summary.bullets.length > 0 && (
              <ul className="flex flex-col gap-3 border-t border-hairline pt-5 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
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
            {/* 75ch, not 86: 86 put this past the comfortable reading band at
                any size, and at 12px it was the longest line in the product. */}
            <p className="max-w-[75ch] text-xs leading-relaxed text-muted">
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
