// Today's Timeline rules.
//
// Every entry is derived from data already stored — intraday snapshots and
// cached news — by a plain threshold, never by the model. This file is pure:
// it reads no database and calls no API, so the rules can be reasoned about
// (and the numbers checked by hand) on their own.

import { formatPrice, formatVolume } from "@/lib/format";
import { isAtOrAfterClose } from "@/lib/market";

export type Snapshot = { at: Date; price: number; volume: number | null };
export type TimelineNews = { at: Date; headline: string };

export type TimelineKind =
  | "market_open"
  | "high_volume"
  | "price_milestone"
  | "news"
  | "market_close";

export type TimelineRow = {
  eventAt: Date;
  kind: TimelineKind;
  label: string;
  detail: string | null;
};

/** A 15-minute bar counts as heavy trading at this multiple of the day's median. */
const HEAVY_VOLUME_MULTIPLE = 2;

/** Timeline stays readable; the whole day's news would swamp the price entries. */
const MAX_NEWS_ROWS = 3;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function buildTimeline(
  snapshots: Snapshot[],
  news: TimelineNews[],
): TimelineRow[] {
  if (!snapshots.length) return [];

  const ordered = [...snapshots].sort((a, b) => +a.at - +b.at);
  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  const rows: TimelineRow[] = [
    {
      eventAt: first.at,
      kind: "market_open",
      label: "Market open",
      detail: formatPrice(first.price),
    },
  ];

  // The close is claimed only when a snapshot actually lands at or after the
  // bell. The last bar is not the close just because it is last: build the
  // timeline at 13:15 and this used to label 13:15 "Market close", which is
  // what a forced mid-session run of the end-of-day job put on every one of the
  // 20 stocks — the job normally refuses to run while the market is open, but
  // `force` in the route skips that check and nothing downstream re-checked.
  //
  // It also covers the quieter case: if the snapshots stop before 16:00 because
  // a tick was missed near the bell, the day genuinely has no recorded close,
  // and saying so beats naming whatever time the data happened to stop at.
  if (isAtOrAfterClose(last.at)) {
    rows.push({
      eventAt: last.at,
      kind: "market_close",
      label: "Market close",
      detail: formatPrice(last.price),
    });
  }

  // Session high and low always get a row. An earlier version only added them
  // once the day's range cleared 1%, on the theory that a flat day's "high" is
  // noise — but that silently dropped them from the quietest days, which is
  // exactly where a reader looks to the timeline to find out where the day
  // actually turned. The only day that gets no pair is one that never moved.
  const high = ordered.reduce((a, b) => (b.price > a.price ? b : a));
  const low = ordered.reduce((a, b) => (b.price < a.price ? b : a));
  if (high.price !== low.price) {
    rows.push(
      {
        eventAt: high.at,
        kind: "price_milestone",
        label: "Session high",
        detail: formatPrice(high.price),
      },
      {
        eventAt: low.at,
        kind: "price_milestone",
        label: "Session low",
        detail: formatPrice(low.price),
      },
    );
  }

  // Heaviest 15-minute bar of the day, when it stands clear of a typical bar.
  // Comparing against the median rather than the mean keeps the open and close
  // auctions — reliably the day's two biggest bars — from setting the bar for
  // what counts as unusual.
  const volumes = ordered.flatMap((s) => (s.volume ? [s.volume] : []));
  if (volumes.length >= 4) {
    const threshold = median(volumes) * HEAVY_VOLUME_MULTIPLE;
    const peak = ordered
      .filter((s) => s.volume != null)
      .reduce((a, b) => (b.volume! > a.volume! ? b : a));

    if (peak.volume! >= threshold) {
      rows.push({
        eventAt: peak.at,
        kind: "high_volume",
        label: "Heavy trading",
        detail: `${formatVolume(peak.volume)} shares in 15 minutes`,
      });
    }
  }

  // Newest first so the most recent headlines survive the cap, then folded back
  // into the single chronological ordering below.
  const notable = [...news].sort((a, b) => +b.at - +a.at).slice(0, MAX_NEWS_ROWS);
  for (const item of notable) {
    rows.push({
      eventAt: item.at,
      kind: "news",
      label: "News",
      detail: item.headline,
    });
  }

  return rows.sort((a, b) => +a.eventAt - +b.eventAt);
}
