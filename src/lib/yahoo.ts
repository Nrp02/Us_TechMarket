// Volume-only supplement to Finnhub.
//
// Finnhub's free tier exposes no traded-volume figure and no candles, which
// would otherwise cost the Volume and Rel. Volume columns, two of the three
// Significant Movement branches, and the intraday snapshots that back every
// sparkline. This endpoint is public and needs no key. It is deliberately
// scoped to that one gap — Finnhub stays the source for price and averages.
//
// It is an unofficial endpoint and may change without notice, so every caller
// treats a failure as "volume unknown" rather than an error.

const CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

export type Bar = { at: Date; price: number; volume: number | null };

export type DayData = {
  /** Cumulative volume traded so far in today's regular session. */
  volume: number | null;
  /** 15-minute intraday bars for the current session, oldest first. */
  bars: Bar[];
};

type ChartResponse = {
  chart: {
    result?: [
      {
        meta: { regularMarketVolume?: number };
        timestamp?: number[];
        indicators: {
          quote: [{ close?: (number | null)[]; volume?: (number | null)[] }];
        };
      },
    ];
  };
};

export async function fetchDayData(symbol: string): Promise<DayData> {
  const empty: DayData = { volume: null, bars: [] };
  try {
    const res = await fetch(
      `${CHART}/${encodeURIComponent(symbol)}?range=1d&interval=15m`,
      {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) return empty;

    const result = ((await res.json()) as ChartResponse).chart.result?.[0];
    if (!result) return empty;

    const stamps = result.timestamp ?? [];
    const { close = [], volume = [] } = result.indicators.quote[0];

    const bars: Bar[] = [];
    stamps.forEach((stamp, i) => {
      const price = close[i];
      // Yahoo pads the session with null-priced bars; they carry no data.
      if (price == null) return;
      bars.push({ at: new Date(stamp * 1000), price, volume: volume[i] ?? null });
    });

    return { volume: result.meta.regularMarketVolume ?? null, bars };
  } catch {
    return empty;
  }
}
