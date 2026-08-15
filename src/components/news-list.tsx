import { NewsThumbnail } from "@/components/news-thumbnail";
import type { NewsItem } from "@/lib/queries";

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function NewsList({ items }: { items: NewsItem[] }) {
  if (!items.length) {
    return (
      <p className="rounded-3xl border border-hairline bg-canvas px-5 py-10 text-sm text-muted">
        No articles in this category yet.
      </p>
    );
  }

  return (
    <ul className="rounded-3xl border border-hairline bg-canvas">
      {items.map((item) => {
        const symbol = item.relatedSymbols[0] ?? null;

        return (
        <li
          key={item.id}
          className="flex gap-4 border-b border-hairline p-5 last:border-0"
        >
          <NewsThumbnail symbol={symbol} />

          <div className="min-w-0 flex-1">
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-ink hover:text-primary"
            >
              {item.headline}
            </a>

            {/* Always the AI paraphrase, never the source's own snippet.
                max-w caps the measure — unconstrained, this ran past 110
                characters per line at the widest supported viewport. text-sm on
                the same element is load-bearing: `ch` resolves against the
                element's own font size. */}
            {item.summary && (
              <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-body">
                {item.summary}
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {/* Mono + tabular, per the Mono Numerals Rule. This was the one
                  timestamp in the product set in Inter; the timeline renders the
                  same class of value in mono. */}
              <span className="font-mono text-xs tabular-nums text-muted">
                {timeAgo(item.publishedAt)}
              </span>

              {/* Tickers come from Finnhub's own field, never AI-inferred. */}
              {item.relatedSymbols.slice(0, 4).map((ticker) => (
                <span
                  key={ticker}
                  className="rounded-full bg-surface-strong px-2.5 py-0.5 text-[11px] font-semibold text-body"
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
