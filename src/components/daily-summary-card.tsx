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
      {/* The one authored surface in the system: the centrepiece catching the
          weather. A single wide wash bleeding in from the top-left corner — the
          same corner every panel rim is lit from — so the page's most important
          panel is lit differently from the ones around it.

          It was --color-primary, and swapping it for --color-weather is not a
          tonal preference. A wash of the accent was the accent used as
          decoration, which is the one thing The Reserved Accent Rule forbids,
          and it was also the wrong physics: what falls on this card is the
          light in the room, and the light in this room is cloud.

          The swap pays for itself twice. Measured over the raised face, 18% of
          --color-weather lifts the corner almost entirely in chroma and barely
          at all in luminance, where 14% of the accent lifted it 10/14/23 and
          cost the narrative a third of its contrast headroom. The corner reads
          bluer AND the text under it reads better. A wash should add colour,
          not brightness. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 -z-10 size-96 rounded-full opacity-[0.18]"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-weather), transparent)",
        }}
      />

      {/* The product's own question, on the one surface that answers it in
          prose. It was "AI Daily Summary", which named the mechanism rather
          than the value — the card led with the technology while the thing a
          visitor came for was the sentence underneath.

          Nothing is lost by dropping "AI" from the heading: the provenance line
          at the foot of this card already opens with "Written by AI from...",
          which is where the attribution belongs and where the product's
          boundary is stated in the same breath. A heading is for what this is;
          a provenance line is for where it came from. */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          What happened to {symbol} today
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

              The narrative carries no measure cap, and that is a decision
              rather than an oversight — the owner's, made against the numbers
              below and recorded here so nobody quietly "fixes" it.

              The costed alternative: at 1470 the card's inner width is 1356px
              and the bullet rail takes 480 of it, so an uncapped narrative runs
              836px — 99 characters a line at 18px Source Serif, and 124 at
              1920. The comfortable band is 45–75. The argument for capping it
              is the return sweep, which is why `lede` carries the extra leading
              and tracking the Dark-Compensation Rule asks for; the argument
              against is that a cap cannot stretch, so every pixel of card
              wider than the cap becomes a hole. Capped at 60ch the narrative
              stopped at 571px inside that 1356px card, and pushing the bullets
              flush right only converted the hole into a gutter. Two columns
              were built and rejected on sight: correct by the numbers, wrong
              for a card that is meant to read as one continuous answer.

              So the narrative takes the flexible track and the bullets a fixed
              30rem rail. Everything else in the product keeps its measure —
              the bullets, the provenance line below, the news summaries — and
              this is the one passage exempted, deliberately, by the person
              whose product it is.

              Two things this comment used to get wrong, kept because they are
              the reason the numbers above are trustworthy. The grid track asked
              for `58ch` while inheriting Inter, and the paragraph inside it
              sets Source Serif: at 18px Inter's "0" is 11.36px against the
              serif's 9.53, so the track resolved to 659px rather than the 553
              it was meant to describe. Measured, not inferred: 659 / 58 = 11.36
              exactly. `ch` is the advance of "0" in the element's own *face* as
              well as its own size, and a track is not the text. The rule was
              recorded in DESIGN.md as having shipped once; it had shipped three
              times.

              The 1050 breakpoint is the stack point and follows from the rail:
              480 of bullets + 40 gap + ~420 of narrative + 64 of card padding +
              48 of shell. It was `xl` (1280px), which left the whole 1024–1279
              band — iPad landscape and most laptop windows — stacked when it
              had room for two columns. */}
          <div className="mt-5 grid gap-6 text-lg min-[1050px]:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] min-[1050px]:gap-10">
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
                and the list gets a left rule while still stacked.

                The list is capped for the same reason the narrative is, and it
                was not obvious that it needed it: the bullets are one line
                each, so nothing wrapped and nothing looked wrong — but
                measured at 1470 the two longest ran 106 and 104 characters on
                that single line, half again the ceiling. A long line is a long
                line whether or not it wraps.

                34rem, not 48ch, and the unit is the point. `ch` on this element
                resolves against *its* font size, which is the container's 18px
                rather than the 14px its items are set in — the same trap the
                narrative's grid track fell into two comments above. 48ch
                measured 545px instead of the 424 it was meant to describe.
                Stated in rem it says what it means.

                justify-self-end pushes the list to the card's right edge. Left
                aligned it stopped 196px short of it, and with the bullets also
                ending ~240px above the narrative the whole card's content
                gathered into its top-left corner. Flush right, the leftover
                width becomes the gutter between two columns instead of a
                margin outside both. */}
            {summary.bullets.length > 0 && (
              <ul className="flex max-w-[34rem] flex-col gap-3 border-t border-hairline pt-5 min-[1050px]:justify-self-end min-[1050px]:border-l min-[1050px]:border-t-0 min-[1050px]:pl-10 min-[1050px]:pt-0">
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
            {/* 52ch, measured rather than chosen: at 12px Inter this text's
                mean advance is 5.84px against a 7.58px "0", so a `ch` cap
                overstates the line by about 30%. 75ch rendered 97 characters;
                52 renders 68, inside the 45-75 band. */}
            <p className="max-w-[52ch] text-xs leading-relaxed text-muted">
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
