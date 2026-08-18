# US TechMarket — Build Instructions for Claude Code

> Read this whole file before writing any code. It is the single source of truth — every decision below was already argued through and locked with the project owner. Do not re-litigate a locked decision; if something here seems wrong, flag it, don't silently deviate.

## What you are building

A school demo — an AI daily intelligence app for tracking US Technology stocks. Core question the product answers, per stock, once a day: **"What happened to this stock today?"**

Workflow: Watch → Collect → Filter → Understand → Summarize.

Constraints that shape every decision below: no user accounts, no budget (free tiers only), optimized for "a working, presentable, deployable link to show a professor" — not scale, not robustness.

## Stack

- **Frontend + Backend**: Next.js (App Router), one repo
- **Database**: Supabase (Postgres, free tier)
- **Scheduled jobs**: Supabase Cron (`pg_cron` + `pg_net`) — **not** Vercel Cron; see the reversal note below for why
- **Hosting**: Vercel (free tier)
- **AI**: Gemini API, model **`gemini-3.5-flash`** (Gemini 2.5 Flash is unavailable — see the reversal note below), free tier only — no billing enabled on the Google AI Studio project, ever. See "Free tier verification" under Open Items — don't trust a specific rate-limit number from training data or a blog post; check the live console at build time.

## Division of labor: this file vs. DESIGN.md

**Reversed by the owner.** Visual design used to be assigned to a separate "Claude Design" pass, with this file forbidden from saying anything about how things look. That split is gone: whoever builds the page also owns layout composition, colour, spacing, typography, theme, and hierarchy, and does not wait on an external visual reference.

The division that remains is between two files, and it is worth keeping:

- **This file is the content contract** — what data and functionality must exist on each page, and what was explicitly cut. Every content decision here went through several rounds of scoping with the owner, so if a visual pass adds or drops a *field, section, or feature* on its own, this file wins and the visual is re-derived from the checklist.
- **`DESIGN.md` is the visual contract** — tokens, type ramp, form language, component character, and the named rules. It is generated from the built code by `/impeccable document`, so it describes what exists rather than what was hoped for. `PRODUCT.md` holds durable product truth alongside it.

The content contract does **not** constrain composition. "Five cards", "eight columns exactly" and the like fix what must be *present and legible*; they do not fix the arrangement, the scale, the density, or the visual weight of any of it. A pass that changes how the page is composed while keeping every required field is working as intended.

## Language & Technology Policy

Programming language is NOT locked.

Claude Code may choose TypeScript, Python, SQL, or another appropriate
language when it provides a meaningful technical advantage.

Language selection must be based on:
- compatibility with the existing architecture
- deployment constraints
- free-tier availability
- maintainability
- reliability
- performance
- library/API support
- implementation complexity

Do not introduce a second language unless the benefit is significant enough
to justify the additional runtime, deployment, dependency, and maintenance cost.

The architecture and product requirements are locked; the implementation
language is not.

## Data sources

| Need | Source | Note |
|---|---|---|
| Price, company news, earnings calendar | Finnhub (free tier, 60 calls/min) | Primary source for almost everything |
| **Today's traded volume + intraday bars** | Yahoo Finance `query1.finance.yahoo.com/v8/finance/chart` | **Finnhub's free tier cannot supply this** — see the reversal note below. Scoped to this one gap only; unofficial endpoint, so callers treat failure as "volume unknown", never as an error. |
| Average daily volume | Finnhub `/stock/metric` (`10DayAverageTradingVolume`, reported in millions) | Denominator for relative volume |
| Market index proxies — all five cards | Finnhub `/quote` on ETF symbols: `QQQ` (NASDAQ 100), `SPY` (S&P 500), `DIA` (Dow Jones), `XLK` (Technology), `VIXY` (Volatility) | Confirmed live in Phase 1. Real index symbols (`^VIX`, `^GSPC`, `^IXIC`) return "Market data subscription required for CFD indices". `VIXY` tracks VIX **futures**, not VIX spot — the UI must not imply otherwise. |
| Sector/Peers | Finnhub `/stock/peers` | Used inside Today's Activity, not a standalone page |
| SEC filings | SEC EDGAR Full-Text Search API | Metadata only — type, date, link. Never parse full filing text. |
| AI summarization | Gemini 2.5 Flash (free tier) | Batched — see "AI call budget" below |
| Company + Finnhub logos | Brandfetch Logo CDN (free to 500k req/month) | The one upstream the **browser** calls directly, and the only one that returns images rather than data. Hotlinked, never vendored — the licence caps caching at 30 days. See the logo note under "Decisions that were explicitly reversed". |

No paid tier anywhere. If a free-tier endpoint can't deliver something in this file, stop and flag it rather than substituting a paid one.

---

## Ingestion architecture — locked

**No client-triggered upstream API calls.** This is structural, not a preference, and it applies to every phase:

- Every external API call (Finnhub, Yahoo, Gemini) originates from a **scheduled server-side ingestion job**. Never from a page render, a component, a user interaction, or a page view.
- **Frontend pages read cached Supabase data only** — always through `src/lib/queries.ts`, never through an upstream client.
- **AI summaries are generated once per stock/data cycle and stored.** Never per visitor. Two visitors loading the same page cause zero AI calls between them.

How this is enforced:

| Mechanism | Where |
|---|---|
| Upstream clients isolated | `src/lib/finnhub.ts`, `src/lib/yahoo.ts` — only ever reached via an ingestion job |
| Ingestion behind a shared secret | `src/app/api/refresh/route.ts` checks `CRON_SECRET` and **fails closed** — a missing secret returns 503, never open access |
| Work skipped outside market hours | `isMarketOpen()` in `src/lib/market.ts`, evaluated in `America/New_York` so it survives EST/EDT |
| Schedules provisioned | `scripts/setup-cron.mts` (idempotent, re-runnable; reads secrets from `.env.local`, commits none) |
| Violations caught mechanically | `no-restricted-imports` in `eslint.config.mjs` — importing an upstream client from a page or component fails lint |

**One deliberate exception: company logos.** `src/lib/logos.ts` emits `cdn.brandfetch.io` URLs that the browser loads on every page view. This is outside the rule above rather than a violation of it, and the distinction is what the rule protects: metered quotas. Finnhub allows 60 calls/min and Gemini 20 requests/day, so page traffic reaching either would starve the ingestion jobs and there would be no way to buy more before a demo. Brandfetch's Logo CDN is a free static-asset host with a 500k requests/month allowance, returns images rather than data, and cannot exhaust anything the app depends on. It is also the only delivery method its licence permits — see the logo note under "Decisions that were explicitly reversed". Do not generalise this exception to anything that returns data.

A consequence worth knowing: adding a stock to the watchlist does **not** fetch anything. All 20 candidate symbols are ingested every cycle, so any stock the user can add already has cached data. Phase 4.5 extends the same reasoning to AI summaries — once each visitor keeps their own watchlist, every stock they *could* pick must already be summarised.

## Serving latency — measured from inside the deployed function

The read path was slow for reasons that had nothing to do with the queries themselves, and the two fixes below came from measurement rather than reasoning. Both reverse an earlier decision; don't undo them without re-measuring.

**What the measurement showed.** A query returning **one row** costs the same as one returning **840** — ~155ms either way, timed from inside the Vercel function. The price is per *request*, not per row or per byte, and Next.js itself contributes ~1–4ms (`handlerTotalMs` equalled `dbTotalMs` exactly). So page time was almost precisely *(number of queries that must run in sequence) × (per-request cost)*, and the fix is to attack those two numbers rather than to tune SQL.

This also means **reducing the count of queries that already run in parallel buys nothing.** Three concurrent copies of the same scan measured 0.34s against 0.28s for one. Query *depth* is what costs; query *count* mostly does not.

**Fix 1 — `vercel.json` pins functions to `sin1`.** They defaulted to `iad1` (US East) while the Supabase project sits in Asia, so every round trip crossed the Pacific. Measured per-request cost by region: `iad1` 260ms, `hnd1` (Tokyo) 225ms, **`sin1` (Singapore) 155ms**. Tokyo was tried on the theory that the database was there and was worse, which is what settled Singapore. Nothing else in the repo sets a region, so this file is the whole change.

**Fix 2 — the read helpers in `src/lib/queries.ts` are wrapped in `unstable_cache` at `CACHE_SECONDS` = 60.** Ingestion only writes every 15 minutes, so re-querying on every render was buying freshness that did not exist. `getTickers`, `getNews` and `getActivity` are cached; the watchlist arrives as an *argument* and so becomes part of the cache key, which is what keeps the Company and Industry tabs per-visitor.

Three traps here, all of which were hit:

- **`export const dynamic = "force-dynamic"` silently disables the data cache.** It implies `revalidate = 0`, so `unstable_cache` was a no-op while it was set and the pages re-queried on every render. It has been removed from Home, News and Today's Activity — they still render per request because `readWatchlist()` reads a cookie, and the build output still marks all three `ƒ (Dynamic)`. Check that marking if the setting is ever reinstated.
- **`getSparklines` returns a `Map`, which does not survive the cache** — it serialises to `{}` and every sparkline comes back empty. This is why the wrapper sits on `getTickers` (which returns plain `Ticker[]`) rather than on `getSparklines`. Every other cached shape was checked for `Date` fields for the same reason; all of them are already strings.
- **A stale `next start` on port 3000 will silently serve an old build.** `npm start` fails with `EADDRINUSE` while the previous process keeps answering, and `pkill -f "next start"` does not always match it. Two rounds of measurement were thrown away to this. Use `lsof -ti:3000 | xargs kill -9` and confirm the port is free before trusting any number.

**Result**, server-side median, 13 interleaved samples per cell:

| Route | before | + region | + cache |
|---|---|---|---|
| Home | 1453ms | 547ms | **93ms** |
| Today's Activity | 1252ms | 557ms | **92ms** |
| News | 821ms | 378ms | **94ms** |

`/news` is the honest control: its query code was never touched, so its improvement is entirely region plus caching. All three now sit at the floor of what the function itself costs.

The accepted cost is up to 60s of staleness, which is well inside the 15-minute ingestion cadence — a visitor cannot be shown figures from a different session than the one already on screen. Raise `CACHE_SECONDS` if a demo wants fewer database reads; lower it only with a reason, since the reads it prevents are the entire page cost.

---

## Phase 4.5 — agreed scope change, BUILT except the logos

**Read this before trusting anything below it.** Changes 1–4 below are **in the code and verified**; change 5 (logos) is **not built** and is blocked — see the work order. Where this section contradicts a statement further down this file, this section is the newer decision and wins — the older text is left in place deliberately so the reasoning that produced it is still readable.

Branch at the time of the decision: `phase-4-todays-activity`, last commit `86cb848`, working tree clean.

### What changes, and why

**1. Daily summaries cover all 20 stocks, not the 10 on the watchlist.** 20 ÷ `BATCH_SIZE` 5 = 4 batches = **4 Gemini calls/day** (was 2). This follows directly from change 2: once each visitor has their own watchlist, the server cannot know at generation time which stocks anyone will ask for, so every stock a visitor *could* pick must already have a summary. That is the same principle the ingestion architecture already runs on — all 20 symbols are ingested every cycle so that adding a stock fetches nothing.

- Source of the symbol list moves from the `watchlist` table to `TOP_20_SYMBOLS` in `generateDailySummaries` (`src/lib/daily-summary.ts`).
- The cron schedule does **not** change. `5-55/10 21-22 * * 1-5` gives 12 ticks; 4 are used, 8 remain as retry headroom. *(Superseded: the window is now `5-55/10 22-23 * * 1-5`, still 12 ticks — moved so the last news cycle lands a full hour first. See Phase 5 item 2.)*

**2. The watchlist becomes per-browser, stored in a cookie.** Today it is one global Postgres table, so any visitor editing it edits it for everyone. The owner wants each visitor to keep their own selection.

- **Cookie, not `localStorage`** — this was decided against `localStorage` on purpose. Home and News are server components that need the watchlist *at render time*: a cookie is sent with every request and readable via `cookies()`, `localStorage` is not. With `localStorage` the watchlist table and the News page both have to become client components that fetch all 20 and filter after hydration, which adds a first-paint flash, and the cap can then only be enforced client-side — which is exactly the failure recorded under Resolved items, where the read path and the API counted different lists and let the cap reach 11.
- **Cookies are not shared between visitors** — this came up in planning and is worth recording so it isn't re-asked. A cookie lives in each visitor's own browser, exactly like `localStorage`; the thing that is shared today is the Postgres table. Neither mechanism separates two people using the same browser profile — only accounts would, and accounts are ruled out.
- Sizes: **default 7 stocks, minimum 1, maximum 10.** The minimum is new — `DELETE` must refuse to remove the last symbol. The default was set to 7 rather than 5 so Company News is not too thin on a first visit.
- Cap enforcement **stays server-side**, now over the cookie rather than table rows. `readWatchlist()` re-validates on every read: drop anything outside the Top 20, drop duplicates, clamp to 10, fall back to the default when the cookie is missing or ends up empty — a hand-edited cookie must not be able to break a page.
- Built in `src/lib/watchlist.ts` (cookie read + the min/max/default constants), replacing `getWatchlistSymbols()` in `src/lib/queries.ts`. Three call sites read it: `src/app/page.tsx`, `src/app/todays-activity/page.tsx`, `src/app/todays-activity/[symbol]/page.tsx`.
- **`next/headers` is imported dynamically inside `readWatchlist()`**, not at the top of the file. The `next` package declares no `exports` map, so plain Node cannot resolve its subpaths, and a top-level import makes the whole module — constants and normalisation rules included — unloadable in the test runner. Do not "tidy" it back into a static import without also solving that.
- The `watchlist` table now has no readers. Left in place; drop it in a later migration, not as part of this change.

**3. News categories move from ingest time to query time.** This is forced by change 2 and is easy to miss. `src/lib/news-ingest.ts` currently reads the global watchlist, splits the Top 20 into watched/industry, and **writes `category` into the row permanently**; `getNews` then filters on that stored column. With a per-visitor watchlist that stored value describes nobody. The `news` table already stores `related_symbols`, so the split is derived per request instead:

- `company` → `related_symbols` overlaps the visitor's watchlist
- `industry` → a per-symbol article that does not overlap it
- `market` → the general feed, which carries no tickers and is unaffected

Consequences worth stating: Company + Industry together are always the whole Top 20, so no article disappears when the watchlist changes; a change takes effect immediately without re-ingesting, because all 20 symbols' articles are already stored; and an article tagged with several companies lands in Company as soon as any one of them is on the watchlist. **This does not change how many Finnhub calls ingestion makes** — it already fetches watched + industry = all 20, and now fetches them as one list rather than two labelled passes.

Built in `src/lib/news-category.ts` (`categoriseNews`, with tests) plus migration `0006`; the tab filters run in Postgres so `limit` still counts articles the tab will actually show. **`market` is identified by an empty `related_symbols`, not by the old stored column** — measured across the whole table before relying on it: 19 of 19 general-feed rows carried no tickers and 116 of 116 per-symbol rows carried at least one.

**4. Today's Activity gets watchlist editing in the header dropdown.** The switcher (`src/components/symbol-switcher.tsx`) grows two groups: the watchlist stocks each with a `−` to remove, and the remaining Top 20 stocks each with a `+` to add. `−` is unavailable at 1 stock, `+` at 10, and the 409 the API already returns for a full watchlist must be surfaced in the menu rather than swallowed. Mutations call `router.refresh()` so the server re-renders against the new cookie. Removing the stock currently being viewed is allowed and does not redirect — the page reads `price_cache`, which holds all 20, so it keeps working and the stock simply moves into the "add" group.

**5. Market News thumbnails use the Finnhub logo**, and **all company logos are re-sourced from Brandfetch** (see the logo note under "Decisions that were explicitly reversed").

### The bug this change would have introduced if built naively — fixed

`generateDailySummaries` rebuilt every active stock's timeline **before** reaching the Gemini call, sequentially — `loadDayData` is 2 Supabase queries per symbol inside a `for` loop. At 10 symbols that is 20 queries; at 20 it is 40. The call is only attempted if at least `MIN_CALL_BUDGET_MS` (15s) remains of `JOB_BUDGET_MS` (55s). If the preamble grew past ~40s, **every tick would spend its whole budget on timelines, never place a call, and the day would end with no summaries at all** — failing identically on every retry, so the spare ticks would not save it.

Fixed as designed: the rebuilds run through `mapLimit` (exported from `src/lib/refresh.ts`) at `TIMELINE_CONCURRENCY` 5, and stop entirely once `TIMELINE_DEADLINE_MS` (25s) of the run has elapsed. Two details worth keeping:

- **The current batch is exempt from the deadline and is processed first.** `loadDayData` produces both the timeline *and* the call's input, so dropping it for a batch symbol would silently cost that stock its summary. Only rebuilds nobody is waiting on get abandoned.
- **`preambleMs` and `timelinesSkipped` are in the job's response**, so a slow run can be attributed without guessing.

Measured on the first 20-stock run: **preamble 6,966ms** for all 20 timelines, `timelinesSkipped` empty, leaving ~48s for a call that took 11.8s. The deadline exists for the case where Supabase is slow, not for the normal one.

Rebuilding every stock's timeline on every run is deliberate and was kept — it is free of AI and upstream calls, which is what lets a rule change be rolled out by re-running the job.

### Work order — all six done

1. ✅ Cookie watchlist (change 2 + 3) — Home, News and Today's Activity all render; a hand-edited cookie (junk, duplicates, 15 symbols, empty) normalises correctly on every one.
2. ✅ Dropdown `+`/`−` and the Home picker (change 4) — both boundaries verified in the browser: at 1 stock every `−` is disabled, at 10 every `+` is; the 409 renders in the menu; removing the viewed stock does not redirect.
3. ✅ Timeline preamble fix — see above.
4. ✅ Switch the job to all 20 (change 1) — one run, `stale: []`, all 20 timelines, `geminiCalls: 1`. **Note the original wording of this step was wrong:** one invocation summarises one `BATCH_SIZE` batch, so it reports **1** call, not 4. Four *runs* cover the Top 20; that is what "4 calls/day" means.
5. ✅ Logos (change 5) — all 20 marks plus Finnhub now come from Brandfetch, **hotlinked from its Logo CDN rather than vendored**, because reading the licence forced that change. See the logo note under "Decisions that were explicitly reversed". All 21 marks were confirmed 200 in a browser **against `fallback/404`** — the first pass used `fallback/transparent`, under which a wrong domain also answers 200 with a blank image, so that check had proved nothing. A deliberately bogus domain was included as a control and did 404.
6. ✅ This file updated; `npm test`, `npx tsc --noEmit`, `npm run lint` all clean.

**Quota discipline while testing:** one summary run costs 1 of the 20 daily requests, and a full day's coverage costs 4. Building 1–5 above spent exactly **1** call in total, by verifying the preamble fix and the widening in the same run — the run rebuilds all 20 timelines regardless of batch size, so a separate 10-stock check was unnecessary. Its 5 summary rows were deleted afterwards because the market was still open and they described an unfinished session.

### Findings from this planning session (don't re-derive these)

- **`news.source_url` is not the publisher's URL.** Measured against the live table, 135 rows: company 72/72 and industry 44/44 are `finnhub.io` redirect links; market is 17/19 `news.google.com` and 2/19 `cnbc.com`. Deriving a publisher name from the hostname yields "finnhub.io" and "news.google.com" and is worthless. `src/lib/finnhub-news.ts` also drops Finnhub's `source` field — `FinnhubArticle` never declares it — so the publisher name is not stored anywhere either. This is why per-publisher thumbnails were abandoned rather than built.
- **thesvg has almost no news publishers.** Reuters and Google News exist; Bloomberg, CNBC, Yahoo Finance, MarketWatch and Seeking Alpha do not. Its whole "News" category holds 3 icons — it is a tech-brand library.
- **The current market-news icon is a rising arrow** (`ICONS.market` in `src/components/news-thumbnail.tsx`). On a market-selloff article it asserts a direction the article contradicts, which sits badly beside a product whose AI is forbidden from implying direction. Whatever replaces it should be direction-neutral.
- **The thumbnail plate is 176×80 (2.2:1) and the glyph inside it is a 28px square.** The mark does not read as missing because it is absent; it reads as missing because it occupies about a tenth of the plate.

---

## Execution plan — 5 phases, work in order

Each phase ends on a **gate**: a demo the project owner reviews before you continue. Don't start the next phase until the current gate's criteria are met and the owner has confirmed. If a criterion fails, fix it — don't move on and come back later.

Deadline: **20 days from the day work starts** (Day 1 = whatever day the owner kicks this off), all days count including weekends. Don't anchor to a specific calendar date in this file — track elapsed days from the actual start instead.

| Phase | Days | Gate | Status |
|---|---|---|---|
| 1. Foundation | Day 1–3 | Day 3 | **Done** — gate criteria verified |
| 2. Home page | Day 4–7 | Day 7 | **Done** — gate criteria verified |
| 3. News pipeline | Day 8–12 | Day 12 — **hard cutoff, see Cut Order below** | **Done** — no cuts taken; all 4 tabs shipped |
| 4. Today's Activity | Day 13–16 | Day 16 | **Built.** Batched summaries ratified by the owner. A scope change is agreed but unbuilt — see Phase 4.5 above |
| 5. Automation, polish, deploy | Day 17–20 | Day 20 — final deadline | Scheduler pulled forward — see note. Phase 4.5 lands first |

**Phase 5's scheduler work was pulled forward into Phase 2–3.** The "no client-triggered upstream API calls" rule means there is no compliant way to refresh data without a scheduler, so ingestion scheduling had to exist before the news pipeline, not after it. Phase 5 keeps the news/EOD schedules, visual pass, outage test, and final deploy.

Live URL: **https://ustechmarket.vercel.app** (Vercel deployment protection disabled so it is publicly reachable).

**That URL deploys from `main`, not from the working branch.** Worth stating because it silently misleads: Phase 4 and 4.5 were built and committed on `phase-4-todays-activity` and pushing them left the live site on Phase 3 for the whole time — `/todays-activity/*` returned 404 there while working locally. A branch push produces at most a preview deployment on some other URL. Merge to `main` before treating anything as live, and check a route the branch added rather than just the home page, which returns 200 either way.

### Phase 1 — Foundation (Day 1–3)

1. Scaffold Next.js, create Supabase project, obtain and test a Finnhub API key against one real stock.
   - **Done when**: `npm run dev` runs, and a real JSON price response for one stock has been printed/logged.
2. Design and migrate the DB schema. It must cover: watchlist, price cache, **intraday price snapshots** (see below), news, AI summaries, events.
   - **Done when**: migration runs clean and a `SELECT` succeeds against every table.
3. Build the sidebar shell (Home / News / Today's Activity) and deploy an empty version to Vercel.
   - **Done when**: a public Vercel URL loads and all three nav items route correctly, even with no real data yet.

**Intraday snapshot table — build this now, not later.** It's the backing data for two features that land in later phases (Home page sparklines, Today's Activity timeline). Store a price/volume snapshot roughly every 15–30 minutes during market hours. Design it once here so Phase 2 and Phase 4 both read from it instead of inventing their own storage.

### Phase 2 — Home page (Day 4–7)

This page's content contract — what must be present, not how it looks. Visual design (layout, color, spacing, theme) is owned by Claude Design and consumed as a reference, not specified here — build against this checklist regardless of which design pass you're implementing against:

1. **Market Overview — 5 cards**: NASDAQ, S&P 500, Dow Jones, Technology Sector, VIX. Each card: current level, absolute + % change, a sparkline (reads from the intraday snapshot table), market-open/closed indicator.
2. **My Watchlist table** — 8 columns exactly: `Symbol, Price, Change, Change %, Volume, Rel. Volume, Status, Chart (Day)`. `Status` is the Significant/Normal badge (rule below). `Chart (Day)` is a sparkline. Use **real company logos** (see Logo sourcing below) — this was explicitly reversed from "generic badge only" because it's a demo, not a shipped product.
3. **Top Movers Today** — Top 5, ranked by the same significance scoring rule as the Status badge (below), computed across the **full Top-20 list**, not just the watchlist. Tabs for Top Gainers / Top Losers / Most Active are fine to include if trivial, but not required.
4. **Market News teaser** — 3 articles. Reuse the same ranked list that powers "Top News by Impact" on the News page — do not compute a separate ranking here.
5. **Watchlist picker** (Top 20 → pick up to 10): add/remove, hard cap enforced at 10, block attempts to add an 11th with a clear message. *(Phase 4.5: the store becomes a per-browser cookie, the default becomes 7, and a minimum of 1 is added — removing the last stock must be blocked the same way adding an 11th is.)*

No AI Daily Insight card on this page — cut. Home page has zero AI calls; the only two AI touchpoints in the whole app are the News summarization batches and the per-stock Today's Activity summaries (Phase 3 and Phase 4).

**Significant Movement rule** — the one formula used everywhere (Status badge, Top Movers, Today's Activity badge). Don't reimplement it per page; write it once and import it:

```
IF |price change| ≥ 5%                              → Significant
IF relative volume ≥ 2.5x                            → Significant
IF |price change| ≥ 3% AND relative volume ≥ 1.5x    → Significant
ELSE                                                  → Normal
```

**Logo sourcing** — do not scrape logos from arbitrary web pages (adds a second copyright surface). Use one of: (a) an official investor-relations brand asset page, or (b) a free-to-use icon library such as Simple Icons. Record which source you used, **and record what its licence actually permits** — the source and the delivery method are separate questions, and Phase 4.5 found a source whose licence allowed hotlinking but not the vendoring that had already been designed around it. *(Settled: the source is now Brandfetch's Logo CDN, hotlinked — see "Decisions that were explicitly reversed".)*

**Done when**: Home page shows real Finnhub data for at least 3 stocks, watchlist add/remove works with the 10-cap enforced, and badges are correct against at least 3 hand-picked edge cases (one of each trigger condition). No AI call happens on this page at all — if you find yourself adding one, stop, that's scope creep against a locked decision.

### Phase 3 — News pipeline (Day 8–12) — highest-risk phase, hard cutoff applies

1. Fetch and cache news from Finnhub, dedup so the same article never appears twice in the DB.
2. **Batched AI summarization**: one Gemini 2.5 Flash call per fetch cycle covering all new articles together — never one call per article. The 2–3 line summary shown per article **must be AI-generated paraphrase**, never Finnhub's raw snippet/headline field pasted directly (copyright risk). The prompt must also enforce the AI Safety / Data Integrity Rules below (no invented facts, no causal claims beyond what the source states, no predictions).
3. Build the News page: 4 tabs — `All News` (default) / `Company News` / `Industry News` / `Market News`. No sort dropdown, no list/grid toggle — one fixed "latest first" list view.
4. **Thumbnails are logos, never article photography.** Chain, in order: company logo → ticker lettermark (companies with no freely-licensed mark) → category icon (market news, which belongs to no single company). Finnhub's `image` field is deliberately unused: it supplies an image for nearly every article, but there were only **10 distinct URLs across 90 articles** — 69 sharing one Yahoo Finance placeholder and 13 the Reuters publisher logo — so the page rendered the same two pictures over and over. Dropping remote images also removes the need for an `onError` handler, which is why `news-thumbnail.tsx` is a server component with no client JavaScript.
5. **Related Stock tags**: use the ticker field Finnhub already attaches to each article — don't have the AI infer which stocks an article relates to.
6. No bookmarking feature — there's no auth/user system to attach it to, so it's out of scope entirely, not deferred.

**Cut order if Day 12 arrives and this phase isn't done** — this was pre-agreed specifically so no one has to make this call under deadline pressure. Cut in this order, stop as soon as it's shippable, do not ask the owner again:
1. Drop the "Top News by Impact" ranking panel.
2. Collapse 4 category tabs into 2.
3. Drop any remaining UI filters.
4. **Never cut**: batched AI summarization itself, or the source-link-back to the original article (the copyright mitigation depends on both).

Deadline does not move. Scope does.

**Done when**: fetching once produces zero duplicate articles, a 5-article batch produces exactly one Gemini call (verify in logs, don't assume), category filtering works, and clicking a source link opens the real article.

### Phase 4 — Today's Activity (Day 13–16)

This is a single page per stock at `/todays-activity/[symbol]`, reached only through the sidebar — **no secondary tab bar** (Overview/News/Events/Financials/Charts/Peers/SEC Filings from early mockups were all cut; don't build them).

Layout:
1. **Header**: ticker only (`NVDA`, not "NVIDIA Corporation") which doubles as a button opening a dropdown of the watchlist stocks; selecting one navigates to that stock's route. *(Phase 4.5 adds `+`/`−` controls to this dropdown so the watchlist can be edited without leaving the page.)*
2. **5 stat cards**: Price Movement, Trading Activity (relative volume), Sector Performance, Market Performance, News & Events count. All reuse data already fetched elsewhere — no new fetches.
3. **Significant Movement badge** — same shared rule from Phase 2, same import.
4. **AI Daily Summary** — this is the core of the page and its role just changed: it now covers **everything** that happened to this stock today (price, volume, news, events) in one narrative, so the user never has to piece it together from separate sections. Because of that widened scope, feed it structured data (exact numbers, not prose) and instruct it not to compute or restate numbers on its own — the wider the summary's coverage, the more a small hallucination compounds. There is no separate "Top News" or "Related Stocks" section anymore — that content lives inside this summary now. This is the highest-stakes prompt in the app for the AI Safety / Data Integrity Rules below — the summary describes what happened, not why it definitely happened or what happens next.
5. **Price & Volume intraday chart** — reads from the same intraday snapshot table as everything else.
6. **Today's Timeline** — rebuilt from the stored intraday snapshots and news on **every `intraday-snapshots` tick** (so roughly every 15 minutes during the session), and once more by the end-of-day job. Timeline events (market open, notable news, high-volume alert, price milestone, market close) are computed with simple threshold rules, not AI. **Reversed — this said "reconstructed once, during the end-of-day batch job" and forbade any intraday rebuild; see the reversal note below for why that was wrong and what the boundary actually is.** Every article of the day gets a row: there is no cap, so this agrees with the News & Events stat card above it.
7. **Upcoming Events** — earnings date + earnings call only, from Finnhub's calendar. Do not invent a conference/event calendar (no free API covers it, and hand-entering events isn't "AI-powered" and doesn't scale).

No Confidence Score. It was considered and cut — the natural version of it would be an LLM self-reporting its own confidence, which is a weak signal in practice; the 5-bullet reasoning already in the summary carries that job.

**Done when**: switching stocks via the header dropdown routes correctly for all 10 watchlist stocks, the AI summary for 3 spot-checked stocks matches the underlying raw numbers exactly (read it yourself — don't trust that it's "probably fine"), and the timeline renders from stored snapshots with no live polling involved.

### Phase 5 — Automation, polish, deploy (Day 17–20)

The end-of-day summary schedule was provisioned in Phase 4, not here: `daily-summaries`, `5-55/10 22-23 * * 1-5` → `/api/daily-summary`. It runs a full hour after the 21:00 UTC news cycle (which has to land first so the day's articles exist before they are summarised) and the handler refuses to run while the market is still open, evaluated in `America/New_York`. Each run summarises the next batch of stocks that still lack a summary, so the extra runs are how a timeout or a 503 gets retried.

1. Supabase Cron: news fetch 6x/day, `0 12,15,18,20,21,2 * * *` UTC (the handler has no market-hours gate, so the fixed UTC hours simply shift by one at each DST changeover — the owner is in Thailand/ICT, so local time is never the reference). Plus the end-of-day Today's Activity generation job, timed to run after US market close.
   - Schedules are added to `scripts/setup-cron.mts` alongside the intraday snapshot job, not to `vercel.json`.
   - **DST is handled in code, not in the cron expression**: schedule across a UTC window wide enough to cover both EST and EDT, then let the handler decide using `America/New_York` time. A fixed UTC cron expression silently drifts by an hour twice a year.
   - **Done when**: a manual trigger of each job succeeds; don't wait on a live cron firing to find out it's broken.
   - Verify the real outcome in `net._http_response`, **not** `cron.job_run_details` — `pg_net` is fire-and-forget and reports success as soon as the request is queued, so a job shows green even when the endpoint returned 401 or timed out.
2. EOD job depends on all news for the day being fetched first — sequence the last news cycle to complete before the EOD summary job starts.

   **This requirement was written down here and then not met in practice, for two separate reasons.** Worth recording because the schedule looked correct and the failure was silent. First, `daily-summaries` began at 21:05 UTC, five minutes after the 21:00 UTC news cycle — nominally "after", but no real clearance. Second and much worse, only three of the four news cycles ran before the summary window at all (the 01:00 UTC one ran after every tick), and the cycle cap meant those three could store at most 45 articles against a day that produced ~90. Measured on ET day 2026-08-14: **55% of the day's articles were not yet in the database when the summaries were written**, and six stocks were told "no news" on a day they all had some.

   Now met by both halves: 6 news cycles with five before the window, and the window itself moved to `5-55/10 22-23 * * 1-5` so the last cycle (21:00 UTC) has a full hour of clearance. See "The news pipeline dropped most of the day's articles" below for the storage half of the fix, which is the part that actually mattered.
3. Implement whatever visual design Claude Design has produced by this point; responsive check across the three pages. **Done for laptop and iPad — the target the owner named. Phone is deliberately out of scope.**

   **The whole page was 1,221px wide regardless of viewport, and one missing class was the cause.** `<main>` in `src/app/layout.tsx` is a flex item, which defaults to `min-width: auto`, so it could not shrink below its content's min-content width — the 880px watchlist table plus padding, plus the 240px sidebar. The two `overflow-x-auto` wrappers that already existed (`watchlist-table.tsx:46`, `intraday-chart.tsx:73`) were therefore dead code: instead of scrolling inside themselves, they pushed the page sideways. Adding `min-w-0` to `<main>` is the entire fix, and it makes those wrappers behave as designed — measured at 1100px, the table wrapper is 778px wide holding an 880px table and scrolls internally.

   **The symptom this produced was iPad-only, which is why it went unnoticed.** A laptop viewport exceeds 1,221px so the page always fitted; every iPad is narrower, so Safari laid the page out wider than the screen and it had to be zoomed out before it was usable. Measured before (simulated by forcing `min-width: auto` back on) and after:

   | width | before | after |
   |---|---|---|
   | 768 (iPad portrait) | 1189 — overflows | 768 — fits |
   | 834 (iPad Air / Pro 11") | 1189 — overflows | 834 — fits |
   | 1024 (iPad landscape) | 1221 — overflows | 1024 — fits |

   The 768/834 figure is 1189 rather than 1221 because the `lg:` breakpoint at 1024px has not engaged, so the Top Movers / News teaser grid is still one column. All three pages are clean at every width above.

   Two things ruled out by measurement, so don't re-investigate them: **the viewport meta tag is present and correct** (`width=device-width, initial-scale=1`, injected by Next) — it was the obvious suspect and it was innocent; and **the sidebar needs no breakpoint for iPad** — `w-60 shrink-0` costs 240 of 768, which is tight but not the cause of anything.

   **At 390px (phone) all three pages still overflow**, because content inside `main` has its own minimums below which nothing can shrink. Left unfixed on purpose: the owner demos on a laptop and wants iPad to work, and fixing phone means giving the sidebar a collapse behaviour, which is a visual-design decision rather than a bug fix. Note this contradicts the "opens the live URL on a phone" wording in **Done when** below — the owner narrowed that target.

   **Testing note: `resize_window` does not work in this environment** — it reports success while `innerWidth` stays put and `outerWidth` reads 0. Every width above was measured by injecting a same-origin `<iframe>` of the target size into a page already on `localhost:3000` and reading `contentDocument.documentElement.scrollWidth` — media queries evaluate against the iframe's own viewport, so this is a real responsive test rather than a simulated one.
4. End-to-end test: simulate a Finnhub outage/rate-limit and confirm the app shows a fallback/error state instead of crashing. **Done** — run against a local production build, results below.

   **A Finnhub outage cannot reach a page at all, and that is the point of the ingestion rule.** Simulated by starting `next start` with `FINNHUB_API_KEY` overridden to a bogus value, so every `/quote` answers 401 — the same `!res.ok` throw that a 429 or a 500 takes, so one probe covers rate-limit and outage alike. `POST /api/refresh?force=1` returned **HTTP 200** with `symbols: 25, prices: 0, snapshots: 0, failed: [all 25]`. The important half is what did *not* happen: `price_cache` still held 25 rows with an unchanged newest `updated_at`, and `intraday_snapshots` still held 1,346 rows. A total upstream failure writes nothing rather than overwriting good data with nulls, and the job reports which symbols failed instead of throwing. Home, News (All + Company) and `/todays-activity/NVDA` all returned 200 with the real cached prices still rendered.

   Two consequences worth stating. A failed refresh is **safe to run locally** despite sharing the production database, because nothing is written. And a *partial* outage is the same path — the surviving symbols upsert normally and only the failures land in `failed`, since the try/catch in `refreshMarketData` is per symbol.

   **`src/app/error.tsx` is the fallback for a render that throws**, and it catches less than it appears to — both halves measured, not assumed:

   - **An upstream outage never reaches it.** Pages read cached tables only, and a Supabase query error surfaces as `{ data: null }` rather than a throw, so the components' own empty states handle it.
   - **A throw during module evaluation never reaches it either.** Starting the server with `SUPABASE_SECRET_KEY` blank makes `createClient` throw on import of `src/lib/supabase.ts`, before the React tree exists: all three routes returned a bare `Internal Server Error` text body, no boundary, no sidebar. **This is a known uncovered case.** Making it catchable means constructing the client lazily, which touches every `db.from(...)` call site — not worth it for a misconfiguration that breaks the whole site anyway, but do not claim the boundary covers it.
   - **What it does catch is a render-time throw**, whose reachable cause is a malformed timestamp: `Intl.DateTimeFormat` rejects an Invalid Date, so every helper in `src/lib/format.ts` taking an ISO string can raise a `RangeError` on a row in the wrong shape. Verified by temporarily throwing a `RangeError` in `src/app/page.tsx` (reverted): Home served 500 rendering the boundary **inside the layout** — sidebar intact, clicking News from it navigated normally — with the digest shown and the error message not leaked. `/news` and `/todays-activity/NVDA` were unaffected, so the failure is scoped to the route that threw.

   **The boundary renders on the client after hydration**, so `curl` proves nothing: the SSR shell is `<html id="__next_error__">` with the body `Internal Server Error`. Two rounds of checking were spent before this was noticed — verify it in a real browser.

   - ✅ **The logos load from the deployed origin.** Checked on `ustechmarket.vercel.app` after the merge to `main`: all 15 CDN requests a page makes returned 200, so the client id is **not** origin-restricted. Because the URLs carry `fallback/404`, a 200 means the mark is genuinely present rather than a blank placeholder. Re-check if the client id is ever rotated or a custom domain is added.
   - The failure mode remains worth knowing even though it did not occur: an unreachable CDN renders **every** mark — watchlist, Top Movers, the Today's Activity header, every news thumbnail — as an empty plate, and does so silently, because `alt=""` suppresses even the broken-image glyph (measured). There is no in-app fallback; catching it would need an `onError` handler and so a client component, which reverses the server-component design in `news-thumbnail.tsx`.
5. Final deploy + a short README aimed at the professor.

**Done when**: someone with zero context opens the live URL on a phone and understands what the product does within 30 seconds.

---

## AI call budget (keep this accurate — it's what keeps this inside free-tier limits)

**The free tier's real limit is 20 requests per DAY, per model.** Measured in Phase 4, read off a live 429: `quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier`, `quotaValue: 20`, for `gemini-3.5-flash`. Not per minute — the same key stayed refused for over 15 minutes. This closes the "Gemini free-tier rate limits" open item; the number came from the API itself, not the console and not the docs.

- News summarization: **exactly 6 cycles/day × 1 call each = 6 calls/day.** The `news-ingest` schedule is `0 12,15,18,20,21,2 * * *` UTC — 08:00 / 11:00 / 14:00 / 16:00 / 17:00 / 22:00 ET under EDT, one hour earlier under EST. One call per cycle regardless of article count; articles past the batch cap keep their next-cycle slot rather than adding a call. Five of the six land before the summary window, which is the point — see the sequencing note in Phase 5.
- Today's Activity summaries: **1 call per batch of 5 stocks.** All 20 stocks = **4 calls/day**, across 4 of the schedule's 12 ticks — one invocation places one call. (It was originally 1 call per stock, i.e. 10/day, and the daily cap made that untenable — see the reversal note below.)
- Home page: **zero** AI calls (Daily Insight card was cut)

Total: **10 calls/day against a ceiling of 20** (6 news cycles + 4 summary batches), and that is now a hard worst case rather than a nominal one: both jobs pass `retries: 0`, so a 429 or a 503 costs the cycle rather than silently spending two more requests. Never add a call that fires per-article or per-UI-interaction — every AI call in this product is batched and runs once, after market close, except the intraday news cycles, which are still batched (one call per cycle, not per article).

Budget headroom is not a nicety here. Every failed attempt still spends a request, and so does every manual trigger while testing. At the old 14–16/day the app was one debugging session away from a demo with no summaries in it, with no way to buy more before the next midnight Pacific reset.

### Two Gemini keys: one for testing, one for the deployed site

There are **two separate Gemini API keys, from two different Google AI Studio projects** (the second was registered under a different email). This matters because the quota is `GenerateRequestsPerDayPerProjectPerModel` — **per project**, not per key. Two keys from the *same* project would share one 20/day bucket and the separation would be an illusion; two keys from different projects genuinely get 20/day each.

That the projects really are separate is **measured, not assumed**: the deploy key was exhausted and returning 429 when the test key succeeded on the very next request, in the same minute.

| Key | Where it lives | Used by |
|---|---|---|
| **Deploy** | Vercel env vars, **and `.env.local` by default** | The live site, every Supabase Cron job, and anything run from a laptop unless the key is swapped first |
| **Test** | Nowhere by default — swapped into `.env.local` when needed | Manual job triggers and heavy local testing |

**`.env.local` holds the deploy key as its resting state**, so a laptop and the live site share one 20/day bucket unless someone changes that deliberately. This is a known cost, not an oversight: it keeps local behaviour identical to production, which is what you want when reproducing a bug. The cost is real, though — it is exactly how the quota was exhausted once, and the scheduled jobs then failed with 429 for the rest of the day through no fault of their own, because the laptop had already spent production's allowance.

**So swap the test key in before triggering a job by hand or testing anything that calls Gemini repeatedly**, and swap it back afterwards. A single manual `/api/daily-summary` run costs 1 of the day's 20; a full day's coverage costs 4.

`src/lib/gemini.ts` reads one unlabelled `GEMINI_API_KEY` and knows nothing about environments — the split is entirely a config convention, and it holds only because `.env.local` is gitignored and never deployed. **`.env.local` carries a comment naming which key is currently in it**; that comment is the only way to tell the two apart from the file, so update it whenever the key is swapped. Never write either key into a tracked file, this one included.

One thing that looks like a mismatch and is not: `vercel env pull` cannot read these values back, because every variable on this project is marked **Sensitive**. It writes a short placeholder instead — 12 characters against a real key's ~52 — so comparing a pulled file against `.env.local` proves nothing. Check with `vercel env ls production` that a name is *set*; there is no supported way to read what it is set to.

**Testing locally is not isolated from production, and the keys do not change that.** Local and deployed both point at the *same* Supabase project, so a manually triggered job on a laptop writes real rows to the production database. Observed directly: during one local test run, `daily-summary` reported `alreadyDone: 15` when only 10 had been generated locally — the other 5 came from the Vercel cron writing to the same tables at the same time. Consequences to keep in mind:

- A local "test" run of `/api/daily-summary` or `/api/ingest-news` produces **production data**, not throwaway data.
- Because those jobs skip work that is already done, a local run also *consumes* work the scheduled job would otherwise have performed — the two interfere rather than running independently.
- Separate test and production Supabase projects would fix this properly. Rejected for this build: it means maintaining a second project and re-running every migration, which is real work for a $0 school demo. The mitigation is this note plus running local jobs deliberately, not casually.

## AI Safety / Data Integrity Rules

This is the single source of truth for what the AI is and isn't allowed to say. Every prompt written in Phase 3 (news summarization) and Phase 4 (Today's Activity summary) must enforce this — don't restate a looser version of these rules in either phase, point back here instead.

The product answers **"what happened"** — never "why did it definitely happen" and never "what happens next." That distinction is the whole boundary below.

The AI must never:
- invent news
- invent events
- invent timestamps
- invent numerical values
- calculate new numerical values (all numbers come from structured input, pre-computed — the model states them, it doesn't derive them)
- claim a causal relationship between news and price movement unless that relationship is explicitly stated in the source material — correlation in the data (e.g. "stock moved" + "news happened same day") is not itself grounds for the model to assert one caused the other
- predict future stock prices or trends
- offer investment recommendations or advice of any kind (buy/sell/hold framing, "looks like a good entry point," etc.)

The AI may only summarize information present in the structured input it's given for that call. If the available evidence doesn't clearly explain a move, the summary must say so explicitly rather than reaching for a plausible-sounding cause — use a fixed fallback line, e.g. *"The available information does not establish a clear explanation for this movement."* A prompt that leaves the model free to fill that gap with a guess is a bug in the prompt, not an acceptable edge case.

This directly extends Risk #2 in the register above (AI hallucinates numbers) — that risk covers numbers, this section covers claims, causality, and predictions. Both get caught the same way: structured input in, spot-checked output at the gate.

## Risk register

| # | Risk | Mitigation | Owner |
|---|---|---|---|
| 1 | News pipeline overruns Day 12 | Pre-agreed cut order above; deadline doesn't move | Project owner decides only if the cut order itself is somehow insufficient |
| 2 | AI hallucinates numbers, invents facts, or overreaches into causation/prediction/advice | Full rules in "AI Safety / Data Integrity Rules" below — structured input only, no invented values, no unsupported causal claims, no predictions or recommendations | Claude Code writes the prompt; owner spot-checks at the Phase 4 gate |
| 3 | Finnhub rate limit hit during a 10-stock batch | Queue/delay between calls, designed in from Day 8, not patched in afterward. Already in place: `mapLimit` in `src/lib/refresh.ts` caps concurrency at 5, and pages make zero upstream calls so traffic cannot affect the limit | Claude Code |
| 4 | Gate review stalls the critical path (this is a solo-reviewer project — no parallel work possible) | Owner blocks calendar time in advance for each gate date above | Project owner |
| 5 | A scheduled ingestion job fails silently — `pg_net` is fire-and-forget, so `cron.job_run_details` shows success even when the endpoint returned 401 or timed out | Treat `net._http_response` as the source of truth when checking any scheduled job. A green cron row proves only that the request was queued | Claude Code |
| 6 | Public ingestion endpoint used to burn upstream rate limits | `CRON_SECRET` guard that **fails closed** (503 when unset). Rotating it means updating `.env.local`, `vercel env add`, then re-running `npm run setup-cron` — two places, easy to half-do | Claude Code |

## Decisions that were explicitly reversed mid-planning — don't revert to the original

These look like they contradict earlier reasoning in this doc. They're not mistakes — they were revisited on purpose after seeing mockups. Trust the version below.

- Market Overview: **5 cards** (not the originally-scoped 3 — Dow Jones and VIX are back in).
- Company logos: **real logos**, not generic badges — accepted for this demo specifically because it won't see commercial deployment.
- Sparklines: **included**, on both Home cards and watchlist rows — the earlier "skip sparklines to save time" call was reversed once the intraday snapshot table made them cheap.
- Today's Activity page: **no secondary tab bar at all** — earlier mockups showed 8 tabs (Overview/News/Events/Financials/Charts/Peers/SEC Filings); all removed in favor of the sidebar + one dense AI summary.

- **Today's Timeline is rebuilt every 15 minutes during the session, not once at the close.** Phase 4 forbade this outright ("Do not build any real-time listener or intraday cron for this — it would contradict the 'AI runs only after market close' principle"). The owner reversed it: the page should be useful whenever it is opened, and under the old rule the entire trading day showed an empty timeline reading "the timeline is built after the close".

  **The Phase 4 rule conflated two different things, which is why it looked load-bearing and was not.** What must stay after the close is the **AI call** — the Daily Summary narrative — and that is untouched: `daily-summaries` still runs post-close only, and `daily-summary-card.tsx` still says so. The timeline contains no AI at all. It is `buildTimeline` in `src/lib/timeline.ts`, a pure function over stored rows, so rebuilding it more often cannot cost a Gemini request, cannot cost an upstream request, and cannot change what it computes from the same input.

  **It also needs no new schedule, which is the other half of the objection.** `rebuildTimelines` (`src/lib/timeline-rebuild.ts`) is called from `/api/refresh`, inside the market-hours gate that already exists there, so it rides the `intraday-snapshots` cadence rather than adding a cron. "Real-time listener" was never the shape of it.

  **Nothing needed incremental-update logic.** `buildTimeline` recomputes the whole day from scratch on every call, so a partial session simply yields a partial timeline — the open is the first snapshot, the high and low are the extremes *so far*, and `market_close` appears only once a snapshot actually lands at or after the bell (already enforced by `isAtOrAfterClose`, and already covered by a regression test written when a forced mid-session run labelled 13:15 "Market close"). A later rebuild supersedes the earlier rows with the same rules over more data.

  The EOD job still rebuilds too, and that is deliberate rather than redundant: it already loads the same day data for its prompt, so the rebuild costs one pure loop, and it is the backstop for a day whose refresh ticks failed.

- **Today's Timeline shows every article of the day; the 3-row cap is gone.** `MAX_NEWS_ROWS = 3` in `timeline.ts` kept only the most recent three, which put the timeline in direct contradiction with the News & Events stat card immediately above it — the card counts the day's articles and has never been capped, so MSFT displayed "7 articles" over a timeline listing 3. The News page lists a symbol's whole day as well; the timeline was the only surface trimming. Verified against ET day 2026-08-14 after the change: MSFT 7 news → 7 rows, NVDA 12 → 12, CSCO 4 → 4.

The three below were forced by what the free tiers actually do, discovered by probing the live APIs during Phase 1–2. They are not preferences and re-litigating them means re-hitting the same wall.

- **Scheduler: Supabase Cron, not Vercel Cron.** Vercel Hobby permits a cron job to run **at most once per day**, and a more frequent expression *fails at deploy time* — verified against Vercel's own docs. That cannot deliver 15-minute snapshots or a 4x/day news fetch. `pg_cron` 1.6.4 and `pg_net` 0.20.4 are available on the Supabase project and `supabase_vault` 0.3.1 is already installed, so the schedule lives in Postgres. Upgrading Vercel to Pro would fix it for $20/mo and is ruled out by the $0 constraint.
- **Volume comes from Yahoo Finance, not Finnhub.** Probed at build time: `/quote` returns no volume field at all, and `/stock/candle` returns `"You don't have access to this resource"` on free tier for both daily and intraday. Without a second source the app loses the `Volume` and `Rel. Volume` columns, two of the three Significant Movement branches, and every sparkline. Yahoo's chart endpoint supplies today's cumulative volume *and* the full session's 15-minute bars, which also solves the sparkline cold-start problem. Finnhub remains the source for price and average volume.
- **Model: `gemini-3.5-flash`, not Gemini 2.5 Flash.** `gemini-2.5-flash` still appears in the model list but `generateContent` returns 404 *"no longer available to new users"*; `gemini-2.5-flash-lite` is gone the same way. Pinned rather than the `gemini-flash-latest` alias, so the summarisation prompt cannot shift under a graded demo. **Reasoning is capped at `thinkingBudget: 2048`** — unbounded reasoning made latency wildly variable (a 13-article batch once took *longer* than a 40-article one, blowing past the 60s function limit), and capping it cut a cycle from ~50s to ~13s and token use from ~20k to ~2.8k. It is not set to 0: some reasoning measurably improves adherence to the safety rules.
- **Today's Activity summaries are batched: one Gemini call per 5 stocks, not one per stock.** **Ratified by the owner.** This contradicts the AI call budget as originally written ("1 call per watchlist stock/day ≈ up to 10 calls/day"), but the alternative was worse. Phase 4.5 keeps the batch size at 5 and widens coverage to all 20 stocks — 4 calls/day. The free tier allows 20 requests/day for this model (measured — see the AI call budget above), so one call per stock spent half the day's entire quota on one job, leaving nothing for a re-run, a failure, or a manual trigger before a demo. Batched, the whole watchlist costs 2 calls and the app runs at ~6–8/day. Batch size is capped at 5 rather than 10 for the reason the news pipeline already found: an oversized batch truncates the model's JSON mid-string and loses every entry in it. Per-stock summary quality was checked against the batched output and did not visibly suffer.
- **The Today's Activity narrative is generated in three parts and joined, not written as one block.** `movement` (price/volume, no news), `recap` (news, no price), `explanation` (the only field allowed to link them). This exists purely to make the no-causal-claims rule hold. Asked for a single narrative, the model reliably asserted causation the sources never claimed — *"Apple's stock price increased **as** Norway's sovereign wealth fund disclosed a position"* — and listing banned wordings did not stop it, because "does the source state this link" is a judgement it makes generously. Split, the fixed fallback line went from rarely used to used on 7 of 10 stocks, with the other 3 attributed to reports that genuinely made the claim. Do not merge these fields back into one prompt.
- **News categories are drawn from per-symbol tagging, not from Finnhub's news categories.** *(Phase 4.5 keeps these three definitions but computes company-vs-industry per request from `related_symbols` instead of writing it into the row — a per-visitor watchlist makes a stored value meaningless.)* `/news?category=technology` and `/news?category=general` return byte-identical articles (100 of 100 ids overlap), carry no tickers, and are general world/business news. So `company` = watchlist symbols, `industry` = the other Top 20 tech companies, `market` = the general feed. Calling that general feed "Technology Industry News" would simply be false.
- **Company news is relevance-filtered before storage.** Finnhub attaches a queried symbol to articles that are not about that company at all — measured at 55% of results, e.g. a Yeti story and a Pan American Silver story both tagged `NVDA`. An article is only stored under a symbol when its headline or snippet actually references that company (`mentionsSymbol` in `src/lib/symbols.ts`). This is plain string matching, **not** AI inference, so the "tickers come from Finnhub's field, never inferred by a model" rule still holds. Mis-tagging fell from 55% to ~13%.
- **Company logos: two icon libraries covering 17 of 20, lettermark plate for the remaining 3.** Simple Icons no longer ships marks for Microsoft, Amazon, Oracle, Salesforce, Adobe, Texas Instruments, Micron, or ServiceNow, so it alone covered only 12. The marks are now **vendored locally as static SVG under `public/logos/`** — no runtime npm dependency — from two free-to-use icon libraries, recorded per the logo-sourcing rule:
  - **Simple Icons** (CC0-1.0), monochrome: AAPL, AMD, AVGO, CSCO, INTC, INTU, NVDA, PLTR, QCOM, TSLA.
  - **thesvg** (`github.com/glincker/thesvg`), full colour, filling Simple Icons' gaps: ADBE, AMZN, CRM, GOOGL, META, MSFT, MU.
  - **Lettermark plate**: TXN and NOW (no freely-licensed mark) and ORCL (wordmark-only, ~7.7:1, unreadable at badge size).

  This does not reverse the "real logos" decision — the lettermark is still the fallback where no freely-licensed mark exists. Finnhub's `/stock/profile2` returns a logo URL covering all 20 and is an available upgrade, but it is neither source this file named, so it needs an explicit owner call.

  **Superseded in Phase 4.5 — all marks are re-sourced from Brandfetch, and hotlinked rather than vendored.** Simple Icons and thesvg are no longer the source, the vendored `public/logos/*.svg` are deleted, and the thesvg MCP server can now be dropped — Brandfetch coverage is confirmed at 20/20 plus Finnhub.

  **The "vendor the files, do not fetch at runtime" instruction this section used to carry was wrong, and reading the licence is what reversed it.** Brandfetch's terms grant a licence to download, store and cache Content for **at most thirty days** from retrieval, and explicitly do **not** extend to the original logos themselves, which stay third-party IP with no right to reproduce or redistribute. Committing the marks into a public repo would outlive that window, so vendoring was the one delivery method the licence did not allow. Hotlinking is the path Brandfetch designs for: the Logo API is free to 500k requests/month, needs no attribution, and its own fair-use guide names both "educational" projects and "a stock trading app featuring company logos to identify brands" as acceptable use.

  Four things about the implementation that are easy to get wrong:

  - **`theme/dark` is the dark-inked variant, and it is the one to use.** The naming reads backwards: `theme/light` returns the white knock-out mark where it exists at all, which is invisible on the light plate the components draw. Verified in a browser — guessing here makes every logo disappear.
  - **These URLs cannot be verified with curl.** Brandfetch blocks script and server-side fetches of CDN links that carry only the public client id, returning an identical 383KB HTML page with status 200 for every domain, present or not. A shell check therefore "passes" for marks that do not exist. Check in a real browser.
  - **Prefer `symbol`, fall back to `logo`.** Twelve brands have a square standalone `symbol`; the other eight have only the wordmark lockup. `icon` is deliberately unused — it is an opaque JPEG tile for 13 of 21 brands and would sit inconsistently beside the transparent vectors.
  - **`max-w-full` caps a wordmark's width, which sets its drawn height** — the wider the lockup, the smaller it renders. It does not "make the plate wide enough", which is what this file claimed until the measurement was actually taken. In the 80×32 watchlist badge: square symbols draw the full 16px, then micron 15.4px, intuit 14.5px, Qualcomm 13.2px, and **servicenow 10.5px**, which is the weakest badge in the set. The badge padding is `px-1` rather than `px-2` for this reason — the 8px is worth ~1px of height on those four and costs the square marks nothing. Revisit servicenow first if legibility is raised at the gate; `icon` is not an improvement for it (a navy tile with unreadable text) and the lettermark loses the brand entirely.
  - **GOOGL points at `google.com`, not the ticker's own `abc.xyz`**, which resolves to the "Alphabet" wordmark instead of the Google G.

  The workarounds this replaces are all deleted, since coverage reached 20/20: the `HAS_LOGO` set, the TXN/NOW/ORCL lettermark path, and `OPTICAL_NUDGE` (Amazon's `symbol` is a centred square, so the nudge that corrected the old wordmark artwork is no longer needed). `src/lib/logos.test.ts` asserts every `TOP_20` symbol has a mark, so adding a stock without one fails the build instead of rendering a blank badge.

  The client id in `src/lib/logos.ts` is the **public Logo CDN id**, which appears in page source on every render and is meant to be embedded — it is not the private API token. That token lives in `.mcp.json`, which **is gitignored**: do not commit it, and do not move it into any tracked file.

- **Market News thumbnails use the Finnhub logo.** Market news has no company to represent, and per-publisher marks were investigated and ruled out on evidence (see the findings in Phase 4.5). The logo names the data provider, not the publisher — which is honest, if slightly loose, given that company and industry news come from Finnhub too. It replaces a rising-arrow glyph that implied a direction the article might contradict.

## Resolved items (settled during Phase 1–2 — don't re-open)

- **Intraday snapshot cadence: 15 minutes.** Documented in the schema comment in `0001_init.sql`. Snapshots snap to the 15-minute grid — the upstream feed appends a live partial bar stamped with the current time, so without snapping, every refresh leaves an extra off-grid point behind.
- **Index symbols: `QQQ` / `SPY` / `DIA` / `XLK` / `VIXY`.** Confirmed live; see the Data sources table.
- **The "Top 20" is a fixed list**, not a live ranking — no free-tier endpoint ranks US tech by market cap. Defined in `src/lib/symbols.ts`.
- **The watchlist bounds are enforced server-side** in `src/app/api/watchlist/route.ts`, over the cookie, and `readWatchlist()` in `src/lib/watchlist.ts` re-validates on every read so the two can never disagree. An earlier read-path fallback to a hardcoded default list let the cap be pushed to 11, because the API counted table rows while the page counted the fallback — which is why normalisation lives in one function that both paths call. Max 10, min 1, default 7; `normaliseWatchlist` drops unknown symbols and duplicates, clamps, and falls back to the default rather than ever returning empty (covered by `src/lib/watchlist.test.ts`).

- **Data retention: 7 days, enforced by real deletion, not just query filtering.** The free tier has no automatic storage cap and nothing was pruning `news`, `intraday_snapshots`, `timeline_events`, or `daily_summaries`, so all four grew forever. `supabase/migrations/0007_data_retention.sql` adds a `prune_old_data()` function and schedules it directly as a `pg_cron` SQL job (`data-retention-cleanup`, `0 4 * * *`) — pure SQL, not routed through a Next.js API route like the other 3 jobs, because it needs no upstream secret or deployment URL. `news_summaries` needs no separate DELETE — it cascades from `news`.

  **`daily_summaries` is pruned too, deliberately not "just today."** Every read of it (`getActivityUncached` in `src/lib/queries.ts`) fetches only the single most recent trading day per symbol, never a range, and there's no UI to browse a past day's summary — so old rows are dead weight, same as the other three. It's kept to the same 7-day window rather than 1 day because the page's "latest session" over a weekend is still Friday's row; a 1-day cutoff would delete the row a visitor is currently being shown.

  **`price_cache` and `events` are deliberately excluded — this was checked, not assumed.** `price_cache` is a fixed ~25-row cache, one row per symbol, always upserted, never inserted — it never grows, so pruning it saves zero storage while actively breaking pages (Home rows vanish, `/todays-activity/[symbol]` 404s) until the next `/api/refresh` tick repopulates it. `events` (earnings calendar) has low, bounded volume and isn't a growth problem.

  **Physical deletion alone doesn't guarantee the News page never shows anything older than 7 days** — the cleanup job runs once a day, so it can lag by up to ~24h. The actual display-facing guarantee is a query-level floor: `getNewsUncached` and `getNewsAvailableDatesUncached` in `src/lib/queries.ts` both filter to `retentionCutoffDay()` unconditionally, independent of when cleanup last ran. Same two-layer pattern as the watchlist cap (API-side enforcement + read-path re-validation). `RECENT_DATES_SHOWN` in `src/app/news/page.tsx` is `6` (Today + 6 = 7) to match.

  **That floor is a whole ET day, not a rolling `now - 7d` instant** — it was written as an instant first, and that is subtly wrong. Every other date rule in `queries.ts` works in whole trading days, and a sliding instant admits a *partial* oldest day whose article count shrinks on every reload. Measured on 2026-08-18: the table held one lone article on ET day 2026-08-11, exactly the sliver an instant-floor would have offered in the picker as if it were a full day. `retentionCutoffDay()` narrows coarsely in SQL via `dayWindow(cutoff).from` and then compares ET days exactly in JS — the same coarse-then-exact pair the `day` filter already used, needed because `dayWindow`'s lower bound is midnight UTC and so runs a few hours ahead of the ET day actually starting.

  **The job is guarded so it can never empty a table** (`0008_retention_keep_last.sql`). 0007 deleted on absolute age alone, which is correct while the app runs and dangerous when it does not: Supabase pauses a free-tier project after ~7 days of inactivity, cron stops with it, and on resume the next run would find *every* row older than 7 days and delete the lot — blank sparklines, `getLatestSessionDay()` null, empty News until the next ingest cycle, no AI summary until the next post-close run. For a demo whose whole point is a working link to show a professor, that is the one failure that matters. Each DELETE now carries an `AND EXISTS (… WHERE <ts> >= now() - interval '7 days')` guard, so the job trims history but always leaves the last surviving data. Postgres evaluates the EXISTS against the statement snapshot, so the guard reads the pre-delete state rather than chasing its own deletions.

  **Verified positively, because "0 rows deleted" proves nothing.** The first pass ran `prune_old_data()`, saw identical row counts, and called it a pass — but that result is equally consistent with the DELETEs silently matching nothing, which is a live risk since all four tables have RLS enabled with no policies. Settled by reading the catalog: all four are owned by `postgres`, `data-retention-cleanup` runs as `postgres`, so it bypasses RLS as table owner. Then proven by a rollback-guarded test — a synthetic 30-day-old row went 1 → 0 — and both directions were checked across all four tables inside transactions: aged rows are trimmed exactly, and when *every* row is aged out nothing is deleted. Re-run that pair rather than a bare row count if this is ever touched again.

- **The News date picker is a client component, not a native `<details>` disclosure.** It used to be the one dropdown in the app that didn't close on an outside click, because native `<details>` has no such behaviour — every other dropdown (`symbol-switcher.tsx`, `add-stock-menu.tsx`, `watchlist-picker.tsx`) is a client component with an explicit `mousedown` listener. `src/components/news-date-picker.tsx` is a small client island embedded in the still-server `news/page.tsx` (the same pattern those three already use), with its own minimal outside-click/Escape handling — not a reuse of `use-watchlist-menu.ts`, since that hook also carries watchlist-mutation calls and a multi-row ARIA keyboard model that a flat list of date links doesn't need.

- **Gemini API key works.** The `AQ.`-prefixed key authenticates fine against `generativelanguage.googleapis.com`; the unusual prefix was not a problem.
- **One batched Gemini call per cycle is enforced by a batch cap, not by splitting the call.** `MAX_PER_CYCLE = 25` in `src/lib/news-ingest.ts`. An oversized batch truncates the model's JSON mid-string and loses every summary in it, so surplus articles wait for the next cycle rather than triggering a second call.

  **This cap bounds summarisation only — never storage.** It used to bound both, and that was the bug described under "The news pipeline dropped most of the day's articles" below: the cap was applied *before* the upsert, so anything past the 15th was never stored at all. Storage is unbounded now, the cap is 25, and the failure mode is recoverable — a truncated or failed call leaves the articles stored with no blurb, and `selectForSummary` in `src/lib/news-select.ts` picks them up next cycle. The remaining reason for a cap is wall time (~1s/article against the 60s function limit), which `timeoutMs` already enforces.

- **The AI Daily Summary passes every one of a stock's articles for the day — there is no per-symbol cap, and none should be added.** `loadDayDataBatch` applies no limit and `buildInput` passes `news.map(...)` in full, so a stock with 20 articles gets 20 in the prompt. This is easy to confuse with `MAX_PER_CYCLE` above, which is a different pipeline stage (the per-article News-page blurb) and never limited what the daily summary sees.
- **The pinned `gemini-3.5-flash` has now been exercised on the Today's Activity prompt** (Phase 4.5, one run, 5 stocks, 11.8s, 5,140 tokens). This closes the open item about the 2026-08-13 summaries having been generated by `gemini-3.5-flash-lite`. Output was spot-checked against `price_cache`: `$305.50`, `+0.08%` from `0.0786`, `12.6M` from `12,580,343`, `0.21x` from `12,580,343 / 60,432,270` — all exact, and the fixed no-explanation fallback line was used rather than a guessed cause.
- **The news pipeline dropped most of the day's articles, and the AI Daily Summary was the visible casualty.** The reported symptom was the opposite of the cause, so the investigation is worth keeping.

  **The suspicion was that the summary prompt was being fed news from other days. It was not.** `loadDayDataBatch` (now `src/lib/day-data.ts`) narrows by a UTC window and then re-checks every row with `tradingDay(new Date(row.published_at)) !== day`, an exact ET-date comparison. No article from another day can reach the prompt. Do not re-audit this filter.

  **What was actually happening: `MAX_PER_CYCLE` capped storage, not just the Gemini batch.** `fresh = allFresh.slice(0, MAX_PER_CYCLE)` ran *before* the `news` upsert, so on a busy day everything past the 15th was never stored — not deferred, simply absent until a later cycle happened to re-fetch it. Two things made it much worse than it sounds. The overflow was dropped in `TOP_20_SYMBOLS` order, because `fetchAllNews` concatenates per-symbol feeds in that order and the slice takes the head — so the tail of the list starved *deterministically*, every cycle. And only 3 of the 4 news cycles ran before the summary job, giving 45 storage slots against ~90 articles/day.

  Measured on ET day 2026-08-14 by comparing each article's `fetched_at` against that symbol's `daily_summaries.generated_at`: **38 of 86 articles present (55% missing)**. Positions 1–11 of the Top 20 got partial coverage; **CRM, CSCO, INTC, QCOM, MU and NOW got zero and were told "No relevant news was recorded for this stock today"** while the news list on the same page showed real articles. CSCO's four articles for that day were not fetched until `2026-08-15T12:00`, 13 hours after its summary was written. ET day 2026-08-13 lost 14% — the defect scaled with the Phase 4.5 widening from 10 stocks to 20.

  **The fix is to separate storing from summarising, and to store first.** Every fetched article is upserted uncapped; only the Gemini batch is capped, at 25, by `selectForSummary` (`src/lib/news-select.ts`) which picks newest-first from *every* fetched article lacking a blurb — not just the ones inserted this cycle, so a backlog article is picked up later. Storing first also means a slow, failed or truncated call costs a blurb rather than the article. `PER_SYMBOL` went 4 → 8 so a busy stock is not truncated at the fetch step (NVDA had 12 articles in one day). Cycles went 4 → 6 and the summary window moved an hour later; see the AI call budget and Phase 5 item 2.

  **`selectForSummary` lives in its own module for a mechanical reason**, the same one `watchlist.ts` records about `next/headers`: `news-ingest.ts` imports `lib/supabase`, which constructs the client at module load and throws without env vars, so a rule defined there cannot be loaded by the test runner at all.

- **`news.category` is derived at read time, not stored.** Migration `0006_news_category_derived.sql` dropped the `NOT NULL` and the `idx_news_category` index and added a GIN index on `related_symbols`; ingestion no longer writes the column and `getNews` no longer reads it. The rule lives in `src/lib/news-category.ts` with tests. Historic values are left in place — drop the column in a later migration once nothing has read it for a while. Verified against the live table: for every watchlist tried, company + industry + market summed to all 135 rows with no article in two tabs and none in none.

## Open items (not yet decided — surface these, don't guess)

- **Confirm no billing is enabled** on the Google AI Studio project — free tier only, by owner requirement. Never hardcode an RPM/RPD number from memory or a blog post; the published figures have changed more than once and sources disagree. (The live limit *was* measured in Phase 4 — 20 requests/day — by reading the 429 body, which is the one source that cannot be out of date.)
- ~~**Brandfetch's licence terms have not been read yet.**~~ **Closed.** Read and recorded: caching is licensed for 30 days only, the underlying marks stay third-party IP with no redistribution right, the Logo API is free to 500k requests/month without attribution, and the fair-use guide names educational projects and stock apps identifying brands as acceptable. This ruled out vendoring and settled the delivery method as hotlinking — see the logo note under "Decisions that were explicitly reversed".
- ~~**The Brandfetch MCP server was misconfigured**~~ — **Closed**, and the `"type": "http"` fix is confirmed working: the `mcp__brandfetch__*` tools connected in the next session and served every lookup this change needed. Kept below because the misdiagnosis is the instructive part.

  **The Brandfetch MCP server was misconfigured, and it was never an approval problem** — worth recording because the planning note guessed wrong and the guess was then repeated. `.mcp.json` declared `"type": "sse"` against `https://mcp.brandfetch.io/mcp`, which is a **Streamable HTTP** endpoint (`/mcp` is the Streamable HTTP convention; SSE servers expose `/sse`). Claude Code opened an SSE GET, the server answered **405**, and the connection never came up — silently, so the session simply had no `mcp__brandfetch__*` tools. Diagnosed with `claude mcp list` plus a direct probe: the same URL answers a Streamable HTTP `initialize` POST with `brandfetch-mcp-server v3.2.4`, so the token and the endpoint were both fine all along. `"type"` is now `"http"`; **the change only takes effect on a fresh Claude Code session**, since MCP servers connect at startup.