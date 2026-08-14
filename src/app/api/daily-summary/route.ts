import { NextResponse } from "next/server";

import { generateDailySummaries } from "@/lib/daily-summary";
import { isMarketOpen } from "@/lib/market";

// End-of-day Today's Activity generation. Same guard as the other ingestion
// routes: driven only by the Supabase Cron schedule, never by a page or a
// visitor.
//
// The job is idempotent and bounded — each call summarises the next few Top 20
// symbols that still lack today's narrative — so the schedule fires several
// times after the close and the list finishes across those runs.
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // The inverse of /api/refresh's gate: this job describes a finished session,
  // so it must not run while one is still in progress. The UTC schedule is wide
  // enough to cover both EST and EDT and this check, evaluated in
  // America/New_York, is what decides whether a tick does work.
  const params = new URL(request.url).searchParams;
  const force = params.get("force") === "1";
  if (!force && isMarketOpen()) {
    return NextResponse.json({ skipped: "market still open" });
  }

  // `?day=YYYY-MM-DD` backfills a past session. Behind the same secret as
  // everything else, and the job still refuses to pair a date with prices that
  // were not cached on it.
  const day = params.get("day") ?? undefined;

  try {
    return NextResponse.json(await generateDailySummaries(day));
  } catch (error) {
    const message = error instanceof Error ? error.message : "summary job failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
