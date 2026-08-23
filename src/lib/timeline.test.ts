import assert from "node:assert/strict";
import { test } from "node:test";

import { buildTimeline, type Snapshot, type TimelineNews } from "./timeline.ts";

// Today's Timeline is written to the database by a job — every 15 minutes
// during the session, and again by the end-of-day job — and then read straight
// back, so a rule that quietly stops emitting a row is invisible until someone
// opens the page and notices something missing, which is exactly how the session
// high/low regression below was found.

// 2026-08-13 is a Thursday in EDT, so UTC is ET+4: 13:00Z is 09:00 ET and
// 20:00Z is 16:00 ET, the closing bell. Bars below therefore sit mid-session
// unless a test deliberately runs them past 20:00Z.
const at = (hhmm: string) => new Date(`2026-08-13T${hhmm}:00Z`);

// Minutes are added to a base instant rather than formatted into the string:
// the earlier `13:${i * 15}` produced "13:60" from the fifth bar onward, an
// invalid Date that every assertion happily ignored until something finally
// read the timestamp.
function bars(prices: number[], volume: number | null = 1_000): Snapshot[] {
  const base = at("13:00").getTime();
  return prices.map((price, i) => ({
    at: new Date(base + i * 15 * 60_000),
    price,
    volume,
  }));
}

/** The same bars, shifted so the final one lands exactly on 16:00 ET. */
function barsThroughClose(prices: number[], volume: number | null = 1_000): Snapshot[] {
  const lastIndex = prices.length - 1;
  return prices.map((price, i) => ({
    at: new Date(at("20:00").getTime() - (lastIndex - i) * 15 * 60_000),
    price,
    volume,
  }));
}

const labels = (rows: ReturnType<typeof buildTimeline>) => rows.map((r) => r.label);

test("a session with no snapshots produces nothing", () => {
  assert.deepEqual(buildTimeline([], []), []);
});

test("open and close are priced from the first and last bar once the bell has gone", () => {
  const rows = buildTimeline(barsThroughClose([100, 101, 102]), []);

  const open = rows.find((r) => r.kind === "market_open");
  const close = rows.find((r) => r.kind === "market_close");
  assert.equal(open?.detail, "$100.00");
  assert.equal(close?.detail, "$102.00");
});

// Regression: every one of the 20 stocks showed "Market close 1:15 PM" on a
// day the market was still open, because the last bar was labelled the close
// whatever time it carried. A forced mid-session run of the end-of-day job is
// what wrote it, and nothing downstream questioned the label.
test("a session still in progress has an open but no close", () => {
  const rows = buildTimeline(bars([100, 101, 102]), []);

  assert.ok(rows.some((r) => r.kind === "market_open"));
  assert.equal(rows.find((r) => r.kind === "market_close"), undefined);
});

test("snapshots that stop before the bell claim no close", () => {
  // Last bar at 19:45Z — 15:45 ET, a quarter hour short of the close.
  const short = barsThroughClose([100, 101, 102]).map((b) => ({
    ...b,
    at: new Date(b.at.getTime() - 15 * 60_000),
  }));

  assert.equal(buildTimeline(short, []).find((r) => r.kind === "market_close"), undefined);
});

test("a bar exactly on the bell counts as the close", () => {
  const rows = buildTimeline(barsThroughClose([100, 101]), []);
  const close = rows.find((r) => r.kind === "market_close");

  assert.equal(close?.detail, "$101.00");
  assert.equal(close?.eventAt.toISOString(), "2026-08-13T20:00:00.000Z");
});

// Regression: the header stat and the AI summary both read price_cache's
// Finnhub quote, but this row used to be priced from the last Yahoo snapshot
// instead — a different upstream provider, sampled at a slightly different
// instant, so the three disagreed by a few cents on a live page.
test("the close price prefers price_cache's canonical price over the snapshot", () => {
  const rows = buildTimeline(barsThroughClose([100, 101]), [], 101.42);
  const close = rows.find((r) => r.kind === "market_close");

  assert.equal(close?.detail, "$101.42");
  // The event still lands at the snapshot's own timestamp — only the priced
  // value changes.
  assert.equal(close?.eventAt.toISOString(), "2026-08-13T20:00:00.000Z");
});

// The close comes from a different feed than the bars, so it can land outside
// the range they describe. AMD closed exactly at its highest bar on 2026-08-21,
// which is one cent of divergence away from printing "Session high" below the
// "Market close" directly beneath it.
test("a canonical close beyond every bar becomes the session extreme itself", () => {
  const high = buildTimeline(barsThroughClose([100, 101]), [], 101.01)
    .find((r) => r.label === "Session high");
  assert.equal(high?.detail, "$101.01");

  const low = buildTimeline(barsThroughClose([100, 101]), [], 99.99)
    .find((r) => r.label === "Session low");
  assert.equal(low?.detail, "$99.99");
});

test("a canonical close inside the range leaves the extremes on their own bars", () => {
  const rows = buildTimeline(barsThroughClose([100, 105, 102]), [], 102.5);

  assert.equal(rows.find((r) => r.label === "Session high")?.detail, "$105.00");
  assert.equal(rows.find((r) => r.label === "Session low")?.detail, "$100.00");
  // The extreme keeps the timestamp of the bar that set it, not the close's.
  assert.equal(
    rows.find((r) => r.label === "Session high")?.eventAt.toISOString(),
    "2026-08-13T19:45:00.000Z",
  );
});

// The synthetic close point carries no volume, so it must not reach the median
// that decides what counts as heavy trading.
test("the canonical close does not disturb the heavy-trading threshold", () => {
  const withClose = buildTimeline(
    barsThroughClose([100, 101, 102, 103]).map((b, i) => ({
      ...b,
      volume: [100, 100, 100, 150][i],
    })),
    [],
    103.5,
  );
  assert.equal(labels(withClose).includes("Heavy trading"), false);
});

test("the close price falls back to the snapshot when no canonical price is given", () => {
  const withUndefined = buildTimeline(barsThroughClose([100, 101]), []);
  const withNull = buildTimeline(barsThroughClose([100, 101]), [], null);

  assert.equal(withUndefined.find((r) => r.kind === "market_close")?.detail, "$101.00");
  assert.equal(withNull.find((r) => r.kind === "market_close")?.detail, "$101.00");
});

test("session high and low appear even when the day barely moved", () => {
  // The regression this pins: an earlier version only emitted the pair once the
  // day's range cleared 1%, which silently dropped them from the quietest
  // sessions — where the timeline is the only thing telling a reader where the
  // day turned. A 0.05% range must still produce both.
  const rows = buildTimeline(bars([100, 100.05, 100.02]), []);

  const high = rows.find((r) => r.label === "Session high");
  const low = rows.find((r) => r.label === "Session low");
  assert.equal(high?.detail, "$100.05");
  assert.equal(low?.detail, "$100.00");
});

test("a session that never moved gets no high/low pair", () => {
  // The one case where omitting them is right: with a single price there is no
  // high and no low to point at, only two identical rows.
  const rows = buildTimeline(bars([100, 100, 100]), []);
  assert.equal(labels(rows).includes("Session high"), false);
  assert.equal(labels(rows).includes("Session low"), false);
});

test("heavy trading is flagged only when a bar clears twice the day's median", () => {
  const quiet = buildTimeline(bars([100, 101, 102, 103]).map((b, i) => ({
    ...b,
    volume: [100, 100, 100, 150][i],
  })), []);
  assert.equal(labels(quiet).includes("Heavy trading"), false);

  const spike = buildTimeline(bars([100, 101, 102, 103]).map((b, i) => ({
    ...b,
    volume: [100, 100, 100, 1_000][i],
  })), []);
  const heavy = spike.find((r) => r.kind === "high_volume");
  assert.equal(heavy?.detail, "1K shares in 15 minutes");
});

test("the median ignores bars with no volume rather than counting them as zero", () => {
  const rows = buildTimeline(bars([100, 101, 102, 103, 104]).map((b, i) => ({
    ...b,
    volume: [100, null, 100, 100, 150][i],
  })), []);
  // Median of the four known bars is 100, so 150 is short of the 2x threshold.
  // Counting the null as 0 would drag the median down and wrongly flag it.
  assert.equal(labels(rows).includes("Heavy trading"), false);
});

// This asserted the opposite until the cap was removed: news was trimmed to the
// 3 most recent, so a stock with 7 articles had a timeline showing 3 under a
// stat card counting 7. Nothing is dropped now.
test("every article of the day gets a row, oldest included", () => {
  const news: TimelineNews[] = [
    { at: at("13:00"), headline: "oldest" },
    { at: at("14:00"), headline: "second" },
    { at: at("15:00"), headline: "third" },
    { at: at("16:00"), headline: "newest" },
  ];
  const details = buildTimeline(bars([100, 101]), news)
    .filter((r) => r.kind === "news")
    .map((r) => r.detail);

  assert.equal(details.length, 4);
  assert.deepEqual(details, ["oldest", "second", "third", "newest"]);
});

test("every row comes back in chronological order", () => {
  const rows = buildTimeline(
    bars([100, 105, 98, 102]).map((b, i) => ({
      ...b,
      volume: [100, 100, 100, 900][i],
    })),
    [{ at: at("13:20"), headline: "mid-session" }],
  );

  const times = rows.map((r) => r.eventAt.getTime());
  assert.deepEqual(times, [...times].sort((a, b) => a - b));
  assert.ok(rows.length > 4, "expected open, close, high, low and more");
});
