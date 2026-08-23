import { reconcileClose } from "@/lib/closing-price";
import { fetchAvgVolume, fetchQuote } from "@/lib/finnhub";
import { db } from "@/lib/supabase";
import { ALL_SYMBOLS, TOP_20_SYMBOLS } from "@/lib/symbols";
import { fetchDayData } from "@/lib/yahoo";

// Populates price_cache and intraday_snapshots for every tracked symbol. The
// pages themselves only ever read the database, so a page view costs no
// upstream API calls and cannot trip a rate limit.

/** Finnhub allows 60 calls/min; this keeps a burst well inside that. */
const CONCURRENCY = 5;

const SNAPSHOT_MINUTES = 15;

/**
 * Snaps a bar to the 15-minute grid the schema documents. The upstream feed
 * appends a live, partially-formed bar stamped with the current time, so
 * without this every refresh would leave an extra off-grid point behind and the
 * snapshots would drift away from an even cadence.
 */
function snapshotSlot(at: Date): string {
  const slot = new Date(at);
  slot.setUTCSeconds(0, 0);
  slot.setUTCMinutes(Math.floor(slot.getUTCMinutes() / SNAPSHOT_MINUTES) * SNAPSHOT_MINUTES);
  return slot.toISOString();
}

export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });

  await Promise.all(workers);
  return results;
}

type PriceRow = {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number | null;
  avg_volume: number | null;
  updated_at: string;
};

export type RefreshResult = {
  symbols: number;
  prices: number;
  snapshots: number;
  failed: string[];
};

export async function refreshMarketData(): Promise<RefreshResult> {
  // Average volume moves slowly, so it is only re-fetched when missing. That
  // keeps a warm run at one Finnhub call per symbol.
  const { data: cached } = await db
    .from("price_cache")
    .select("symbol, avg_volume");
  const knownAvg = new Map(
    (cached ?? []).map((r) => [r.symbol as string, r.avg_volume as number | null]),
  );

  const failed: string[] = [];
  const priceRows: PriceRow[] = [];
  const snapshotRows: {
    symbol: string;
    price: number;
    volume: number | null;
    snapshot_at: string;
  }[] = [];

  await mapLimit(ALL_SYMBOLS, CONCURRENCY, async (symbol) => {
    try {
      const [quote, day] = await Promise.all([
        fetchQuote(symbol),
        fetchDayData(symbol),
      ]);
      if (!quote) {
        failed.push(symbol);
        return;
      }

      // Relative volume is only ever shown for stocks, not the index proxies.
      let avgVolume = knownAvg.get(symbol) ?? null;
      if (avgVolume == null && TOP_20_SYMBOLS.includes(symbol)) {
        avgVolume = await fetchAvgVolume(symbol);
      }

      // Once the session has printed a close, that print is what gets stored
      // rather than the live quote — Finnhub's has already moved on the liquid
      // names by the time the closing-window tick runs. Mid-session this is the
      // quote untouched. See lib/closing-price.ts for the measurement.
      const settled = reconcileClose(quote, day.bars);

      priceRows.push({
        symbol,
        price: settled.price,
        change: settled.change,
        change_percent: settled.changePercent,
        volume: day.volume,
        avg_volume: avgVolume,
        updated_at: new Date().toISOString(),
      });

      for (const bar of day.bars) {
        snapshotRows.push({
          symbol,
          price: bar.price,
          volume: bar.volume,
          snapshot_at: snapshotSlot(bar.at),
        });
      }
    } catch {
      failed.push(symbol);
    }
  });

  if (priceRows.length) {
    const { error } = await db
      .from("price_cache")
      .upsert(priceRows, { onConflict: "symbol" });
    if (error) throw new Error(`price_cache upsert: ${error.message}`);
  }

  // The live bar can snap into the same slot as the last completed one, and
  // Postgres refuses an upsert that touches a row twice in one statement.
  // Latest value wins, so the in-progress slot carries the freshest price.
  const bySlot = new Map(
    snapshotRows.map((row) => [`${row.symbol}@${row.snapshot_at}`, row]),
  );
  const deduped = [...bySlot.values()];

  if (deduped.length) {
    const { error } = await db
      .from("intraday_snapshots")
      .upsert(deduped, { onConflict: "symbol,snapshot_at" });
    if (error) throw new Error(`intraday_snapshots upsert: ${error.message}`);
  }

  return {
    symbols: ALL_SYMBOLS.length,
    prices: priceRows.length,
    snapshots: deduped.length,
    failed,
  };
}
