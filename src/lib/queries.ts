import { unstable_cache } from "next/cache";

import { tradingDay } from "@/lib/market";
import type { NewsCategory } from "@/lib/news-category";
import { newsRetentionCutoff } from "@/lib/news-retention";
import { isSignificant, significanceScore } from "@/lib/significance";
import { db } from "@/lib/supabase";
import { NAME_BY_SYMBOL } from "@/lib/symbols";

// Every Home page read comes from here. Nothing in this file calls an upstream
// API — the tables are filled by lib/refresh.ts.

/**
 * How long a render may reuse the previous database read.
 *
 * Measured from inside the deployed function: a query returning one row costs
 * the same ~155ms as one returning 840, so the price is paid per request rather
 * than per row, and page time was almost exactly (number of queries that have to
 * run in sequence) × that cost. Re-reading on every render bought nothing,
 * because the ingestion jobs only write every 15 minutes — a window this far
 * inside that cadence cannot show a visitor figures from a different session
 * than the one already on screen.
 *
 * The reads cached here are all visitor-independent. The watchlist is a cookie
 * and never reaches this file except as an argument, which becomes part of the
 * cache key, so one visitor's selection can never be served to another.
 */
const CACHE_SECONDS = 60;

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

/** The instant of the newest stored snapshot, overall or for one symbol. */
async function newestSnapshotAt(symbol?: string): Promise<string | null> {
  let query = db
    .from("intraday_snapshots")
    .select("snapshot_at")
    .order("snapshot_at", { ascending: false })
    .limit(1);

  if (symbol) query = query.eq("symbol", symbol);

  const { data } = await query;
  return (data?.[0]?.snapshot_at as string | undefined) ?? null;
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
  const newest = await newestSnapshotAt(symbol);
  return newest ? tradingDay(new Date(newest)) : null;
}

/**
 * The session the cached data describes: its New York date, and the instant of
 * the newest snapshot in it. Null before any snapshot exists.
 *
 * The shell reads this on every route, which is the reason it is cached and the
 * reason it returns both halves. The day answers "which session is this",
 * asked once per page by a visitor whose own clock is not New York's; the
 * instant answers "how fresh", and it is the one the ET suffix hangs off. It is
 * read from the data rather than from the clock for the same reason
 * getLatestSessionDay is: a wall-clock look-back empties over a weekend.
 *
 * Both fields are strings, so the value survives the data cache — a Date would
 * come back as an ISO string and a Map would come back as {}.
 */
export const getSessionStamp = unstable_cache(
  async (): Promise<{ day: string; at: string } | null> => {
    const newest = await newestSnapshotAt();
    return newest ? { day: tradingDay(new Date(newest)), at: newest } : null;
  },
  ["session-stamp"],
  { revalidate: CACHE_SECONDS },
);

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

async function getTickersUncached(
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

// Ticker[] is plain JSON, so it survives the cache intact. The Map that
// getSparklines returns deliberately never crosses this boundary — a Map
// serialises to {} and every sparkline would silently come back empty.
export const getTickers = unstable_cache(getTickersUncached, ["tickers"], {
  revalidate: CACHE_SECONDS,
});

// No `category` field: the thumbnail stopped needing one when market news
// started being identified by an empty `related_symbols`, and the tab filtering
// runs in Postgres in `getNews` below. `categoriseNews` still holds the rule and
// its tests, and the three filters there mirror it.
export type NewsItem = {
  id: number;
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
function toNewsItem(row: Record<string, unknown>): NewsItem {
  const embedded = row.news_summaries as { summary: string } | null;
  const relatedSymbols = (row.related_symbols as string[] | null) ?? [];
  return {
    id: row.id as number,
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
 * actually show — and the date filter has to obey the same rule, which is what
 * the `if (!day)` below exists for.
 *
 * The invariant this protects: on any given day, All News is exactly the union
 * of Company, Industry and Market, and its count is the whole day. Three tabs
 * that add up to more than the tab containing them is the tell that a limit is
 * being applied against a set that is not the one being displayed.
 *
 * `day` scopes to one ET trading day, using the same dayWindow-plus-JS-filter
 * pattern as getSymbolNews and getIntraday below — the UTC window narrows the
 * query, and the exact ET boundary is settled after. Null (the default) applies
 * no date filter at all, which is what the Home teaser wants: it is not the
 * News page's "today" default, it is "most recent regardless of day".
 */
/**
 * The oldest ET day the News page will show: seven days ending on the newest
 * day that actually has an article, matching the seven days
 * `data-retention-cleanup` keeps in the database (0007_data_retention.sql,
 * guarded in 0008_retention_keep_last.sql).
 *
 * An ET *day* rather than a rolling `now - 7d` instant. Every other date rule
 * in this file works in whole trading days, and a sliding instant makes the
 * oldest day a partial one whose article count shrinks on every reload — the
 * picker would offer a date and then quietly show less of it each time. Whole
 * days also make the picker's seven entries exactly the seven days retained.
 *
 * A floor is still needed on top of the physical prune, because that job runs
 * once a day and the table legitimately holds more than a week between runs.
 * The rule itself lives in lib/news-retention.ts, where it is testable.
 */
/**
 * The newest ET day with a stored article, or null when the table is empty.
 *
 * One row, and read alongside the article query rather than before it — query
 * depth is what a page pays for (see CACHE_SECONDS above), so an extra query
 * that runs concurrently is close to free while a sequential one is not.
 */
async function getNewestNewsDayUncached(): Promise<string | null> {
  const { data } = await db
    .from("news")
    .select("published_at")
    .order("published_at", { ascending: false })
    .limit(1);

  const newest = data?.[0]?.published_at as string | undefined;
  return newest ? tradingDay(new Date(newest)) : null;
}

const getNewestNewsDay = unstable_cache(
  getNewestNewsDayUncached,
  ["news-newest-day"],
  { revalidate: CACHE_SECONDS },
);

async function getNewsUncached(
  watchlist: string[],
  category?: NewsCategory,
  day?: string | null,
  limit = 60,
): Promise<NewsItem[]> {
  let query = db
    .from("news")
    .select(NEWS_COLUMNS)
    .order("published_at", { ascending: false });

  // `limit` is applied in Postgres only when there is no day filter, and that
  // placement is the whole point rather than an optimisation.
  //
  // dayWindow is 36 hours wide because it has to *contain* an ET day (see
  // below); the exact day is settled afterwards in JS. Applying the limit in
  // Postgres therefore truncated the wrong set — it took the newest `limit`
  // rows of the 36-hour window, which are dominated by the *next* ET day, and
  // the JS filter then threw most of them away. Measured on ET 2026-08-20: the
  // window held 183 rows, the day itself held 122, and the page rendered 5.
  //
  // It was worse than a simple undercount, because the category predicates run
  // in Postgres too. Each tab drew its 60 from a smaller pool, so more of its
  // rows survived the day filter than All News's did — 34 / 38 / 27 against 5,
  // three tabs each larger than the tab that is supposed to contain them.
  //
  // So a day view is uncapped: the window bounds it to a few hundred rows, and
  // a query returning 200 rows costs what one returning 1 costs here (the cost
  // is per request — see CACHE_SECONDS). The `limit` argument is ignored on
  // this path, which no caller exercises: only the Home teaser passes one, and
  // it passes no day.
  //
  // PostgREST's own 1000-row ceiling is *not* a graceful backstop here, which
  // is worth stating because it reads like one. It keeps the newest 1000 rows
  // and drops the rest, and the newest rows of a 36-hour window are the next ET
  // day — so a window that ever exceeded 1000 would lose the requested day from
  // its oldest end and reproduce exactly the bug above, tabs outgrowing All News
  // and all. Headroom is real (183 rows in the widest window measured); if it
  // ever narrows, tighten the window rather than trusting the ceiling.
  if (!day) query = query.limit(limit);

  // An empty tag list is what identifies the general feed; everything else is a
  // company article, sorted by whether the visitor watches any of its tickers.
  if (category === "market") query = query.eq("related_symbols", "{}");
  if (category === "company") query = query.overlaps("related_symbols", watchlist);
  if (category === "industry") {
    query = query
      .neq("related_symbols", "{}")
      .not("related_symbols", "ov", `{${watchlist.join(",")}}`);
  }

  if (day) {
    const { from, to } = dayWindow(day);
    query = query.gte("published_at", from).lt("published_at", to);
  }

  // The retention floor is applied here rather than as a SQL bound, because it
  // depends on the newest stored day and so is not known while the query is
  // being built. Nothing is lost: the rows are already ordered newest first, so
  // the limit still takes the newest `limit` articles and the floor only ever
  // trims a tail that failed it. That reasoning only holds because the limit
  // and the floor agree on an ordering; it is exactly the reasoning the day
  // filter broke, since a day is not a suffix of a newest-first list.
  const [{ data }, newestDay] = await Promise.all([query, getNewestNewsDay()]);
  const cutoff = newsRetentionCutoff(newestDay);

  const items = (data ?? [])
    .map((row) => toNewsItem(row))
    .filter((item) => tradingDay(new Date(item.publishedAt)) >= cutoff);
  return day
    ? items.filter((item) => tradingDay(new Date(item.publishedAt)) === day)
    : items;
}

// The watchlist is an argument rather than a cookie read, so it lands in the
// cache key and the Company and Industry tabs stay per-visitor.
export const getNews = unstable_cache(getNewsUncached, ["news"], {
  revalidate: CACHE_SECONDS,
});

/**
 * Market News teaser on the Home page. Reuses the same ordering as the News
 * page rather than computing a second ranking of its own. Explicitly
 * date-unfiltered: the teaser's job is "most recent 3, whatever day", not
 * "today's 3" — a quiet morning before today's first news cycle should not
 * empty out the Home page.
 */
export async function getNewsTeaser(
  watchlist: string[],
  limit = 3,
): Promise<NewsItem[]> {
  return getNews(watchlist, undefined, null, limit);
}

/**
 * Every ET trading day that has at least one stored article, most recent
 * first. Backs the News page's date filter. Reads one column across the whole
 * table rather than a grouped SQL query — simplest thing that works at the
 * size this table actually is (measured in the low hundreds of rows), and it
 * avoids adding a Postgres function for one dropdown.
 */
async function getNewsAvailableDatesUncached(): Promise<string[]> {
  const { data } = await db
    .from("news")
    .select("published_at")
    .order("published_at", { ascending: false })
    .limit(1000);

  const rows = data ?? [];
  // Rows come back newest first, so the first one is the anchor the floor is
  // measured from — no second query is needed here.
  const newestDay = rows.length
    ? tradingDay(new Date(rows[0].published_at as string))
    : null;
  const cutoff = newsRetentionCutoff(newestDay);

  const days = new Set<string>();
  for (const row of rows) {
    const day = tradingDay(new Date(row.published_at as string));
    if (day >= cutoff) days.add(day);
  }
  return [...days].sort().reverse();
}

export const getNewsDates = unstable_cache(
  getNewsAvailableDatesUncached,
  ["news-dates"],
  { revalidate: CACHE_SECONDS },
);

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
async function getSymbolNews(symbol: string, day: string): Promise<NewsItem[]> {
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
    .map((row) => toNewsItem(row));
}

/**
 * Everything the Today's Activity page renders for one stock. Every field is a
 * cached table read — the page makes no upstream call and triggers no AI call;
 * the narrative was written once by the end-of-day job.
 */
async function getActivityUncached(symbol: string): Promise<Activity | null> {
  // The snapshots decide which session the page shows, and everything below is
  // then read for that one day — chart, news count, timeline and narrative all
  // describing the same session rather than each picking its own.
  const sessionDay = (await getLatestSessionDay(symbol)) ?? tradingDay();

  // One wave, not two: the timeline/events/summary queries only need `symbol`
  // and `sessionDay`, both already known, so they don't have to wait behind the
  // tickers/intraday/news queries above them.
  const [tickers, intraday, news, timelineRows, eventRows, summaryRow] = await Promise.all([
    // This page draws its own chart from getIntraday and renders no sparkline.
    // Uncached on purpose: the whole of getActivity is cached below, so going
    // through the cached variant here would only add a second lookup for a
    // result this one already covers.
    getTickersUncached([symbol, SECTOR_SYMBOL, MARKET_SYMBOL], { sparklines: false }),
    getIntraday(symbol, sessionDay),
    getSymbolNews(symbol, sessionDay),
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

  const bySymbol = new Map(tickers.map((t) => [t.symbol, t]));
  const ticker = bySymbol.get(symbol);
  if (!ticker) return null;

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

// Keyed by symbol alone — nothing on this page varies by visitor. Every field
// in Activity is a string, a number or an array of them, so the object survives
// the cache unchanged; no timestamp here is a Date that would come back as text.
export const getActivity = unstable_cache(getActivityUncached, ["activity"], {
  revalidate: CACHE_SECONDS,
});
