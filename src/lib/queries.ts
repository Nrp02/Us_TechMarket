import { tradingDay } from "@/lib/market";
import { isSignificant, significanceScore } from "@/lib/significance";
import { db } from "@/lib/supabase";
import { NAME_BY_SYMBOL } from "@/lib/symbols";

// Every Home page read comes from here. Nothing in this file calls an upstream
// API — the tables are filled by lib/refresh.ts.

export type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number | null;
  /** Volume so far today over the 10-day average; null when volume is unknown. */
  relativeVolume: number | null;
  significant: boolean;
  score: number;
  /** Today's intraday closes, oldest first. Empty until a refresh has run. */
  spark: number[];
};

type PriceRow = {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number | null;
  avg_volume: number | null;
};

export async function getWatchlistSymbols(): Promise<string[]> {
  const { data } = await db
    .from("watchlist")
    .select("symbol")
    .order("added_at", { ascending: true });

  return (data ?? []).map((r) => r.symbol as string);
}

/** Today's intraday closes per symbol, keyed by symbol. */
async function getSparklines(): Promise<Map<string, number[]>> {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from("intraday_snapshots")
    .select("symbol, price, snapshot_at")
    .gte("snapshot_at", since)
    .order("snapshot_at", { ascending: true });

  const bySymbol = new Map<string, { day: string; price: number }[]>();
  for (const row of data ?? []) {
    const symbol = row.symbol as string;
    const list = bySymbol.get(symbol) ?? [];
    list.push({
      day: tradingDay(new Date(row.snapshot_at as string)),
      price: Number(row.price),
    });
    bySymbol.set(symbol, list);
  }

  // Keep only the most recent session so a sparkline never spans two days.
  const result = new Map<string, number[]>();
  for (const [symbol, points] of bySymbol) {
    const latestDay = points[points.length - 1].day;
    result.set(
      symbol,
      points.filter((p) => p.day === latestDay).map((p) => p.price),
    );
  }
  return result;
}

export async function getTickers(symbols: string[]): Promise<Ticker[]> {
  if (!symbols.length) return [];

  const [{ data: prices }, sparks] = await Promise.all([
    db
      .from("price_cache")
      .select("symbol, price, change, change_percent, volume, avg_volume")
      .in("symbol", symbols),
    getSparklines(),
  ]);

  const bySymbol = new Map(
    ((prices ?? []) as PriceRow[]).map((row) => [row.symbol, row]),
  );

  return symbols.flatMap((symbol) => {
    const row = bySymbol.get(symbol);
    if (!row) return [];

    const changePercent = Number(row.change_percent);
    const relativeVolume =
      row.volume && row.avg_volume ? Number(row.volume) / Number(row.avg_volume) : null;

    return [
      {
        symbol,
        name: NAME_BY_SYMBOL.get(symbol) ?? symbol,
        price: Number(row.price),
        change: Number(row.change),
        changePercent,
        volume: row.volume ? Number(row.volume) : null,
        relativeVolume,
        significant: isSignificant(changePercent, relativeVolume),
        score: significanceScore(changePercent, relativeVolume),
        spark: sparks.get(symbol) ?? [],
      },
    ];
  });
}

export type NewsCategory = "company" | "industry" | "market";

export type NewsItem = {
  id: number;
  category: NewsCategory;
  headline: string;
  sourceUrl: string;
  relatedSymbols: string[];
  publishedAt: string;
  /** Always the AI paraphrase — Finnhub's own snippet is never displayed. */
  summary: string | null;
};

const NEWS_COLUMNS =
  "id, category, headline, source_url, related_symbols, published_at, news_summaries(summary)";

// news_summaries.news_id is the primary key, so PostgREST embeds it as a single
// object rather than an array. Treating it as an array silently yields null.
function toNewsItem(row: Record<string, unknown>): NewsItem {
  const embedded = row.news_summaries as { summary: string } | null;
  return {
    id: row.id as number,
    category: row.category as NewsCategory,
    headline: row.headline as string,
    sourceUrl: row.source_url as string,
    relatedSymbols: (row.related_symbols as string[] | null) ?? [],
    publishedAt: row.published_at as string,
    summary: embedded?.summary ?? null,
  };
}

/** Latest first — the one fixed ordering; there is no sort control by design. */
export async function getNews(
  category?: NewsCategory,
  limit = 60,
): Promise<NewsItem[]> {
  let query = db
    .from("news")
    .select(NEWS_COLUMNS)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category", category);

  const { data } = await query;
  return (data ?? []).map(toNewsItem);
}

/**
 * Market News teaser on the Home page. Reuses the same ordering as the News
 * page rather than computing a second ranking of its own.
 */
export async function getNewsTeaser(limit = 3): Promise<NewsItem[]> {
  return getNews(undefined, limit);
}
