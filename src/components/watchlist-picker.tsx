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
  const {
    open,
    toggleOpen,
    message,
    busy,
    busyMessage,
    container,
    trigger,
    mutate,
    menuProps,
  } = useWatchlistMenu();

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
        // The promise is kept now: the list below is a real menu — role,
        // focus-on-open, arrow keys, type-ahead over the twenty tickers, and
        // Tab handing focus back out. See use-watchlist-menu.ts.
        aria-haspopup="menu"
        aria-expanded={open}
        className="panel-control px-4 py-2 text-sm font-semibold text-ink"
      >
        {/* The count is a figure checked against a cap, not a number inside a
            sentence, so it takes mono and tabular per the Mono Numerals Rule —
            it also stops the button resizing as the count crosses from 9 to 10.
            The prose in the popover keeps its numerals in Inter; see the rule
            in DESIGN.md for where that line falls. */}
        Edit watchlist{" "}
        <span className="font-mono tabular-nums">
          ({selected.length}/{cap})
        </span>
      </button>

      {open && (
        <div className="panel-overlay absolute right-0 z-20 mt-2 w-80 rounded-3xl p-4 [--overlay-origin:top_right]">
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
          {/* Busy and blocked used to be one signal — a dimmed control — so a
              visitor could not tell "working" from "not allowed". This says
              which, in words, in the same live region the errors use. It never
              appears at the same time as an error: a request is either in
              flight or it has come back. */}
          {busyMessage && (
            <p
              role="status"
              className="mt-2 rounded-xl bg-surface-soft px-3 py-2 text-xs font-medium text-body"
            >
              {busyMessage}
            </p>
          )}
          {message && (
            <p
              role="status"
              className="mt-2 rounded-xl bg-tint-down px-3 py-2 text-xs font-medium text-semantic-down"
            >
              {message}
            </p>
          )}

          <ul
            {...menuProps}
            aria-label="Top 20 US technology stocks"
            className="mt-3 max-h-80 overflow-y-auto"
          >
            {universe.map((stock) => {
              const isChosen = chosen.has(stock.symbol);
              const blocked = isChosen ? atMin : full;

              return (
                <li
                  key={stock.symbol}
                  role="none"
                  data-menu-row
                  data-menu-key={stock.symbol}
                >
                  {/* `blocked` used to change the word's colour and nothing
                      else, so at the cap the row still looked live, fired a real
                      POST and came back 409. The switcher already refused the
                      click; now both do. */}
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    disabled={busy || blocked}
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
                    {/* No colour on the verb. "Remove" was drawn in the loss
                        red and "Add" in Signal Blue, so at the moment this menu
                        is open the same viewport shows red meaning "a price
                        fell" and red meaning "this button destroys something",
                        and blue meaning "crossed the significance rule" beside
                        blue meaning "you may click this". Both are the accent
                        rules of DESIGN.md broken in one row.

                        The distinction is carried by a glyph instead — the same
                        − and + the symbol switcher uses for the same two
                        actions — so it survives for a reader who cannot
                        separate the two hues at all. */}
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold ${
                        blocked ? "text-muted" : "text-body"
                      }`}
                    >
                      <span aria-hidden>{isChosen ? "−" : "+"}</span>
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
