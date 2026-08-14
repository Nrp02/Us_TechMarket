import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { TOP_20_SYMBOLS } from "@/lib/symbols";
import {
  normaliseWatchlist,
  readWatchlist,
  serialiseWatchlist,
  WATCHLIST_COOKIE,
  WATCHLIST_COOKIE_OPTIONS,
  WATCHLIST_MAX,
  WATCHLIST_MIN,
} from "@/lib/watchlist";

// The watchlist is per-browser and lives in a cookie; this is the only place it
// is written. Both bounds are enforced here rather than in the UI so they hold
// however the endpoint is called — the cap was already pushed to 11 once, when
// the read path and this route disagreed about what the list was.

async function save(symbols: string[]): Promise<string[]> {
  // Normalised on the way out as well as on the way in, so what is stored is
  // exactly what a page will read back.
  const next = normaliseWatchlist(symbols);
  const jar = await cookies();
  jar.set(WATCHLIST_COOKIE, serialiseWatchlist(next), WATCHLIST_COOKIE_OPTIONS);
  return next;
}

export async function GET() {
  return NextResponse.json({ symbols: await readWatchlist() });
}

export async function POST(request: Request) {
  const { symbol } = (await request.json()) as { symbol?: string };

  if (!symbol || !TOP_20_SYMBOLS.includes(symbol)) {
    return NextResponse.json(
      { error: "Symbol must be one of the Top 20." },
      { status: 400 },
    );
  }

  const symbols = await readWatchlist();
  if (symbols.includes(symbol)) {
    return NextResponse.json({ symbols });
  }
  if (symbols.length >= WATCHLIST_MAX) {
    return NextResponse.json(
      {
        error: `Your watchlist is full at ${WATCHLIST_MAX} stocks. Remove one before adding ${symbol}.`,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ symbols: await save([...symbols, symbol]) });
}

export async function DELETE(request: Request) {
  const { symbol } = (await request.json()) as { symbol?: string };
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const symbols = await readWatchlist();
  if (!symbols.includes(symbol)) {
    return NextResponse.json({ symbols });
  }
  // Every page assumes a non-empty watchlist, so the last stock cannot go.
  if (symbols.length <= WATCHLIST_MIN) {
    return NextResponse.json(
      {
        error: `Keep at least ${WATCHLIST_MIN} stock on your watchlist. Add another before removing ${symbol}.`,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    symbols: await save(symbols.filter((s) => s !== symbol)),
  });
}
