"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

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
  const container = useRef<HTMLDivElement>(null);

  // Ported from symbol-switcher.tsx, which had all of this and this component
  // had none of it — same cookie, same bounds, two different menus. Escape and
  // outside-click are the only ways out for a keyboard user; without them the
  // list of 20 buttons could only be escaped by tabbing back to the trigger.
  // A 409 from a previous opening of the menu is stale the moment it closes, so
  // closing clears it. Doing this in an effect on `open` instead would be a
  // cascading render; every close already goes through here.
  function close() {
    setOpen(false);
    setMessage(null);
  }

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full bg-surface-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-hairline"
      >
        Edit watchlist ({selected.length}/{cap})
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-3xl border border-hairline bg-canvas p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="px-1 text-xs text-body">
            Pick up to {cap} of the Top 20 US technology stocks.
          </p>

          {/* role="status" so the cap and floor messages are announced. They
              were previously a plain <p>: a screen reader user hit the limit
              and got nothing at all. */}
          {message && (
            <p
              role="status"
              className="mt-2 rounded-xl bg-semantic-down/10 px-3 py-2 text-xs font-medium text-semantic-down"
            >
              {message}
            </p>
          )}

          <ul className="mt-3 max-h-80 overflow-y-auto">
            {universe.map((stock) => {
              const isChosen = chosen.has(stock.symbol);
              const blocked = isChosen ? atMin : full;

              return (
                <li key={stock.symbol}>
                  {/* `blocked` used to change the word's colour and nothing
                      else, so at the cap the row still looked live, fired a real
                      POST and came back 409. The switcher already refused the
                      click; now both do. */}
                  <button
                    type="button"
                    disabled={pending || blocked}
                    aria-label={
                      isChosen
                        ? `Remove ${stock.symbol} from your watchlist`
                        : `Add ${stock.symbol} to your watchlist`
                    }
                    onClick={() => toggle(stock.symbol)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
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
