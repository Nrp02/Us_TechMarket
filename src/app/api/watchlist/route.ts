import { NextResponse } from "next/server";

import { db } from "@/lib/supabase";
import { TOP_20_SYMBOLS, WATCHLIST_CAP } from "@/lib/symbols";

// The cap is enforced here rather than in the UI so it holds however the
// endpoint is called. There is no user system, so this is one global watchlist.

async function currentSymbols(): Promise<string[]> {
  const { data } = await db
    .from("watchlist")
    .select("symbol")
    .order("added_at", { ascending: true });
  return (data ?? []).map((r) => r.symbol as string);
}

export async function GET() {
  return NextResponse.json({ symbols: await currentSymbols() });
}

export async function POST(request: Request) {
  const { symbol } = (await request.json()) as { symbol?: string };

  if (!symbol || !TOP_20_SYMBOLS.includes(symbol)) {
    return NextResponse.json(
      { error: "Symbol must be one of the Top 20." },
      { status: 400 },
    );
  }

  const symbols = await currentSymbols();
  if (symbols.includes(symbol)) {
    return NextResponse.json({ symbols });
  }
  if (symbols.length >= WATCHLIST_CAP) {
    return NextResponse.json(
      {
        error: `Your watchlist is full at ${WATCHLIST_CAP} stocks. Remove one before adding ${symbol}.`,
      },
      { status: 409 },
    );
  }

  const { error } = await db.from("watchlist").insert({ symbol });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ symbols: [...symbols, symbol] });
}

export async function DELETE(request: Request) {
  const { symbol } = (await request.json()) as { symbol?: string };
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const { error } = await db.from("watchlist").delete().eq("symbol", symbol);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ symbols: await currentSymbols() });
}
