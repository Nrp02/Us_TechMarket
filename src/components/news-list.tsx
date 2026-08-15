import { NewsThumbnail } from "@/components/news-thumbnail";
import type { NewsItem } from "@/lib/queries";

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NewsList({
  items,
  emptyMessage = "No articles in this category yet.",
}: {
  items: NewsItem[];
  emptyMessage?: string;
}) {
  if (!items.length) {
    return <p className="panel px-5 py-10 text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="panel overflow-hidden">
      {items.map((item) => {
        const symbol = item.relatedSymbols[0] ?? null;

        return (
        <li
          key={item.id}
          className="flex gap-4 border-b border-hairline p-5 transition-colors last:border-0 hover:bg-surface-soft"
        >
          <NewsThumbnail symbol={symbol} />

          {/* The row's meta moves into its own right-hand column from sm up.
              With the summary capped at a 68ch reading measure, a 1500px row
              put the time and tickers under the text and left the whole right
              third of every row empty — the row was one column in a container
              built for two. Below sm the column collapses back under the text
              in source order, so there is only one copy of the markup. */}
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              {/* The headline is the row's one reason to exist and it was set at
                  the same 14px as the summary below it, so a list of twenty read
                  as one continuous block of text.

                  It is an h2 because the page's whole content is headlines and
                  none of them were headings: the served markup carried one h1
                  and zero h2-h6, so a screen reader's heading list on a page of
                  60 articles held exactly one entry ("News") and the only way
                  through was to arrow the whole list linearly. The h2 is purely
                  structural — every type class stays on the anchor. */}
              <h2>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-base font-semibold leading-snug text-ink transition-colors hover:text-primary"
                >
                  {item.headline}
                  {/* Every headline leaves the app for the publisher, and
                      nothing said so. Sixty links that silently open a new tab
                      is a lot of unexplained context switching. */}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </h2>

              {/* Always the AI paraphrase, never the source's own snippet.
                  max-w caps the measure — unconstrained, this ran past 110
                  characters per line at the widest supported viewport. text-sm
                  on the same element is load-bearing: `ch` resolves against the
                  element's own font size. */}
              {item.summary && (
                <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-body">
                  {item.summary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:w-44 sm:shrink-0 sm:justify-end">
              {/* Mono + tabular, per the Mono Numerals Rule. This was the one
                  timestamp in the product set in Inter; the timeline renders the
                  same class of value in mono.

                  <time> carries the absolute instant that "3h ago" is relative
                  to. The relative string is computed on the server at render,
                  so a tab left open overnight shows a frozen figure — the
                  dateTime attribute is the only thing on the row that stays
                  true, and it is what assistive tech and the browser read. */}
              <time
                dateTime={item.publishedAt}
                className="font-mono text-xs tabular-nums text-muted"
              >
                {timeAgo(item.publishedAt)}
              </time>

              {/* Tickers come from Finnhub's own field, never AI-inferred. */}
              {item.relatedSymbols.slice(0, 4).map((ticker) => (
                <span
                  key={ticker}
                  className="rounded-full bg-surface-strong px-2.5 py-0.5 text-micro font-semibold text-body"
                >
                  {ticker}
                </span>
              ))}
            </div>
          </div>
        </li>
        );
      })}
    </ul>
  );
}
