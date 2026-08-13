// Finnhub free tier. Primary source for price and average volume.
//
// Not available on this tier, confirmed by probing at build time:
//   /stock/candle  -> "You don't have access to this resource" (daily + intraday)
//   /quote         -> returns no volume field at all
//   ^VIX, ^GSPC    -> "Market data subscription required for CFD indices"
// Today's traded volume therefore comes from lib/yahoo.ts instead.

const BASE = "https://finnhub.io/api/v1";

export type Quote = {
  price: number;
  change: number;
  changePercent: number;
};

async function get<T>(path: string): Promise<T> {
  const url = `${BASE}${path}&token=${process.env.FINNHUB_API_KEY}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Finnhub ${path.split("?")[0]} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchQuote(symbol: string): Promise<Quote | null> {
  const raw = await get<{ c: number; d: number | null; dp: number | null }>(
    `/quote?symbol=${encodeURIComponent(symbol)}`,
  );
  // Finnhub answers unknown symbols with a zeroed payload rather than an error.
  if (!raw.c) return null;
  return { price: raw.c, change: raw.d ?? 0, changePercent: raw.dp ?? 0 };
}

/** 10-day average daily volume, in shares (Finnhub reports it in millions). */
export async function fetchAvgVolume(symbol: string): Promise<number | null> {
  const raw = await get<{ metric?: Record<string, number> }>(
    `/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all`,
  );
  const millions = raw.metric?.["10DayAverageTradingVolume"];
  return millions ? Math.round(millions * 1_000_000) : null;
}
