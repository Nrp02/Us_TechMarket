# US TechMarket

**A daily intelligence app for 20 US technology stocks. It answers one question per stock, once a day: *what happened to this stock today?***

**Live: [ustechmarket.vercel.app](https://ustechmarket.vercel.app)** — no sign-up, nothing to install.

---

## What it does

Most market apps hand you a chart, a price and a news feed and leave you to assemble the answer. This one does the assembling: it watches a fixed universe of 20 US technology stocks, collects price, volume, news and events for all of them on a schedule, filters out what is mis-tagged, and writes a summary per stock after the US market closes.

There are three surfaces:

| | |
|---|---|
| **Home** | Five market index cards, your watchlist as a table with a Significant/Normal badge per stock, the day's top movers ranked, and a three-article news teaser. |
| **News** | Every article collected, split into All / Company / Industry / Market, each with an AI-written 2–3 line summary and a link to the original. |
| **Today's Activity** | One page per stock: five stat cards, the AI daily summary, an intraday price-and-volume chart, a reconstructed timeline of the session, and the next earnings date. |

Your watchlist (1–10 stocks, 7 by default) lives in a cookie in your own browser. There are no accounts.

## The part that is actually interesting

### The AI is forbidden from doing the thing every competitor does

Products in this category compete on explaining **why** a stock moved and **what comes next**. This one is structurally prevented from doing either. The summary describes what happened; it never asserts a cause the source material does not state, never predicts, and never advises.

That is not a line in a prompt hoping to be obeyed. The narrative is generated as **three separate fields** — `movement` (price and volume, no news), `recap` (news, no price), and `explanation` (the only field allowed to link them) — because a single-prompt narrative reliably invented causation the sources never claimed. One measured example, before the split:

> *"Apple's stock price increased **as** Norway's sovereign wealth fund disclosed a position"*

Nothing in the source claimed that link. Listing banned phrasings did not stop it, because *"does the source state this?"* is a judgement the model makes generously. Splitting the fields did: the fixed fallback line — *"The available information does not establish a clear explanation for this movement."* — went from rarely used to used on 7 of 10 stocks, with the other 3 traced to reports that genuinely made the claim.

Every number in a summary is passed in pre-computed. The model states figures; it never derives them.

### Your visit never touches a metered API

Every external call — Finnhub, Yahoo, Gemini — comes from a scheduled server-side job. Pages read cached Postgres rows only, and each stock's summary is generated once per day and stored, so two visitors on the same page cost zero AI calls between them.

This is enforced mechanically rather than by convention: importing an upstream client from a page or component **fails lint**, and the ingestion endpoint checks a shared secret and fails closed.

It matters because the free tiers are small. Gemini's limit is **20 requests per day per project** — measured off a live 429, not read from a blog post — and the app runs at a budget of **8**: four batched news cycles and four batched summary runs. One call per article, or per page view, would exhaust the quota before a demo started.

### It survives its upstreams failing

Simulated by pointing the app at a dead Finnhub key so every request 401s. The refresh job returned HTTP 200 with `prices: 0, failed: [all 25]` — and, more importantly, **wrote nothing**: the cached prices and 1,346 intraday snapshots were untouched. All three pages still rendered the last good data. A total upstream outage cannot reach a visitor, because a visitor was never connected to an upstream.

## How it is built

| | |
|---|---|
| **Frontend + backend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| **Database** | Supabase (Postgres) |
| **Scheduling** | Supabase Cron (`pg_cron` + `pg_net`) — Vercel Hobby caps cron at once per day, which cannot deliver 15-minute snapshots |
| **AI** | Gemini `gemini-3.5-flash`, free tier, batched |
| **Hosting** | Vercel |

**Data sources.** Finnhub for prices, company news and the earnings calendar; Yahoo Finance's chart endpoint for today's volume and intraday bars (Finnhub's free tier serves neither); SEC EDGAR for filing metadata; Brandfetch's Logo CDN for company marks, hotlinked under its licence.

**Schedule.** Price and volume snapshots every 15 minutes while the market is open; news four times a trading day; summaries after the close. Market hours are evaluated in `America/New_York`, so the schedule survives daylight saving without editing a cron expression.

**Performance.** Server-side median page time is ~93ms, down from ~1,450ms. Almost none of that came from tuning queries: a query returning one row cost the same as one returning 840, because the price is per *request*. The two fixes were pinning the functions to the same region as the database (`iad1` 260ms → `sin1` 155ms per request) and caching the read helpers for 60 seconds, well inside the 15-minute ingestion cadence.

**Keyboard.** `g h`, `g n` and `g a` jump between the three routes — the hint is printed on each rail item, so it is a visible feature rather than a secret. The watchlist menus are real ARIA menus: they take focus when they open, move on the arrow keys, and jump to a ticker as you type it (`n`, `v` → NVDA).

**Accessibility.** WCAG 2.1 AA. Contrast is measured against the *worst-case composite* — the frosted panels are translucent, so each surface is a range rather than a value, and every text pair is checked at the brightest point that range reaches. `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast` each get a designed alternative rather than a blanket switch-off. Laptop and iPad are the supported widths; phone is a documented non-target.

## Running it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

You will need a `.env.local` with Supabase, Finnhub and Gemini credentials, plus a `CRON_SECRET`. Without them the app builds and serves, but every page shows its empty state.

```bash
npm run build        # production build
npm test             # 41 unit tests
npm run lint
npm run migrate      # apply SQL migrations
npm run setup-cron   # provision the Supabase Cron schedules (idempotent)
```

**A warning if you do run it:** local and deployed point at the *same* Supabase project and, by default, the same Gemini key. Triggering an ingestion job by hand writes production rows and spends production's daily AI quota.

## Where things are

```
src/app/          routes: Home, News, Today's Activity, and 4 API endpoints
src/components/   UI, server components unless a file says "use client"
src/lib/          upstream clients, queries, the significance rule, AI prompts
supabase/         SQL migrations
scripts/          migrate + cron provisioning
assets/           the two fonts the link-preview image is drawn with
```

Three documents carry the reasoning behind the code, and they divide cleanly:

- **`CLAUDE.md`** — the technical and content contract. What must exist on each page, what was explicitly cut, and every decision that was reversed mid-build *with the evidence that reversed it*. If something in the code looks wrong, the reason is usually in here.
- **`PRODUCT.md`** — durable product truth: who it is for, what it promises, what it must never claim.
- **`DESIGN.md`** — the visual contract: tokens, type, material, and the named rules the interface is built from.

## Honest limits

- The market index cards are **ETF proxies** (QQQ, SPY, DIA, XLK, VIXY), because the free tier rejects real index symbols. `VIXY` tracks VIX *futures*, not VIX spot, and the interface says so.
- The universe of 20 is a **fixed list**, not a live market-cap ranking — no free endpoint provides one.
- Today's volume comes from an **unofficial Yahoo endpoint**. A failure there means "volume unknown", never an error page.
- **Phone widths (~390px) are not supported.** A visitor on a phone gets a horizontally scrolling page. This is a device-target decision, not an oversight.
- There are **no users, no track record and no financial-services standing**. This is a student project that holds no money and executes no trades. Nothing in it is investment advice.
