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

## Division of labor: Claude Design vs. Claude Code

Visual design — layout composition, color, spacing, typography, theme — is Claude Design's job, not this file's. This file is a **content contract**: what data and functionality must exist on each page, and what was explicitly cut. It intentionally says nothing about how anything should look. When building a page, treat Claude Design's output as the visual reference and this file as the checklist of what must be present in that layout — if the two ever conflict on *content* (a field, a section, a feature that Design added or dropped on its own), this file wins; re-derive the visual from the checklist rather than the other way around, since every content decision here already went through several rounds of scoping with the owner. If Design's output already comes as usable component code rather than a visual mockup, treat it as a starting point to build on rather than a reference to redraw from scratch — but the content contract still governs what stays in it.

## Languages — locked, with reasoning

Every part of this app is written in **TypeScript**. No Python, no separate backend language, no JavaScript-without-types anywhere in the repo.

| Layer | Language | Why |
|---|---|---|
| Frontend (React components, pages) | TypeScript (`.tsx`) | Next.js App Router default. Type-checked props catch a whole class of "field renamed, UI silently breaks" bugs before they ship. |
| Backend (API routes, cron job handlers) | TypeScript (`.ts`) | Next.js API routes run as Vercel serverless functions natively in TS/JS — no second runtime, no second deploy target, no second language to keep in sync with the frontend. |
| Database access | TypeScript, via the Supabase JS client | Keeps query code in the same language and the same file tree as everything else calling it. |
| Database schema / migrations | Plain SQL (`.sql` migration files) | Migrations are the one place raw SQL beats a TS wrapper — the schema should be readable and diffable on its own, without needing to run TS to see what a table looks like. |
| Styling | Tailwind CSS | Fastest path to implementing whatever Claude Design produces without hand-rolling a CSS architecture; standard pairing with Next.js, nothing extra to configure. |

**Why one language for the whole stack, specifically for this project:** this is a solo-AI-written codebase with one human reviewer checking in at 5 gates over 20 days, not a team that can absorb the cost of context-switching between languages. Every language boundary in a project is a place where a type or a field name can silently drift out of sync — API response shape, DB row shape, and UI prop shape all need to agree, and TypeScript enforces that agreement in one pass instead of three. A Python backend would need its own deploy target outside Vercel's zero-config Next.js hosting, which contradicts the "$0, one deploy button" constraint this whole project is built around. Nothing in this app's data processing (rate calculations, significance scoring, batching news for one AI call) is heavy enough to need Python's data/ML ecosystem — it's arithmetic on numbers Finnhub already returns.

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

A consequence worth knowing: adding a stock to the watchlist does **not** fetch anything. All 20 candidate symbols are ingested every cycle, so any stock the user can add already has cached data.

---

## Execution plan — 5 phases, work in order

Each phase ends on a **gate**: a demo the project owner reviews before you continue. Don't start the next phase until the current gate's criteria are met and the owner has confirmed. If a criterion fails, fix it — don't move on and come back later.

Deadline: **20 days from the day work starts** (Day 1 = whatever day the owner kicks this off), all days count including weekends. Don't anchor to a specific calendar date in this file — track elapsed days from the actual start instead.

| Phase | Days | Gate | Status |
|---|---|---|---|
| 1. Foundation | Day 1–3 | Day 3 | **Done** — gate criteria verified |
| 2. Home page | Day 4–7 | Day 7 | **Done** — gate criteria verified |
| 3. News pipeline | Day 8–12 | Day 12 — **hard cutoff, see Cut Order below** | **Done** — no cuts taken; all 4 tabs shipped |
| 4. Today's Activity | Day 13–16 | Day 16 | |
| 5. Automation, polish, deploy | Day 17–20 | Day 20 — final deadline | Scheduler pulled forward — see note |

**Phase 5's scheduler work was pulled forward into Phase 2–3.** The "no client-triggered upstream API calls" rule means there is no compliant way to refresh data without a scheduler, so ingestion scheduling had to exist before the news pipeline, not after it. Phase 5 keeps the news/EOD schedules, visual pass, outage test, and final deploy.

Live URL: **https://ustechmarket.vercel.app** (Vercel deployment protection disabled so it is publicly reachable).

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
5. **Watchlist picker** (Top 20 → pick up to 10): add/remove, hard cap enforced at 10, block attempts to add an 11th with a clear message.

No AI Daily Insight card on this page — cut. Home page has zero AI calls; the only two AI touchpoints in the whole app are the News summarization batches and the per-stock Today's Activity summaries (Phase 3 and Phase 4).

**Significant Movement rule** — the one formula used everywhere (Status badge, Top Movers, Today's Activity badge). Don't reimplement it per page; write it once and import it:

```
IF |price change| ≥ 5%                              → Significant
IF relative volume ≥ 2.5x                            → Significant
IF |price change| ≥ 3% AND relative volume ≥ 1.5x    → Significant
ELSE                                                  → Normal
```

**Logo sourcing** — do not scrape logos from arbitrary web pages (adds a second copyright surface). Use one of: (a) an official investor-relations brand asset page, or (b) a free-to-use icon library such as Simple Icons. Record which source you used.

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
1. **Header**: ticker only (`NVDA`, not "NVIDIA Corporation") which doubles as a button opening a dropdown of the 10 watchlist stocks; selecting one navigates to that stock's route.
2. **5 stat cards**: Price Movement, Trading Activity (relative volume), Sector Performance, Market Performance, News & Events count. All reuse data already fetched elsewhere — no new fetches.
3. **Significant Movement badge** — same shared rule from Phase 2, same import.
4. **AI Daily Summary** — this is the core of the page and its role just changed: it now covers **everything** that happened to this stock today (price, volume, news, events) in one narrative, so the user never has to piece it together from separate sections. Because of that widened scope, feed it structured data (exact numbers, not prose) and instruct it not to compute or restate numbers on its own — the wider the summary's coverage, the more a small hallucination compounds. There is no separate "Top News" or "Related Stocks" section anymore — that content lives inside this summary now. This is the highest-stakes prompt in the app for the AI Safety / Data Integrity Rules below — the summary describes what happened, not why it definitely happened or what happens next.
5. **Price & Volume intraday chart** — reads from the same intraday snapshot table as everything else.
6. **Today's Timeline** — reconstructed **once**, during the end-of-day batch job, from the intraday snapshots already stored. Do not build any real-time listener or intraday cron for this — it would contradict the "AI runs only after market close" principle this whole architecture is built on. Timeline events (market open, notable news, high-volume alert, price milestone, market close) are computed with simple threshold rules, not AI.
7. **Upcoming Events** — earnings date + earnings call only, from Finnhub's calendar. Do not invent a conference/event calendar (no free API covers it, and hand-entering events isn't "AI-powered" and doesn't scale).

No Confidence Score. It was considered and cut — the natural version of it would be an LLM self-reporting its own confidence, which is a weak signal in practice; the 5-bullet reasoning already in the summary carries that job.

**Done when**: switching stocks via the header dropdown routes correctly for all 10 watchlist stocks, the AI summary for 3 spot-checked stocks matches the underlying raw numbers exactly (read it yourself — don't trust that it's "probably fine"), and the timeline renders from stored snapshots with no live polling involved.

### Phase 5 — Automation, polish, deploy (Day 17–20)

1. Supabase Cron: news fetch ~4x/day at 08:00 / 12:00 / 16:30 / 20:00 **ET** (not the owner's local time — the owner is in Thailand/ICT, the schedule must convert automatically and stay correct across EST/EDT daylight saving). Plus the end-of-day Today's Activity generation job, timed to run after US market close.
   - Schedules are added to `scripts/setup-cron.mts` alongside the intraday snapshot job, not to `vercel.json`.
   - **DST is handled in code, not in the cron expression**: schedule across a UTC window wide enough to cover both EST and EDT, then let the handler decide using `America/New_York` time. A fixed UTC cron expression silently drifts by an hour twice a year.
   - **Done when**: a manual trigger of each job succeeds; don't wait on a live cron firing to find out it's broken.
   - Verify the real outcome in `net._http_response`, **not** `cron.job_run_details` — `pg_net` is fire-and-forget and reports success as soon as the request is queued, so a job shows green even when the endpoint returned 401 or timed out.
2. EOD job depends on all news for the day being fetched first — sequence the 16:30 ET news cycle to complete before the EOD summary job starts.
3. Implement whatever visual design Claude Design has produced by this point; responsive check across the three pages.
4. End-to-end test: simulate a Finnhub outage/rate-limit and confirm the app shows a fallback/error state instead of crashing.
5. Final deploy + a short README aimed at the professor.

**Done when**: someone with zero context opens the live URL on a phone and understands what the product does within 30 seconds.

---

## AI call budget (keep this accurate — it's what keeps this inside free-tier limits)

- News summarization: ~4 batch cycles/day × 1 call each ≈ 4–6 calls/day (varies with article volume)
- Today's Activity summaries: 1 call per watchlist stock/day ≈ up to 10 calls/day
- Home page: **zero** AI calls (Daily Insight card was cut)

Total: roughly ~14–16 Gemini 2.5 Flash calls/day, all on the free tier. Never add a call that fires per-article or per-UI-interaction — every AI call in this product is batched and runs once, after market close, except the intraday news cycles, which are still batched (one call per cycle, not per article).

The 10 Today's Activity calls fire back-to-back at the end of the EOD job — that's the moment most likely to hit the free tier's per-minute request cap, not the daily cap. Space these calls out (a short delay between each) rather than firing all 10 in the same second.

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

The three below were forced by what the free tiers actually do, discovered by probing the live APIs during Phase 1–2. They are not preferences and re-litigating them means re-hitting the same wall.

- **Scheduler: Supabase Cron, not Vercel Cron.** Vercel Hobby permits a cron job to run **at most once per day**, and a more frequent expression *fails at deploy time* — verified against Vercel's own docs. That cannot deliver 15-minute snapshots or a 4x/day news fetch. `pg_cron` 1.6.4 and `pg_net` 0.20.4 are available on the Supabase project and `supabase_vault` 0.3.1 is already installed, so the schedule lives in Postgres. Upgrading Vercel to Pro would fix it for $20/mo and is ruled out by the $0 constraint.
- **Volume comes from Yahoo Finance, not Finnhub.** Probed at build time: `/quote` returns no volume field at all, and `/stock/candle` returns `"You don't have access to this resource"` on free tier for both daily and intraday. Without a second source the app loses the `Volume` and `Rel. Volume` columns, two of the three Significant Movement branches, and every sparkline. Yahoo's chart endpoint supplies today's cumulative volume *and* the full session's 15-minute bars, which also solves the sparkline cold-start problem. Finnhub remains the source for price and average volume.
- **Model: `gemini-3.5-flash`, not Gemini 2.5 Flash.** `gemini-2.5-flash` still appears in the model list but `generateContent` returns 404 *"no longer available to new users"*; `gemini-2.5-flash-lite` is gone the same way. Pinned rather than the `gemini-flash-latest` alias, so the summarisation prompt cannot shift under a graded demo. **Reasoning is capped at `thinkingBudget: 2048`** — unbounded reasoning made latency wildly variable (a 13-article batch once took *longer* than a 40-article one, blowing past the 60s function limit), and capping it cut a cycle from ~50s to ~13s and token use from ~20k to ~2.8k. It is not set to 0: some reasoning measurably improves adherence to the safety rules.
- **News categories are drawn from per-symbol tagging, not from Finnhub's news categories.** `/news?category=technology` and `/news?category=general` return byte-identical articles (100 of 100 ids overlap), carry no tickers, and are general world/business news. So `company` = watchlist symbols, `industry` = the other Top 20 tech companies, `market` = the general feed. Calling that general feed "Technology Industry News" would simply be false.
- **Company news is relevance-filtered before storage.** Finnhub attaches a queried symbol to articles that are not about that company at all — measured at 55% of results, e.g. a Yeti story and a Pan American Silver story both tagged `NVDA`. An article is only stored under a symbol when its headline or snippet actually references that company (`mentionsSymbol` in `src/lib/symbols.ts`). This is plain string matching, **not** AI inference, so the "tickers come from Finnhub's field, never inferred by a model" rule still holds. Mis-tagging fell from 55% to ~13%.
- **Company logos: two icon libraries covering 17 of 20, lettermark plate for the remaining 3.** Simple Icons no longer ships marks for Microsoft, Amazon, Oracle, Salesforce, Adobe, Texas Instruments, Micron, or ServiceNow, so it alone covered only 12. The marks are now **vendored locally as static SVG under `public/logos/`** — no runtime npm dependency — from two free-to-use icon libraries, recorded per the logo-sourcing rule:
  - **Simple Icons** (CC0-1.0), monochrome: AAPL, AMD, AVGO, CSCO, INTC, INTU, NVDA, PLTR, QCOM, TSLA.
  - **thesvg** (`github.com/glincker/thesvg`), full colour, filling Simple Icons' gaps: ADBE, AMZN, CRM, GOOGL, META, MSFT, MU.
  - **Lettermark plate**: TXN and NOW (no freely-licensed mark) and ORCL (wordmark-only, ~7.7:1, unreadable at badge size).

  This does not reverse the "real logos" decision — the lettermark is still the fallback where no freely-licensed mark exists. Finnhub's `/stock/profile2` returns a logo URL covering all 20 and is an available upgrade, but it is neither source this file named, so it needs an explicit owner call.

  **Open, needs an owner call:** thesvg's licence terms were not verifiable from the library's own metadata. Simple Icons' CC0-1.0 is confirmed; the seven thesvg marks are not. Confirm before this is shown outside the demo.

## Resolved items (settled during Phase 1–2 — don't re-open)

- **Intraday snapshot cadence: 15 minutes.** Documented in the schema comment in `0001_init.sql`. Snapshots snap to the 15-minute grid — the upstream feed appends a live partial bar stamped with the current time, so without snapping, every refresh leaves an extra off-grid point behind.
- **Index symbols: `QQQ` / `SPY` / `DIA` / `XLK` / `VIXY`.** Confirmed live; see the Data sources table.
- **The "Top 20" is a fixed list**, not a live ranking — no free-tier endpoint ranks US tech by market cap. Defined in `src/lib/symbols.ts`.
- **The 10-stock watchlist cap is enforced server-side** in `src/app/api/watchlist/route.ts`, and the watchlist table is the single source of truth. An earlier read-path fallback to a hardcoded default list let the cap be pushed to 11, because the API counted rows while the page counted the fallback.

- **Gemini API key works.** The `AQ.`-prefixed key authenticates fine against `generativelanguage.googleapis.com`; the unusual prefix was not a problem.
- **One batched Gemini call per cycle is enforced by a cycle cap, not by splitting the call.** `MAX_PER_CYCLE = 15` in `src/lib/news-ingest.ts`. An oversized batch truncates the model's JSON mid-string and loses every summary in it, so surplus articles are deferred to the next cycle rather than triggering a second call.

## Open items (not yet decided — surface these, don't guess)

- **Gemini free-tier rate limits** — Google no longer publishes RPM/RPD in the docs; they are only visible in the AI Studio console for the specific key. Still unchecked. Phase 4 fires one call per watchlist stock back to back, so read the real number off the console and size the inter-call delay against it. The news pipeline is unaffected (4 calls/day).
- **Confirm no billing is enabled** on the Google AI Studio project — free tier only, by owner requirement. Never hardcode an RPM/RPD number from memory or a blog post; the published figures have changed more than once and sources disagree.