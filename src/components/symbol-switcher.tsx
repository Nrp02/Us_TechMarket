"use client";

import { useRouter } from "next/navigation";

import { useWatchlistMenu } from "@/components/use-watchlist-menu";
import { TOP_20_SYMBOLS } from "@/lib/symbols";

// The page header doubles as the navigation for this section: the ticker itself
// is the button, and it opens the watchlist. There is deliberately no secondary
// tab bar on Today's Activity — the sidebar plus this switcher is the whole of it.
//
// The menu also edits the watchlist, so a stock can be added or dropped without
// going back to the Home page. The popover mechanics — open state, outside
// click, Escape, focus return, and the mutation itself — are shared with the
// Home picker in use-watchlist-menu.ts; what is left here is the row layout and
// which bound applies to which group.
//
// This is a disclosure, not a menu. `role="menu"` used to sit on the popover
// with `role="menuitem"` on only one of each row's two buttons, over a <ul> that
// carried no `role="none"` — so the owned-element relationship was broken and
// half the controls were invisible to the pattern, in exchange for promising
// arrow-key semantics nothing here implements. Native list and button semantics
// plus aria-expanded describe this accurately.

export function SymbolSwitcher({
  symbol,
  symbols,
  min,
  max,
}: {
  symbol: string;
  symbols: string[];
  min: number;
  max: number;
}) {
  const router = useRouter();
  const { open, close, toggleOpen, message, pending, container, trigger, mutate } =
    useWatchlistMenu();

  const watched = new Set(symbols);
  const unwatched = TOP_20_SYMBOLS.filter((s) => !watched.has(s));
  const atMin = symbols.length <= min;
  const atMax = symbols.length >= max;

  const row = (option: string, action: "add" | "remove") => {
    const blocked = action === "add" ? atMax : atMin;

    return (
      <li key={option} className="flex items-center">
        <button
          type="button"
          onClick={() => {
            close();
            router.push(`/todays-activity/${option}`);
          }}
          className={`flex-1 px-4 py-2 text-left text-sm font-medium transition-colors ${
            option === symbol
              ? "bg-surface-strong text-primary"
              : "text-body hover:bg-surface-soft hover:text-ink"
          }`}
        >
          {option}
        </button>

        <button
          type="button"
          disabled={pending || blocked}
          onClick={() => mutate(option, action === "add" ? "POST" : "DELETE")}
          aria-label={
            action === "add"
              ? `Add ${option} to your watchlist`
              : `Remove ${option} from your watchlist`
          }
          // opacity-30 resolved to 1.51:1 light / 1.58:1 dark against the
          // overlay — the disabled state was invisible, on the control whose
          // disabled state was the *only* signal that the cap or the floor had
          // been reached. At 50% it measures 2.08:1 / 2.26:1: still recessive,
          // which is what a disabled control should be, but now perceptibly
          // different from the 5.24:1 enabled glyph beside it. The rest of the
          // job is done in words by the group headers below, because a dimmed
          // control cannot state a reason and `disabled` also drops the button
          // out of the tab order, so a keyboard visitor at the cap would
          // otherwise tab past thirteen `+` controls with no explanation.
          className="min-h-10 px-3 text-sm font-semibold text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {action === "add" ? "+" : "−"}
        </button>
      </li>
    );
  };

  return (
    <div ref={container} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={toggleOpen}
        // aria-expanded alone is the disclosure contract. `aria-haspopup="menu"`
        // used to sit here and promised a menu the popover never declared.
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl px-2 py-1 text-3xl font-semibold tracking-tight text-ink transition-colors hover:bg-surface-strong"
      >
        {symbol}
        <svg
          viewBox="0 0 20 20"
          className={`size-5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Change stock</span>
      </button>

      {open && (
        <div className="panel-overlay absolute left-0 z-20 mt-2 max-h-96 w-60 overflow-y-auto rounded-2xl py-1">
          {message && (
            // role="status" so a refused mutation is announced rather than only
            // drawn. bg-tint-down rather than bg-semantic-down/10: an alpha
            // composites against whatever lands behind it, which is the exact
            // thing the Baked Tint Rule exists to prevent. The baked token is
            // the same colour and measures 4.77:1 / 5.03:1 wherever it sits.
            <p
              role="status"
              className="mx-2 my-1 rounded-xl bg-tint-down px-3 py-2 text-xs font-medium text-semantic-down"
            >
              {message}
            </p>
          )}

          {/* The count alone did not say what the count *meant* once a bound was
              reached. These two lines are where the cap and the floor are
              actually communicated — the dimmed control can only show that
              something is unavailable, never why. */}
          <p className="px-4 py-1 text-xs font-semibold text-muted">
            Watchlist ({symbols.length}/{max})
            {atMin && " · remove is unavailable at one stock"}
          </p>
          <ul>{symbols.map((option) => row(option, "remove"))}</ul>

          {unwatched.length > 0 && (
            <>
              <p className="mt-1 border-t border-hairline px-4 pb-1 pt-2 text-xs font-semibold text-muted">
                Add from Top 20
                {atMax && ` · remove one to go below ${max}`}
              </p>
              <ul>{unwatched.map((option) => row(option, "add"))}</ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
