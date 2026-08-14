import { tradingDay } from "@/lib/market";
import { categoriseNews, type NewsCategory } from "@/lib/news-category";
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

/**
 * The UTC bounds that contain one New York trading day. New York is UTC-4 or
 * UTC-5, so an ET day always falls between its own midnight UTC and noon UTC the
 * next day; callers narrow with this and then compare trading days exactly.
 */
function dayWindow(day: string): { from: string; to: string } {
  return {
    from: `${day}T00:00:00Z`,
    to: new Date(Date.parse(`${day}T12:00:00Z`) + 86_400_000).toISOString(),
  };
}

/**
 * The most recent session that actually produced snapshots, as an ET date.
 *
 * Everything on a per-stock page keys off this. It is read from the data rather
 * than assumed from the clock: a fixed look-back window expires at a wall-clock
 * moment, which silently emptied the page from Sunday afternoon until Monday's
 * open — and after every market holiday — because the chart, the timeline and
 * the stored summary are all looked up by the day the snapshots imply.
 */
async function getLatestSessionDay(symbol?: string): Promise<string | null> {
  let query = db
    .from("intraday_snapshots")
    .select("snapshot_at")
    .order("snapshot_at", { ascending: false })
    .limit(1);

  if (symbol) query = query.eq("symbol", symbol);

  const { data } = await query;
  const newest = data?.[0]?.snapshot_at as string | undefined;
  return newest ? tradingDay(new Date(newest)) : null;
}

/** Latest session's intraday closes per symbol, keyed by symbol. */
async function getSparklines(): Promise<Map<string, number[]>> {
  const day = await getLatestSessionDay();
  if (!day) return new Map();

  const { from, to } = dayWindow(day);
  const { data } = await db
    .from("intraday_snapshots")
    .select("symbol, price, snapshot_at")
    .gte("snapshot_at", from)
    .lt("snapshot_at", to)
    .order("snapshot_at", { ascending: true });

  // The window can only straddle the boundary, never span two sessions, so the
  // trading-day comparison is what actually pins each point to `day`.
  const result = new Map<string, number[]>();
  for (const row of data ?? []) {
    if (tradingDay(new Date(row.snapshot_at as string)) !== day) continue;
    const symbol = row.symbol as string;
    result.set(symbol, [...(result.get(symbol) ?? []), Number(row.price)]);
  }
  return result;
}

export async function getTickers(
  symbols: string[],
  // Sparklines cost a read of every tracked symbol's whole session, so a caller
  // that does not render one says so rather than paying for it.
  { sparklines = true }: { sparklines?: boolean } = {},
): Promise<Ticker[]> {
  if (!symbols.length) return [];

  const [{ data: prices }, sparks] = await Promise.all([
    db
      .from("price_cache")
      .select("symbol, price, change, change_percent, volume, avg_volume")
      .in("symbol", symbols),
    sparklines ? getSparklines() : new Map<string, number[]>(),
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
  "id, headline, source_url, related_symbols, published_at, news_summaries(summary)";

// news_summaries.news_id is the primary key, so PostgREST embeds it as a single
// object rather than an array. Treating it as an array silently yields null.
function toNewsItem(row: Record<string, unknown>, watchlist: string[]): NewsItem {
  const embedded = row.news_summaries as { summary: string } | null;
  const relatedSymbols = (row.related_symbols as string[] | null) ?? [];
  return {
    id: row.id as number,
    category: categoriseNews(relatedSymbols, watchlist),
    headline: row.headline as string,
    sourceUrl: row.source_url as string,
    relatedSymbols,
    publishedAt: row.published_at as string,
    summary: embedded?.summary ?? null,
  };
}

/**
 * Latest first — the one fixed ordering; there is no sort control by design.
 *
 * The category filter is applied against the visitor's watchlist rather than a
 * stored column, so the tabs re-split the same stored articles per visitor. The
 * filter runs in Postgres so that `limit` still counts articles the tab will
 * actually show.
 */
export async function getNews(
  watchlist: string[],
  category?: NewsCategory,
  limit = 60,
): Promise<NewsItem[]> {
  let query = db
    .from("news")
    .select(NEWS_COLUMNS)
    .order("published_at", { ascending: false })
    .limit(limit);

  // An empty tag list is what identifies the general feed; everything else is a
  // company article, sorted by whether the visitor watches any of its tickers.
  if (category === "market") query = query.eq("related_symbols", "{}");
  if (category === "company") query = query.overlaps("related_symbols", watchlist);
  if (category === "industry") {
    query = query
      .neq("related_symbols", "{}")
      .not("related_symbols", "ov", `{${watchlist.join(",")}}`);
  }

  const { data } = await query;
  return (data ?? []).map((row) => toNewsItem(row, watchlist));
}

/**
 * Market News teaser on the Home page. Reuses the same ordering as the News
 * page rather than computing a second ranking of its own.
 */
export async function getNewsTeaser(
  watchlist: string[],
  limit = 3,
): Promise<NewsItem[]> {
  return getNews(watchlist, undefined, limit);
}

// ---------------------------------------------------------------------------
// Today's Activity
// ---------------------------------------------------------------------------

export type IntradayPoint = { at: string; price: number; volume: number | null };

export type TimelineEntry = {
  at: string;
  kind: "market_open" | "high_volume" | "price_milestone" | "news" | "market_close";
  label: string;
  detail: string | null;
};

export type UpcomingEvent = {
  type: "earnings_date" | "earnings_call";
  at: string;
  note: string | null;
};

export type DailySummary = {
  narrative: string;
  bullets: string[];
  generatedAt: string;
};

export type Activity = {
  /**
   * The session everything on the page describes, as a New York date. Outside
   * market hours this is the last session that produced data, not today — the
   * page would otherwise go blank every evening and all weekend.
   */
  sessionDay: string;
  ticker: Ticker;
  /** XLK and SPY, for the Sector and Market stat cards. Null before a refresh. */
  sector: Ticker | null;
  market: Ticker | null;
  intraday: IntradayPoint[];
  news: NewsItem[];
  timeline: TimelineEntry[];
  events: UpcomingEvent[];
  summary: DailySummary | null;
};

const SECTOR_SYMBOL = "XLK";
const MARKET_SYMBOL = "SPY";

/** One session's intraday price and volume series for a symbol, oldest first. */
async function getIntraday(
  symbol: string,
  day: string,
): Promise<IntradayPoint[]> {
  const { from, to } = dayWindow(day);
  const { data } = await db
    .from("intraday_snapshots")
    .select("price, volume, snapshot_at")
    .eq("symbol", symbol)
    .gte("snapshot_at", from)
    .lt("snapshot_at", to)
    .order("snapshot_at", { ascending: true });

  return (data ?? [])
    .filter((row) => tradingDay(new Date(row.snapshot_at as string)) === day)
    .map((row) => ({
      at: row.snapshot_at as string,
      price: Number(row.price),
      volume: row.volume == null ? null : Number(row.volume),
    }));
}

/**
 * News Finnhub tagged with this symbol during one session.
 *
 * Scoped to the session on purpose: the stat card counts these as the day's
 * articles, and an unscoped "most recent 8 ever" made that card claim a number
 * the narrative directly beneath it contradicted. No limit, so the count is the
 * real one — a single symbol's day is a handful of articles.
 */
async function getSymbolNews(
  symbol: string,
  day: string,
  watchlist: string[],
): Promise<NewsItem[]> {
  const { from, to } = dayWindow(day);
  const { data } = await db
    .from("news")
    .select(NEWS_COLUMNS)
    .contains("related_symbols", [symbol])
    .gte("published_at", from)
    .lt("published_at", to)
    .order("published_at", { ascending: false });

  return (data ?? [])
    .filter((row) => tradingDay(new Date(row.published_at as string)) === day)
    .map((row) => toNewsItem(row, watchlist));
}

/**
 * Everything the Today's Activity page renders for one stock. Every field is a
 * cached table read — the page makes no upstream call and triggers no AI call;
 * the narrative was written once by the end-of-day job.
 */
export async function getActivity(
  symbol: string,
  watchlist: string[],
): Promise<Activity | null> {
  // The snapshots decide which session the page shows, and everything below is
  // then read for that one day — chart, news count, timeline and narrative all
  // describing the same session rather than each picking its own.
  const sessionDay = (await getLatestSessionDay(symbol)) ?? tradingDay();

  const [tickers, intraday, news] = await Promise.all([
    // This page draws its own chart from getIntraday and renders no sparkline.
    getTickers([symbol, SECTOR_SYMBOL, MARKET_SYMBOL], { sparklines: false }),
    getIntraday(symbol, sessionDay),
    getSymbolNews(symbol, sessionDay, watchlist),
  ]);

  const bySymbol = new Map(tickers.map((t) => [t.symbol, t]));
  const ticker = bySymbol.get(symbol);
  if (!ticker) return null;

  const [timelineRows, eventRows, summaryRow] = await Promise.all([
    db
      .from("timeline_events")
      .select("event_at, kind, label, detail")
      .eq("symbol", symbol)
      .eq("trading_day", sessionDay)
      .order("event_at", { ascending: true }),
    // Bounded by the start of today's ET date, not by the current instant.
    // Earnings rows carry a time only so the date and the call sort in order
    // (noon and 21:00 UTC), so comparing against "now" hid today's earnings from
    // the afternoon onwards — on the one day they matter most.
    db
      .from("events")
      .select("event_type, event_at, note")
      .eq("symbol", symbol)
      .gte("event_at", `${tradingDay()}T00:00:00Z`)
      .order("event_at", { ascending: true }),
    db
      .from("daily_summaries")
      .select("summary, bullets, generated_at")
      .eq("symbol", symbol)
      .eq("summary_date", sessionDay)
      .maybeSingle(),
  ]);

  const summary = summaryRow.data;

  return {
    sessionDay,
    ticker,
    sector: bySymbol.get(SECTOR_SYMBOL) ?? null,
    market: bySymbol.get(MARKET_SYMBOL) ?? null,
    intraday,
    news,
    timeline: (timelineRows.data ?? []).map((row) => ({
      at: row.event_at as string,
      kind: row.kind as TimelineEntry["kind"],
      label: row.label as string,
      detail: (row.detail as string | null) ?? null,
    })),
    events: (eventRows.data ?? []).map((row) => ({
      type: row.event_type as UpcomingEvent["type"],
      at: row.event_at as string,
      note: (row.note as string | null) ?? null,
    })),
    summary: summary
      ? {
          narrative: summary.summary as string,
          bullets: (summary.bullets as string[] | null) ?? [],
          generatedAt: summary.generated_at as string,
        }
      : null,
  };
}
