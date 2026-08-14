import assert from "node:assert/strict";
import { test } from "node:test";

import { TOP_20_SYMBOLS } from "./symbols.ts";
import {
  DEFAULT_WATCHLIST,
  normaliseWatchlist,
  WATCHLIST_MAX,
} from "./watchlist.ts";

// The watchlist now lives in a cookie, which means the visitor can edit it by
// hand. Every guarantee the pages rely on — known symbols only, no duplicates,
// never more than the cap, never empty — is enforced on read rather than only
// on write, and these tests are what holds that line.
//
// The cap is the part that matters most: it was already broken once, when the
// read path fell back to a hardcoded list while the API counted table rows, and
// the two disagreeing let an 11th stock through.

test("a missing or empty cookie falls back to the default seven", () => {
  assert.deepEqual(normaliseWatchlist([]), DEFAULT_WATCHLIST);
  assert.equal(DEFAULT_WATCHLIST.length, 7);
});

test("symbols outside the Top 20 are dropped", () => {
  assert.deepEqual(normaliseWatchlist(["NVDA", "GME", "AAPL"]), ["NVDA", "AAPL"]);
});

test("a cookie of nothing but junk falls back rather than rendering empty", () => {
  assert.deepEqual(normaliseWatchlist(["", "GME", "'; drop table"]), DEFAULT_WATCHLIST);
});

test("duplicates collapse, so the cap counts distinct stocks", () => {
  assert.deepEqual(normaliseWatchlist(["NVDA", "NVDA", "AAPL"]), ["NVDA", "AAPL"]);
});

test("an over-long cookie is clamped to the cap", () => {
  const all = normaliseWatchlist(TOP_20_SYMBOLS);
  assert.equal(all.length, WATCHLIST_MAX);
  assert.deepEqual(all, TOP_20_SYMBOLS.slice(0, WATCHLIST_MAX));
});

test("case and stray whitespace survive a hand-edited cookie", () => {
  assert.deepEqual(normaliseWatchlist([" nvda", "Aapl "]), ["NVDA", "AAPL"]);
});
