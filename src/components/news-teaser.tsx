import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import type { NewsItem } from "@/lib/queries";

export function NewsTeaser({ items }: { items: NewsItem[] }) {
  return (
    <section>
      <SectionHeading
        meta={
          <Link
            href="/news"
            // The hit area was the text box and nothing else — 45x15, the only
            // target in the product under the 24px WCAG 2.2 floor, and the one
            // link on Home that leads to a whole page. The padding is negative-
            // margined back out so the label sits exactly where it did; only
            // the region that responds to a finger changed, 45x15 -> 61x36.
            //
            // min-h-9 (36px) rather than the 44px an iOS control would take:
            // the heading row it sits in has a measured min-height of 38px,
            // which is what keeps the Watchlist and Top Movers panels starting
            // on the same line. 44 here would push every section heading in the
            // product down 6px to fix one link.
            className="-mx-2 inline-flex min-h-9 items-center rounded-lg px-2 font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        Market News
      </SectionHeading>

      {/* Three cards across, not three rows down. The teaser used to be a
          stacked list inside a half-width column; full width it would have run
          three short headlines across a 1100px measure with most of each row
          empty, which is the dead-right-hand-column problem the Filled Right
          Rule already names. Across, each headline gets its own column and a
          measure it can actually use.

          Equal columns rather than a scroller: there are exactly three, the
          count is fixed by the content contract, and a three-item carousel is
          a control nobody needs. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            // flex-col so the summary can push nothing around: cards in a row
            // are equal height by default and the headline lengths differ.
            className="panel flex flex-col px-5 py-4 transition-colors hover:bg-surface-soft"
          >
            {/* h3, not h2: this list sits under the "Market News" section
                heading, which is the h2. Same structural-only fix as the News
                page — the type classes stay on the anchor. */}
            <h3>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                // text-base, matching the News page: a headline is one role, and
                // it should not change size and face between two surfaces
                // showing the same three articles.
                className="font-serif text-base font-semibold leading-snug text-ink hover:text-primary"
              >
                {item.headline}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </h3>
            {item.summary && (
              <p className="mt-1 text-sm leading-relaxed text-body">
                {item.summary}
              </p>
            )}
          </article>
        ))}

        {/* The empty state spans the whole grid rather than sitting in the
            first of three columns, where it would read as one missing card
            beside two that never existed. */}
        {!items.length && (
          <p className="panel px-5 py-8 text-sm text-muted md:col-span-3">
            No articles for these stocks yet. News is collected eight times a
            day and summarised on arrival.
          </p>
        )}
      </div>
    </section>
  );
}
