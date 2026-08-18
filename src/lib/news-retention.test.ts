import assert from "node:assert/strict";
import { test } from "node:test";

import { newsRetentionCutoff, RETENTION_DAYS } from "./news-retention.ts";

/** ET days spanned by a window running from `cutoff` to `today`, inclusive. */
function windowDays(cutoff: string, today: string): number {
  const day = (d: string) => Date.parse(`${d}T00:00:00Z`) / 86_400_000;
  return day(today) - day(cutoff) + 1;
}

test("a fresh table floors at today minus six ET days", () => {
  const now = new Date("2026-06-10T16:00:00Z"); // 12:00 ET
  assert.equal(newsRetentionCutoff("2026-06-10", now), "2026-06-04");
});

test("an empty table falls back to the clock floor", () => {
  const now = new Date("2026-06-10T16:00:00Z");
  assert.equal(newsRetentionCutoff(null, now), "2026-06-04");
});

// The window used to be 144 fixed hours, which is not six ET calendar days
// whenever the span crosses a DST transition. Both directions drifted.
test("the window stays seven ET days across spring-forward", () => {
  // 00:30 ET on 2026-03-14, six days after the 2026-03-08 transition.
  const now = new Date("2026-03-14T04:30:00Z");
  const cutoff = newsRetentionCutoff("2026-03-14", now);
  assert.equal(cutoff, "2026-03-08");
  assert.equal(windowDays(cutoff, "2026-03-14"), RETENTION_DAYS);
});

test("the window stays seven ET days across fall-back", () => {
  // 23:30 ET on 2026-11-06, five days after the 2026-11-01 transition.
  const now = new Date("2026-11-07T04:30:00Z");
  const cutoff = newsRetentionCutoff("2026-11-06", now);
  assert.equal(cutoff, "2026-10-31");
  assert.equal(windowDays(cutoff, "2026-11-06"), RETENTION_DAYS);
});

// The case 0008_retention_keep_last.sql exists for: the project was paused, the
// prune kept the last surviving rows, and a clock-only floor would hide all of
// them and render the page empty.
test("stale surviving data stays visible, anchored on its own newest day", () => {
  const now = new Date("2026-08-19T12:00:00Z");
  const cutoff = newsRetentionCutoff("2026-07-22", now);
  assert.equal(cutoff, "2026-07-16");
  assert.ok("2026-07-20" >= cutoff);
});

test("the stale window is still capped at seven days", () => {
  const now = new Date("2026-08-19T12:00:00Z");
  const cutoff = newsRetentionCutoff("2026-07-22", now);
  assert.equal(windowDays(cutoff, "2026-07-22"), RETENTION_DAYS);
});

test("a future-dated article cannot pull the window forward", () => {
  const now = new Date("2026-06-10T16:00:00Z");
  assert.equal(newsRetentionCutoff("2026-06-30", now), "2026-06-04");
});

test("month and year boundaries shift by calendar date", () => {
  assert.equal(
    newsRetentionCutoff("2026-01-03", new Date("2026-01-03T16:00:00Z")),
    "2025-12-28",
  );
});
