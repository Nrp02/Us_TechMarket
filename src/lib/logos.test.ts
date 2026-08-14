import assert from "node:assert/strict";
import { test } from "node:test";

import { FINNHUB_LOGO, MARK_SYMBOLS, logoSrc } from "./logos.ts";
import { TOP_20_SYMBOLS } from "./symbols.ts";

// The marks are hotlinked, so a symbol missing from MARKS fails silently at
// render time as an empty plate rather than as an error. These tests move that
// failure to the build, which is the only reason MARK_SYMBOLS is exported.
test("every Top 20 symbol has a mark", () => {
  const missing = TOP_20_SYMBOLS.filter((s) => logoSrc(s) === null);
  assert.deepEqual(missing, []);
});

test("MARKS carries no symbol outside the Top 20", () => {
  const extra = MARK_SYMBOLS.filter((s) => !TOP_20_SYMBOLS.includes(s));
  assert.deepEqual(extra, []);
});

test("an unknown symbol has no mark", () => {
  assert.equal(logoSrc("ZZZZ"), null);
});

// theme/dark is the dark-inked variant, the one that reads on the light plate;
// theme/light is the white knock-out and would be invisible. The naming reads
// backwards, so pin it here rather than trusting the next reader to know.
test("marks are requested in the dark-inked variant", () => {
  for (const symbol of TOP_20_SYMBOLS) {
    assert.match(logoSrc(symbol)!, /\/theme\/dark\//);
  }
  assert.match(FINNHUB_LOGO, /\/theme\/dark\//);
});
