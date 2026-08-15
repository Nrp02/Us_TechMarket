"use client";

import { useWatchlistMenu } from "@/components/use-watchlist-menu";
import type { TopStock } from "@/lib/symbols";

// The popover mechanics are shared with the Today's Activity symbol switcher —
// see use-watchlist-menu.ts. This component owns only the trigger, the row
// layout, and which bound applies to a given row.

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
  // No `close` here: unlike the switcher, picking a stock does not dismiss this
  // popover — the visitor is usually choosing several — so the only ways out
  // are the trigger, Escape and an outside click, all of which live in the hook.
  const { open, toggleOpen, message, pending, container, trigger, mutate } =
    useWatchlistMenu();

  const chosen = new Set(selected);
  const full = selected.length >= cap;
  // The floor matters as much as the cap now: every page assumes a non-empty
  // watchlist, so the API refuses to remove the last stock.
  const atMin = selected.length <= min;

  return (
    <div ref={container} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={toggleOpen}
        // aria-expanded alone is the disclosure contract. `aria-haspopup="menu"`
        // used to sit here and promised a menu the popover never declared —
        // it rendered no role at all, so the promise was never kept.
        aria-expanded={open}
        className="rounded-full bg-surface-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-hairline"
      >
        Edit watchlist ({selected.length}/{cap})
      </button>

      {open && (
        <div className="panel-overlay absolute right-0 z-20 mt-2 w-80 rounded-3xl p-4">
          {/* Says what the bound is *and*, at a bound, what to do about it. A
              disabled row can only show that something is unavailable. */}
          <p className="px-1 text-xs text-body">
            Pick up to {cap} of the Top 20 US technology stocks.
            {full && " Remove one to add another."}
            {atMin && " At one stock, remove is unavailable."}
          </p>

          {/* role="status" so the cap and floor messages are announced. They
              were previously a plain <p>: a screen reader user hit the limit
              and got nothing at all.

              bg-tint-down rather than bg-semantic-down/10 — see the Baked Tint
              Rule; the alpha's contrast moved with whatever sat behind it. */}
          {message && (
            <p
              role="status"
              className="mt-2 rounded-xl bg-tint-down px-3 py-2 text-xs font-medium text-semantic-down"
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
                    onClick={() =>
                      mutate(stock.symbol, isChosen ? "DELETE" : "POST")
                    }
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
