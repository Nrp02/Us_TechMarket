import Link from "next/link";

import type { NewsItem } from "@/lib/queries";

export function NewsTeaser({ items }: { items: NewsItem[] }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Market News</h2>
        <Link href="/news" className="text-sm font-semibold text-primary">
          View all
        </Link>
      </div>

      <div className="rounded-3xl border border-hairline bg-canvas">
        {items.map((item) => (
          <article
            key={item.id}
            className="border-b border-hairline px-5 py-4 last:border-0"
          >
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-ink hover:text-primary"
            >
              {item.headline}
            </a>
            {item.summary && (
              <p className="mt-1 text-sm text-body">{item.summary}</p>
            )}
          </article>
        ))}

        {!items.length && (
          <p className="px-5 py-8 text-sm text-muted">
            No articles for these stocks yet. News is collected four times a day
            and summarised on arrival.
          </p>
        )}
      </div>
    </section>
  );
}
