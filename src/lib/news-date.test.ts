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
