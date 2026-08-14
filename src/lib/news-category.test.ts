import assert from "node:assert/strict";
import { test } from "node:test";

import { categoriseNews } from "./news-category.ts";
import { TOP_20_SYMBOLS } from "./symbols.ts";

const WATCHLIST = ["NVDA", "AAPL", "MSFT"];

test("an article with no tickers is market news", () => {
  assert.equal(categoriseNews([], WATCHLIST), "market");
});

test("a watchlist ticker makes it company news", () => {
  assert.equal(categoriseNews(["NVDA"], WATCHLIST), "company");
});

test("a Top 20 ticker that is not on the watchlist is industry news", () => {
  assert.equal(categoriseNews(["AMD"], WATCHLIST), "industry");
});

test("one watchlist ticker is enough, however many others are attached", () => {
  assert.equal(categoriseNews(["AMD", "INTC", "NVDA"], WATCHLIST), "company");
});

// The property that matters most: the split is a partition, so editing the
// watchlist moves articles between the two tabs and never off the page.
test("company and industry together always cover every tagged stock", () => {
  for (const watchlist of [WATCHLIST, TOP_20_SYMBOLS, ["TSLA"]]) {
    const seen = TOP_20_SYMBOLS.map((s) => categoriseNews([s], watchlist));
    assert.equal(seen.filter((c) => c === "market").length, 0);
    assert.equal(
      seen.filter((c) => c === "company").length +
        seen.filter((c) => c === "industry").length,
      TOP_20_SYMBOLS.length,
    );
  }
});

test("an empty watchlist leaves every tagged article as industry, never lost", () => {
  assert.equal(categoriseNews(["NVDA"], []), "industry");
});
