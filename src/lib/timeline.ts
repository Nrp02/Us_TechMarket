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
  officialClosePrice?: number | null,
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
  //
  // Priced from price_cache (Finnhub's live quote) when available, not the
  // snapshot itself. The header stat and the AI summary both read
  // price_cache.price; the snapshot is a Yahoo 15-minute bar close, a different
  // upstream provider sampled at a slightly different instant, so using it here
  // made this row disagree with the other two by a few cents — measured at 4 of
  // 20 stocks on 2026-08-21 (NVDA +$0.03, NOW -$0.04, ORCL -$0.02, CRM +$0.01).
  // Falls back to the snapshot price when no canonical price was supplied.
  const closePrice = isAtOrAfterClose(last.at)
    ? officialClosePrice ?? last.price
    : null;

  if (closePrice != null) {
    rows.push({
      eventAt: last.at,
      kind: "market_close",
      label: "Market close",
      detail: formatPrice(closePrice),
    });
  }

  // Session high and low always get a row. An earlier version only added them
  // once the day's range cleared 1%, on the theory that a flat day's "high" is
  // noise — but that silently dropped them from the quietest days, which is
  // exactly where a reader looks to the timeline to find out where the day
  // actually turned. The only day that gets no pair is one that never moved.
  //
  // Mid-session these are the extremes so far, not the day's final ones: this
  // function is called every 15 minutes during the session and recomputes from
  // scratch each time, so a new high simply supersedes the previous row on the
  // next rebuild. That is correct-as-of-now, the same as the price beside it.
  //
  // The close counts as a candidate extreme in its own right, because it no
  // longer comes from the same feed as the bars. Without this a close a cent
  // above the day's highest bar prints "Session high" *below* the "Market
  // close" sitting directly under it — the same contradiction the shared close
  // price was introduced to remove, moved one row down. Not hypothetical: AMD
  // closed exactly *at* its highest bar on 2026-08-21, so a one-cent divergence
  // on such a day is all it takes. Ties keep the earlier bar, so the row still
  // points at where the extreme was first reached.
  const extremes: Snapshot[] =
    closePrice == null
      ? ordered
      : [...ordered, { at: last.at, price: closePrice, volume: null }];

  const high = extremes.reduce((a, b) => (b.price > a.price ? b : a));
  const low = extremes.reduce((a, b) => (b.price < a.price ? b : a));
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

  // Every article of the day gets a row. This was capped at the 3 most recent,
  // which made the timeline disagree with the News & Events stat card directly
  // above it — the card counts the day's articles and has never been capped, so
  // a stock with 7 articles showed "7" over a timeline listing 3. The News page
  // lists a symbol's whole day too; the timeline was the only place trimming.
  // No sort here: everything is folded into one chronological ordering below.
  for (const item of news) {
    rows.push({
      eventAt: item.at,
      kind: "news",
      label: "News",
      detail: item.headline,
    });
  }

  return rows.sort((a, b) => +a.eventAt - +b.eventAt);
}
