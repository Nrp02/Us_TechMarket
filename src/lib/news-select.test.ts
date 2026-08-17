import assert from "node:assert/strict";
import { test } from "node:test";

import type { RawArticle } from "./finnhub-news.ts";
import { selectForSummary } from "./news-select.ts";

// selectForSummary decides which fetched articles get a blurb this cycle. It is
// the half of the ingestion cycle that can be checked without a database, and
// it is where the priority bug lived: the cap used to be applied to the fetched
// list in its natural order, which is TOP_20_SYMBOLS order, so the tail of the
// list was starved deterministically rather than occasionally.

let nextId = 1;

function article(publishedAt: string, overrides: Partial<RawArticle> = {}): RawArticle {
  const finnhubId = overrides.finnhubId ?? nextId++;
  return {
    finnhubId,
    headline: `headline ${finnhubId}`,
    snippet: "",
    sourceUrl: `https://example.test/${finnhubId}`,
    imageUrl: null,
    relatedSymbols: [],
    publishedAt: new Date(publishedAt),
    ...overrides,
  };
}

const ids = (rows: RawArticle[]) => rows.map((r) => r.finnhubId);

test("articles that already carry a blurb are never re-summarised", () => {
  const done = article("2026-08-14T14:00:00Z", { finnhubId: 100 });
  const todo = article("2026-08-14T15:00:00Z", { finnhubId: 200 });

  const selected = selectForSummary([done, todo], new Set([100]), 10);

  assert.deepEqual(ids(selected), [200]);
});

test("selection is newest first", () => {
  const oldest = article("2026-08-14T10:00:00Z", { finnhubId: 1 });
  const newest = article("2026-08-14T16:00:00Z", { finnhubId: 2 });
  const middle = article("2026-08-14T13:00:00Z", { finnhubId: 3 });

  const selected = selectForSummary([oldest, newest, middle], new Set(), 10);

  assert.deepEqual(ids(selected), [2, 3, 1]);
});

test("the limit keeps the newest and drops the rest", () => {
  const articles = [
    article("2026-08-14T10:00:00Z", { finnhubId: 1 }),
    article("2026-08-14T11:00:00Z", { finnhubId: 2 }),
    article("2026-08-14T12:00:00Z", { finnhubId: 3 }),
  ];

  const selected = selectForSummary(articles, new Set(), 2);

  assert.deepEqual(ids(selected), [3, 2]);
});

// The regression this whole change exists for. `fetchAllNews` returns
// per-symbol feeds concatenated in TOP_20_SYMBOLS order, so NVDA's articles
// arrive first and CSCO's last. Slicing that order gave NVDA the entire cap on
// a busy day and left CSCO with nothing, every cycle, however recent its news
// was — which is how six stocks came to be told "no news" on a day they all had
// some. Publication time, not feed position, has to decide.
test("a late-list symbol's fresher article outranks an early-list symbol's older one", () => {
  const nvdaOld = article("2026-08-14T09:00:00Z", {
    finnhubId: 1,
    relatedSymbols: ["NVDA"],
  });
  const cscoNew = article("2026-08-14T15:47:00Z", {
    finnhubId: 2,
    relatedSymbols: ["CSCO"],
  });

  // Feed order: NVDA first, exactly as fetchAllNews concatenates it.
  const selected = selectForSummary([nvdaOld, cscoNew], new Set(), 1);

  assert.deepEqual(ids(selected), [2]);
});

test("nothing is selected when every fetched article already has a blurb", () => {
  const articles = [
    article("2026-08-14T10:00:00Z", { finnhubId: 1 }),
    article("2026-08-14T11:00:00Z", { finnhubId: 2 }),
  ];

  assert.deepEqual(selectForSummary(articles, new Set([1, 2]), 10), []);
});
