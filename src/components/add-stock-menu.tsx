"use client";

import { useWatchlistMenu } from "@/components/use-watchlist-menu";
import { NAME_BY_SYMBOL, TOP_20_SYMBOLS } from "@/lib/symbols";

// Standalone card for adding a stock to the watchlist from Today's Activity,
// split out of the symbol switcher's popover on purpose. The two used to share
// one max-h-96 scroll — the current watchlist (up to 10 rows) rendered first,
// leaving as little as one addable row visible before an unmarked internal
// scroll hid the other twelve. Its own trigger and its own height budget means
// the add list is no longer crowded out by whatever the watchlist happens to
// contain.
//
// The count is stated in words in the header, not left for the scrollbar to
// imply — the same reasoning DESIGN.md already applies to the Scrolling Island
// Rule, turned vertical: a visitor should not have to discover a list scrolls
// by accident. The bottom fade is the visual half of that same cue; the count
// and the fade both say it, for a mouse-and-eyes visitor and a screen-reader
// visitor respectively.

export function AddStockMenu({ symbols, max }: { symbols: string[]; max: number }) {
  const {
    open,
    toggleOpen,
    message,
    busy,
    busyMessage,
    container,
    trigger,
    mutate,
    menuId,
    menuProps,
  } = useWatchlistMenu();

  const watched = new Set(symbols);
  const unwatched = TOP_20_SYMBOLS.filter((s) => !watched.has(s));
  const atMax = symbols.length >= max;

  return (
    <div ref={container} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        // 44px on a touch pointer, unchanged on a mouse. The audit measured this
        // control at 30px on a phone — legal under WCAG 2.2 AA, which asks 24,
        // but under the 44 the nav card already spends on itself. `pointer-coarse`
        // rather than a width, because the thing being sized against is a finger,
        // and an iPad with a keyboard is still touched.
        className="panel-control inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-body hover:text-ink pointer-coarse:min-h-11 pointer-coarse:px-4"
      >
        <span className="font-mono" aria-hidden>
          +
        </span>
        Add stock
      </button>

      {open && (
        // Anchored right on a phone so it opens LEFTWARD, and this is an
        // overflow fix rather than a preference. The popover is 288px wide and
        // the trigger sits after the symbol switcher, about 250px into a 358px
        // content column, so anchored left it ran to ~536 against a 390
        // viewport — roughly 146px of the stock list off-screen and
        // unreachable. Anchored right its left edge is trigger-right minus
        // 288, measured across the watchlist: MU 22, AVGO 56, NVDA 58,
        // GOOGL 78, all inside the 16px column margin. MU is the worst case
        // because it is the shortest ticker, so the switcher beside it is
        // narrowest and the trigger sits furthest left.
        //
        // From 600 up it goes back to opening rightward, where there is room
        // and where the trigger reads as the anchor.
        <div className="panel-overlay absolute right-0 z-20 mt-2 w-72 rounded-2xl p-1 [--overlay-origin:top_right] min-[600px]:left-0 min-[600px]:right-auto min-[600px]:[--overlay-origin:top_left]">
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
              className="mx-2 my-1 rounded-xl bg-tint-down px-3 py-2 text-xs font-medium text-semantic-down"
            >
              {message}
            </p>
          )}

          <p id="add-stock-heading" className="px-4 py-2 text-xs font-semibold text-muted">
            Add from the Top 20{" "}
            <span className="font-mono tabular-nums">
              ({unwatched.length} available)
            </span>
            {atMax && ` · remove one to go below ${max}`}
          </p>

          {/* Relative wrapper for the fade mask below — the mask sits over the
              scroll container's own bottom edge, not inside it, so it never
              scrolls with the content it is signalling. */}
          <div className="relative">
            <ul
              {...menuProps}
              aria-labelledby="add-stock-heading"
              className="max-h-72 overflow-y-auto"
            >
              {unwatched.map((option) => (
                <li key={option} role="none" data-menu-row data-menu-key={option}>
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    disabled={busy || atMax}
                    onClick={() => mutate(option, "POST")}
                    aria-label={`Add ${option} to your watchlist`}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="font-semibold text-ink">{option}</span>
                      <span className="ml-2 text-xs text-muted">
                        {NAME_BY_SYMBOL.get(option) ?? ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-primary">
                      +
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {/* Purely visual — the count above already states this in words
                for anyone who can't see a gradient. aria-hidden so it adds
                nothing to the accessibility tree. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-canvas to-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
