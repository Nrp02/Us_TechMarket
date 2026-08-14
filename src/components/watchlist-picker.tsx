"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { TopStock } from "@/lib/symbols";

export function WatchlistPicker({
  universe,
  selected,
  min,
  cap,
}: {
  universe: TopStock[];
  selected: string[];
  min: number;
  cap: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const chosen = new Set(selected);
  const full = selected.length >= cap;
  // The floor matters as much as the cap now: every page assumes a non-empty
  // watchlist, so the API refuses to remove the last stock.
  const atMin = selected.length <= min;

  async function toggle(symbol: string) {
    const removing = chosen.has(symbol);
    setMessage(null);

    const res = await fetch("/api/watchlist", {
      method: removing ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setMessage(body.error ?? "Could not update the watchlist.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-surface-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-hairline"
      >
        Edit watchlist ({selected.length}/{cap})
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-3xl border border-hairline bg-canvas p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="px-1 text-xs text-body">
            Pick up to {cap} of the Top 20 US technology stocks.
          </p>

          {message && (
            <p className="mt-2 rounded-xl bg-semantic-down/10 px-3 py-2 text-xs font-medium text-semantic-down">
              {message}
            </p>
          )}

          <ul className="mt-3 max-h-80 overflow-y-auto">
            {universe.map((stock) => {
              const isChosen = chosen.has(stock.symbol);
              const blocked = isChosen ? atMin : full;

              return (
                <li key={stock.symbol}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(stock.symbol)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-soft disabled:opacity-50"
                  >
                    <span>
                      <span className="text-sm font-semibold text-ink">
                        {stock.symbol}
                      </span>
                      <span className="ml-2 text-xs text-muted">{stock.name}</span>
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        blocked
                          ? "text-muted"
                          : isChosen
                            ? "text-semantic-down"
                            : "text-primary"
                      }`}
                    >
                      {isChosen ? "Remove" : "Add"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
