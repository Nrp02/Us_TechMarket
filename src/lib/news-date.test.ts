import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveNewsDate } from "./news-date.ts";

const TODAY = "2026-08-14";
const AVAILABLE = ["2026-08-14", "2026-08-13", "2026-08-12"];

test("no date param defaults to today", () => {
  assert.deepEqual(resolveNewsDate(undefined, TODAY, AVAILABLE), {
    date: TODAY,
    isToday: true,
    isAll: false,
  });
});

test("today is valid even when it has no stored articles yet", () => {
  assert.deepEqual(resolveNewsDate(TODAY, TODAY, []), {
    date: TODAY,
    isToday: true,
    isAll: false,
  });
});

test("'all' clears the date filter", () => {
  assert.deepEqual(resolveNewsDate("all", TODAY, AVAILABLE), {
    date: null,
    isToday: false,
    isAll: true,
  });
});

test("a known past date is honoured", () => {
  assert.deepEqual(resolveNewsDate("2026-08-13", TODAY, AVAILABLE), {
    date: "2026-08-13",
    isToday: false,
    isAll: false,
  });
});

test("an unknown date falls back to today rather than showing nothing", () => {
  assert.deepEqual(resolveNewsDate("2026-01-01", TODAY, AVAILABLE), {
    date: TODAY,
    isToday: true,
    isAll: false,
  });
});

test("a malformed date falls back to today", () => {
  assert.deepEqual(resolveNewsDate("not-a-date", TODAY, AVAILABLE), {
    date: TODAY,
    isToday: true,
    isAll: false,
  });
});

// The ten-hour window every day between the 02:00 and 12:00 UTC news cycles,
// and every weekend, where today is real but has nothing stored yet.
const QUIET = ["2026-08-13", "2026-08-12"]; // today absent

test("with nothing stored for today, the default lands on the newest stored day", () => {
  assert.deepEqual(resolveNewsDate(undefined, TODAY, QUIET), {
    date: "2026-08-13",
    isToday: false,
    isAll: false,
  });
});

test("choosing Today explicitly still reaches today's own empty state", () => {
  assert.deepEqual(resolveNewsDate(TODAY, TODAY, QUIET), {
    date: TODAY,
    isToday: true,
    isAll: false,
  });
});

test("a stale date falls back to the newest stored day, not to an empty today", () => {
  assert.deepEqual(resolveNewsDate("2026-01-01", TODAY, QUIET), {
    date: "2026-08-13",
    isToday: false,
    isAll: false,
  });
});

test("an empty table still resolves to today rather than crashing", () => {
  assert.deepEqual(resolveNewsDate(undefined, TODAY, []), {
    date: TODAY,
    isToday: true,
    isAll: false,
  });
});

test("'all' still wins over the fallback", () => {
  assert.deepEqual(resolveNewsDate("all", TODAY, QUIET), {
    date: null,
    isToday: false,
    isAll: true,
  });
});

test("a future-dated article does not become the fallback day", () => {
  // One upstream row stamped next month sorts ahead of every real day. Unasked
  // visitors must still land on 2026-08-13, not on the junk date.
  const withFuture = ["2026-09-20", "2026-08-13", "2026-08-12"];
  assert.deepEqual(resolveNewsDate(undefined, TODAY, withFuture), {
    date: "2026-08-13",
    isToday: false,
    isAll: false,
  });
});

test("a future date can still be reached when it is asked for explicitly", () => {
  const withFuture = ["2026-09-20", "2026-08-13"];
  assert.deepEqual(resolveNewsDate("2026-09-20", TODAY, withFuture), {
    date: "2026-09-20",
    isToday: false,
    isAll: false,
  });
});

test("only future days stored still resolves to today", () => {
  assert.deepEqual(resolveNewsDate(undefined, TODAY, ["2026-09-20"]), {
    date: TODAY,
    isToday: true,
    isAll: false,
  });
});
