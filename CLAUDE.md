# US TechMarket — Build Instructions for Claude Code

> Read this whole file before writing any code. It is the single source of truth — every decision below was already argued through and locked with the project owner. Do not re-litigate a locked decision; if something here seems wrong, flag it, don't silently deviate.

## What you are building

A school demo — an AI daily intelligence app for tracking US Technology stocks. Core question the product answers, per stock, once a day: **"What happened to this stock today?"**

Workflow: Watch → Collect → Filter → Understand → Summarize.

Constraints that shape every decision below: no user accounts, no budget (free tiers only), optimized for "a working, presentable, deployable link to show a professor" — not scale, not robustness.

## Stack

- **Frontend + Backend**: Next.js (App Router), one repo
- **Database**: Supabase (Postgres, free tier)
- **Scheduled jobs**: Vercel Cron
- **Hosting**: Vercel (free tier)
- **AI**: Gemini API, model **Gemini 2.5 Flash**, free tier only — no billing enabled on the Google AI Studio project, ever. See "Free tier verification" under Open Items — don't trust a specific rate-limit number from training data or a blog post; check the live console at build time.

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
| Price, volume, company news, earnings calendar | Finnhub (free tier, 60 calls/min) | Primary source for almost everything |
| Market index proxy (NASDAQ, S&P 500) | Finnhub `/quote` on ETF symbols | No direct index endpoint on free tier |
| Dow Jones, Technology Sector, VIX | Finnhub — find the closest free-tier equivalent (ETF/index proxy) | Confirm exact symbols in Phase 1 |
| Sector/Peers | Finnhub `/stock/peers` | Used inside Today's Activity, not a standalone page |
| SEC filings | SEC EDGAR Full-Text Search API | Metadata only — type, date, link. Never parse full filing text. |
| AI summarization | Gemini 2.5 Flash (free tier) | Batched — see "AI call budget" below |

No paid tier anywhere. If a free-tier endpoint can't deliver something in this file, stop and flag it rather than substituting a paid one.

---

## Execution plan — 5 phases, work in order

Each phase ends on a **gate**: a demo the project owner reviews before you continue. Don't start the next phase until the current gate's criteria are met and the owner has confirmed. If a criterion fails, fix it — don't move on and come back later.

Deadline: **20 days from the day work starts** (Day 1 = whatever day the owner kicks this off), all days count including weekends. Don't anchor to a specific calendar date in this file — track elapsed days from the actual start instead.

| Phase | Days | Gate |
|---|---|---|
| 1. Foundation | Day 1–3 | Day 3 |
| 2. Home page | Day 4–7 | Day 7 |
| 3. News pipeline | Day 8–12 | Day 12 — **hard cutoff, see Cut Order below** |
| 4. Today's Activity | Day 13–16 | Day 16 |
| 5. Automation, polish, deploy | Day 17–20 | Day 20 — final deadline |

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
4. **Thumbnail fallback chain**, in order: Finnhub-provided image URL → generic category icon (Company/Industry/Market) → no image at all. Check the image URL resolves (`onError` handler) before trusting it — don't let a dead URL leave a broken-image icon on screen.
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

1. Vercel Cron: news fetch ~4x/day at 08:00 / 12:00 / 16:30 / 20:00 **ET** (not the owner's local time — the owner is in Thailand/ICT, the schedule must convert automatically and stay correct across EST/EDT daylight saving). Plus the end-of-day Today's Activity generation job, timed to run after US market close.
   - **Done when**: a manual trigger of each job succeeds; don't wait on a live cron firing to find out it's broken.
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
| 3 | Finnhub rate limit hit during a 10-stock batch | Queue/delay between calls, designed in from Day 8, not patched in afterward | Claude Code |
| 4 | Gate review stalls the critical path (this is a solo-reviewer project — no parallel work possible) | Owner blocks calendar time in advance for each gate date above | Project owner |

## Decisions that were explicitly reversed mid-planning — don't revert to the original

These look like they contradict earlier reasoning in this doc. They're not mistakes — they were revisited on purpose after seeing mockups. Trust the version below.

- Market Overview: **5 cards** (not the originally-scoped 3 — Dow Jones and VIX are back in).
- Company logos: **real logos**, not generic badges — accepted for this demo specifically because it won't see commercial deployment.
- Sparklines: **included**, on both Home cards and watchlist rows — the earlier "skip sparklines to save time" call was reversed once the intraday snapshot table made them cheap.
- Today's Activity page: **no secondary tab bar at all** — earlier mockups showed 8 tabs (Overview/News/Events/Financials/Charts/Peers/SEC Filings); all removed in favor of the sidebar + one dense AI summary.

## Open items (not yet decided — surface these, don't guess)

- Exact intraday snapshot cadence (15 vs 30 min) — pick one in Phase 1 Day 2 and document it in the schema comments.
- Exact free-tier symbol/endpoint for Dow Jones, Technology Sector, and VIX on Finnhub — confirm in Phase 1, don't assume the same pattern as NASDAQ/S&P 500 works.
- **Gemini 2.5 Flash free-tier rate limits** — do not hardcode a specific RPM/RPD number from memory or from a blog post; published numbers for this have changed more than once recently and sources disagree. Check the live quota in the Google AI Studio console for the actual project key at the start of Phase 1, and size the ~10-call EOD batch's inter-call delay off that real number, not an assumed one. Confirm no billing is enabled on the project — free tier only, by owner requirement.