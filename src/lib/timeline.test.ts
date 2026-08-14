import assert from "node:assert/strict";
import { test } from "node:test";

import { buildTimeline, type Snapshot, type TimelineNews } from "./timeline.ts";

// Today's Timeline is built once per day by the end-of-day job and then read
// straight from the database, so a rule that quietly stops emitting a row is
// invisible until someone opens the page and notices something missing — which
// is exactly how the session high/low regression below was found.

const at = (hhmm: string) => new Date(`2026-08-13T${hhmm}:00Z`);

function bars(prices: number[], volume: number | null = 1_000): Snapshot[] {
  return prices.map((price, i) => ({
    at: at(`13:${String(i * 15).padStart(2, "0")}`),
    price,
    volume,
  }));
}

const labels = (rows: ReturnType<typeof buildTimeline>) => rows.map((r) => r.label);

test("a session with no snapshots produces nothing", () => {
  assert.deepEqual(buildTimeline([], []), []);
});

test("open and close are always present, priced from the first and last bar", () => {
  const rows = buildTimeline(bars([100, 101, 102]), []);

  const open = rows.find((r) => r.kind === "market_open");
  const close = rows.find((r) => r.kind === "market_close");
  assert.equal(open?.detail, "$100.00");
  assert.equal(close?.detail, "$102.00");
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

test("news is capped at three, keeping the most recent", () => {
  const news: TimelineNews[] = [
    { at: at("13:00"), headline: "oldest" },
    { at: at("14:00"), headline: "second" },
    { at: at("15:00"), headline: "third" },
    { at: at("16:00"), headline: "newest" },
  ];
  const details = buildTimeline(bars([100, 101]), news)
    .filter((r) => r.kind === "news")
    .map((r) => r.detail);

  assert.equal(details.length, 3);
  assert.deepEqual(details, ["second", "third", "newest"]);
  assert.equal(details.includes("oldest"), false);
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
