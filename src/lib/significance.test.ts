import assert from "node:assert/strict";
import { test } from "node:test";

import { isSignificant, relativeVolume, significanceScore } from "./significance.ts";

// The Significant Movement rule is used in three places (Home Status badge, Top
// Movers ranking, Today's Activity badge) and CLAUDE.md forbids reimplementing
// it per page. These tests are what makes that safe: change the thresholds and
// every caller's behaviour changes at once, so the rule needs a check that does
// not depend on remembering to look at a page.
//
// The cases below are the ones the Phase 2 gate specifies — "one of each trigger
// condition" — which until now existed only as prose in CLAUDE.md.
//
//   |price change| >= 5%                             -> Significant
//   relative volume >= 2.5x                          -> Significant
//   |price change| >= 3% AND relative volume >= 1.5x -> Significant
//   else                                             -> Normal

test("price change alone triggers at 5%", () => {
  assert.equal(isSignificant(5, 1), true);
  assert.equal(isSignificant(4.99, 1), false);
});

test("the price branch reads the absolute move, so a fall counts too", () => {
  assert.equal(isSignificant(-5, 1), true);
  assert.equal(isSignificant(-4.99, 1), false);
});

test("relative volume alone triggers at 2.5x, on an otherwise flat day", () => {
  assert.equal(isSignificant(0.5, 2.5), true);
  assert.equal(isSignificant(0.5, 2.49), false);
});

test("the combined branch triggers at 3% with 1.5x", () => {
  assert.equal(isSignificant(3, 1.5), true);
  // Either half short of its threshold and the combined branch does not fire.
  assert.equal(isSignificant(2.99, 1.5), false);
  assert.equal(isSignificant(3, 1.49), false);
});

test("an ordinary day is Normal", () => {
  assert.equal(isSignificant(2.9, 1.4), false);
  assert.equal(isSignificant(0, 1), false);
});

test("unknown volume leaves only the price branch able to fire", () => {
  // relativeVolume is null whenever the volume feed failed for a symbol. That
  // must not be read as "zero volume, therefore Normal" for a stock that moved.
  assert.equal(isSignificant(5, null), true);
  assert.equal(isSignificant(3, null), false);
  assert.equal(isSignificant(0.5, null), false);
});

test("score crosses 1 exactly where the verdict flips", () => {
  // Top Movers ranks by this score instead of a second heuristic, so the two
  // must not be able to disagree.
  for (const [pct, rvol] of [
    [5, 1],
    [4.99, 1],
    [0.5, 2.5],
    [3, 1.5],
    [2.99, 1.49],
    [-5, null],
  ] as [number, number | null][]) {
    assert.equal(
      significanceScore(pct, rvol) >= 1,
      isSignificant(pct, rvol),
      `score and verdict disagree at ${pct}%, rvol ${rvol}`,
    );
  }
});

test("score ranks a bigger move above a smaller one", () => {
  assert.ok(significanceScore(8, 1) > significanceScore(6, 1));
  assert.ok(significanceScore(1, 3) > significanceScore(1, 2));
});

test("relative volume is today's volume over the 10-day average", () => {
  assert.equal(relativeVolume(12_580_343, 60_432_270), 12_580_343 / 60_432_270);
  assert.equal(relativeVolume(100, 50), 2);
});

test("a missing figure yields null, never zero", () => {
  // Null means unknown, and it is what stops the volume branches of the rule
  // from firing at all. Returning 0 instead would read as "no shares traded",
  // which is a claim about a quiet day rather than an absent measurement — and
  // the index proxies carry no average volume at all by design.
  for (const [volume, avg] of [
    [null, 60_432_270],
    [12_580_343, null],
    [null, null],
    [0, 60_432_270],
    [12_580_343, 0],
  ] as [number | null, number | null][]) {
    assert.equal(relativeVolume(volume, avg), null);
  }
});
