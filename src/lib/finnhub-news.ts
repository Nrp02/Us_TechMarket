// Finnhub news endpoints. Read-only fetch + normalisation; storage and
// summarisation live in lib/news-ingest.ts.

import { mentionsSymbol } from "@/lib/symbols";

const BASE = "https://finnhub.io/api/v1";

export type RawArticle = {
  finnhubId: number;
  headline: string;
  /** Finnhub's own snippet. Used only as AI input — never displayed. */
  snippet: string;
  sourceUrl: string;
  imageUrl: string | null;
  relatedSymbols: string[];
  publishedAt: Date;
};

type FinnhubArticle = {
  id: number;
  headline?: string;
  summary?: string;
  url?: string;
  image?: string;
  related?: string;
  datetime?: number;
};

// Company news is high volume — a single symbol returned 141 articles across two
// days — so each source is capped. Without this a cycle would hand hundreds of
// articles to one Gemini call and bury the page in near-duplicates.
//
// The per-symbol cap is set above the number actually kept because the
// relevance filter below discards roughly half of what Finnhub returns.
const PER_SYMBOL = 4;
const PER_FEED = 15;

async function get(path: string): Promise<FinnhubArticle[]> {
  const res = await fetch(`${BASE}${path}&token=${process.env.FINNHUB_API_KEY}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Finnhub ${path.split("?")[0]} -> ${res.status}`);
  const json = (await res.json()) as unknown;
  return Array.isArray(json) ? (json as FinnhubArticle[]) : [];
}

function normalise(
  raw: FinnhubArticle,
  fallbackSymbol?: string,
): RawArticle | null {
  if (!raw.id || !raw.headline || !raw.url || !raw.datetime) return null;

  // Finnhub packs tickers into a comma-separated string, and tags them loosely:
  // an article can carry a symbol it never mentions. Tickers still come only
  // from this field — never inferred by a model — but each one has to be
  // supported by the article text before it is shown as a Related Stock chip.
  const text = `${raw.headline ?? ""} ${raw.summary ?? ""}`;
  const related = (raw.related ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s && mentionsSymbol(s, text));

  // The queried symbol already passed the relevance check upstream.
  if (fallbackSymbol && !related.includes(fallbackSymbol)) {
    related.unshift(fallbackSymbol);
  }

  return {
    finnhubId: raw.id,
    headline: raw.headline,
    snippet: raw.summary ?? "",
    sourceUrl: raw.url,
    // Still captured so the column stays populated, but nothing renders it:
    // thumbnails are company logos. See components/news-thumbnail.tsx.
    imageUrl: raw.image?.trim() ? raw.image : null,
    relatedSymbols: [...new Set(related)],
    publishedAt: new Date(raw.datetime * 1000),
  };
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

async function companyNews(
  symbols: string[],
  from: string,
  to: string,
  errors: string[],
): Promise<RawArticle[]> {
  const feeds = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const raw = await get(
          `/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`,
        );
        return raw
          .filter((a) => mentionsSymbol(symbol, `${a.headline ?? ""} ${a.summary ?? ""}`))
          .slice(0, PER_SYMBOL)
          .flatMap((a) => normalise(a, symbol) ?? []);
      } catch (error) {
        // Swallowing this silently would make a rate-limited cycle look
        // identical to a quiet news day, which is the failure mode Risk #3
        // in CLAUDE.md is about.
        errors.push(
          `${symbol}: ${error instanceof Error ? error.message : "fetch failed"}`,
        );
        return [];
      }
    }),
  );
  return feeds.flat();
}

/**
 * Two sources, and why the split between them is not decided here.
 *
 * Finnhub's free tier has no technology-specific news feed: `/news?category=
 * technology` and `/news?category=general` return byte-identical article sets
 * (verified — 100 of 100 ids overlap), carrying no tickers and no tech signal.
 * Labelling that feed "Technology Industry News" would be plainly wrong, since
 * it is general business and world news. So the page's Company/Industry split
 * is drawn from Finnhub's own per-symbol tagging instead.
 *
 * That split used to be decided here, by fetching the watchlist and the rest of
 * the Top 20 as two labelled passes. It is now derived per request from the
 * stored tickers (see lib/news-category.ts), because the watchlist is
 * per-visitor and a label written at fetch time describes nobody. Ingestion
 * therefore fetches all 20 symbols as one list — the same number of Finnhub
 * calls it always made, since watched + industry was already all 20.
 *
 * No AI infers any of this, per the rule that tickers come from Finnhub's field.
 */
export async function fetchAllNews(
  symbols: string[],
): Promise<{ articles: RawArticle[]; errors: string[] }> {
  const today = new Date();
  const from = isoDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000));
  const to = isoDate(today);
  const errors: string[] = [];

  const marketFeed = async (): Promise<RawArticle[]> => {
    try {
      const raw = await get(`/news?category=general`);
      return raw.slice(0, PER_FEED).flatMap((a) => normalise(a) ?? []);
    } catch (error) {
      errors.push(
        `market feed: ${error instanceof Error ? error.message : "fetch failed"}`,
      );
      return [];
    }
  };

  const [perSymbol, market] = await Promise.all([
    companyNews(symbols, from, to, errors),
    marketFeed(),
  ]);

  // An article can carry several tickers and appear in more than one feed.
  // Order matters: a per-symbol hit keeps the ticker that the general feed's
  // copy of the same article would not carry.
  const byId = new Map<number, RawArticle>();
  for (const article of [...perSymbol, ...market]) {
    if (!byId.has(article.finnhubId)) byId.set(article.finnhubId, article);
  }
  return { articles: [...byId.values()], errors };
}
