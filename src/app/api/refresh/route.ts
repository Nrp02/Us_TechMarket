import { NextResponse } from "next/server";

import { isClosingWindow, isMarketOpen, tradingDay } from "@/lib/market";
import { refreshMarketData } from "@/lib/refresh";
import { TOP_20_SYMBOLS } from "@/lib/symbols";
import { rebuildTimelines } from "@/lib/timeline-rebuild";

// The single ingestion entry point. Every upstream API call in the app happens
// behind this route, and this route is only ever driven by the Supabase Cron
// schedule (see scripts/setup-cron.mts) — never by a page or a visitor.
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;

  // Fails closed. A missing secret means misconfiguration, not open access —
  // otherwise dropping the env var would silently republish the endpoint.
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // The schedule fires across a UTC window wide enough to cover both EST and
  // EDT, so this check — evaluated in America/New_York — is what actually
  // decides whether a tick does any work.
  //
  // The closing window is included deliberately: 16:00 ET falls outside
  // `isMarketOpen`, so without it the newest price on record is the 15:45 quote
  // and everything downstream that says "close" is saying something untrue.
  const force = new URL(request.url).searchParams.get("force") === "1";
  if (!force && !isMarketOpen() && !isClosingWindow()) {
    return NextResponse.json({ skipped: "market closed" });
  }

  try {
    const result = await refreshMarketData();

    // Today's Timeline is rebuilt here, on the snapshots this run just wrote,
    // so the Today's Activity page is useful while the session is running
    // instead of only after the end-of-day job. It used to be built once, at
    // EOD, which left the page showing "the timeline is built after the close"
    // for the whole trading day.
    //
    // This needs no schedule of its own — it rides the 15-minute cadence that
    // already exists for the snapshots, inside the same market-hours gate above,
    // and reads only tables. No upstream call and no AI call, so the cost is a
    // batched read plus one delete/insert.
    //
    // TOP_20_SYMBOLS, not ALL_SYMBOLS: the index proxies have no per-stock page.
    const { timelines, failed } = await rebuildTimelines(
      TOP_20_SYMBOLS,
      tradingDay(),
    );

    return NextResponse.json({
      ...result,
      timelines: timelines.length,
      timelineFailed: failed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "refresh failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
