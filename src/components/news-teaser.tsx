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
            className="font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        Market News
      </SectionHeading>

      <div className="panel overflow-hidden">
        {items.map((item) => (
          <article
            key={item.id}
            className="border-b border-hairline px-5 py-4 transition-colors last:border-0 hover:bg-surface-soft"
          >
            {/* h3, not h2: this list sits under the "Market News" section
                heading, which is the h2. Same structural-only fix as the News
                page — the type classes stay on the anchor. */}
            <h3>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-ink hover:text-primary"
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
