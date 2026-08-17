import { tradingDay } from "@/lib/market";
import { db } from "@/lib/supabase";
import type { Snapshot } from "@/lib/timeline";

// One trading day's stored snapshots and news for a set of symbols. Shared by
// the two things that rebuild a timeline: the intraday refresh route and the
// end-of-day summary job.

export type DayNews = {
  headline: string;
  summary: string | null;
  publishedAt: string;
};

export type DayDataBatch = {
  bySymbol: Map<string, { snapshots: Snapshot[]; news: DayNews[] }>;
  /** Reads that came back short of their exact count — see the note below. */
  truncated: string[];
};

/**
 * Snapshots and news are stored in UTC; a trading day is a New York date. New
 * York is UTC-4 or UTC-5, so one ET day always falls inside the UTC window from
 * its own midnight to noon the next day. The window narrows the query; the exact
 * boundary is settled by comparing trading days below.
 *
 * Batched across every symbol in `symbols` rather than queried one at a time:
 * the day window is already shared, so there is nothing symbol-specific about
 * the query shape. This is what keeps the Supabase cost fixed at two round trips
 * no matter how many stocks the caller covers, instead of two per symbol.
 */
export async function loadDayDataBatch(
  symbols: string[],
  day: string,
): Promise<DayDataBatch> {
  const from = `${day}T00:00:00Z`;
  const to = new Date(Date.parse(`${day}T12:00:00Z`) + 86_400_000).toISOString();

  const [snapshotResult, newsResult] = await Promise.all([
    db
      .from("intraday_snapshots")
      .select("symbol, price, volume, snapshot_at", { count: "exact" })
      .in("symbol", symbols)
      .gte("snapshot_at", from)
      .lt("snapshot_at", to)
      .order("snapshot_at", { ascending: true }),
    db
      .from("news")
      .select("related_symbols, headline, published_at, news_summaries(summary)", {
        count: "exact",
      })
      .overlaps("related_symbols", symbols)
      .gte("published_at", from)
      .lt("published_at", to)
      .order("published_at", { ascending: false }),
  ]);

  const { data: snapshotRows } = snapshotResult;
  const { data: newsRows } = newsResult;

  // PostgREST caps a response at its max-rows setting (1000 by default) and
  // says nothing when it does — the reply is simply short. Batching made that
  // reachable: one query now carries every symbol's rows where each used to
  // carry one symbol's, and a silent truncation would drop whole stocks'
  // snapshots and quietly rebuild their timelines from partial data. Comparing
  // the returned rows against the exact count turns that into a reported
  // failure. Measured at 671 rows for 20 symbols on a normal session, so this
  // is headroom monitoring, not an expected path.
  const truncated: string[] = [];
  for (const [table, result] of [
    ["intraday_snapshots", snapshotResult],
    ["news", newsResult],
  ] as const) {
    const returned = result.data?.length ?? 0;
    if (result.count != null && result.count > returned) {
      truncated.push(
        `${table}: row cap hit — ${returned} of ${result.count} rows returned, so timelines would be rebuilt from partial data`,
      );
    }
  }

  const bySymbol = new Map<string, { snapshots: Snapshot[]; news: DayNews[] }>(
    symbols.map((symbol) => [symbol, { snapshots: [], news: [] }]),
  );

  for (const row of snapshotRows ?? []) {
    const at = new Date(row.snapshot_at as string);
    if (tradingDay(at) !== day) continue;
    bySymbol.get(row.symbol as string)?.snapshots.push({
      at,
      price: Number(row.price),
      volume: row.volume == null ? null : Number(row.volume),
    });
  }

  for (const row of newsRows ?? []) {
    if (tradingDay(new Date(row.published_at as string)) !== day) continue;
    const item: DayNews = {
      headline: row.headline as string,
      // news_id is news_summaries' primary key, so PostgREST embeds a single
      // object here even though the client's inferred type says array.
      summary:
        (row.news_summaries as unknown as { summary: string } | null)?.summary ?? null,
      publishedAt: row.published_at as string,
    };
    for (const symbol of (row.related_symbols as string[] | null) ?? []) {
      bySymbol.get(symbol)?.news.push(item);
    }
  }

  return { bySymbol, truncated };
}
