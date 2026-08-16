"use client";

import { useRouter } from "next/navigation";

import { useWatchlistMenu } from "@/components/use-watchlist-menu";

// The page header doubles as the navigation for this section: the ticker itself
// is the button, and it opens the watchlist. There is deliberately no secondary
// tab bar on Today's Activity — the sidebar plus this switcher is the whole of it.
//
// This popover now covers watching and removing only — selecting a row
// navigates there, and every row can be dropped from the watchlist. Adding a
// stock lives in its own standalone card (add-stock-menu.tsx), triggered by its
// own button next to this one. The two used to share one popover, with the
// current watchlist (up to 10 rows) and the remaining Top 20 (up to 19 rows)
// stacked inside a single max-h-96 scroll — measured at roughly one addable row
// visible before an unmarked internal scroll hid the other twelve. Splitting
// them gives each list its own height budget instead of the watchlist crowding
// out the add list every time.
//
// The popover mechanics — open state, outside click, Escape, focus return, and
// the mutation itself — are shared with the Home picker and the Add Stock card
// in use-watchlist-menu.ts; what is left here is the row layout and which bound
// applies to it.
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
}: {
  symbol: string;
  symbols: string[];
  min: number;
}) {
  const router = useRouter();
  const {
    open,
    close,
    toggleOpen,
    message,
    busy,
    busyMessage,
    container,
    trigger,
    mutate,
    menuProps,
  } = useWatchlistMenu();

  const atMin = symbols.length <= min;

  const row = (option: string) => {
    const blocked = atMin;

    return (
      <li
        key={option}
        // The three data attributes are the keyboard model's whole contract with
        // this component: `data-menu-row` marks the unit Up/Down moves between,
        // `data-menu-key` is what a typed letter matches, and
        // `data-menu-current` is where focus lands when the menu opens — the
        // stock being viewed, which is the row a visitor opening this menu is
        // most often navigating away from.
        role="none"
        data-menu-row
        data-menu-key={option}
        data-menu-current={option === symbol}
        className="flex items-center"
      >
        <button
          type="button"
          role="menuitem"
          // Roving focus: nothing in the menu is in the tab order, because the
          // menu owns its own navigation and hands Tab back out. Focus is moved
          // programmatically by the hook.
          tabIndex={-1}
          onClick={() => {
            close();
            router.push(`/todays-activity/${option}`);
          }}
          // rounded on the leading end only: this row is two buttons, and
          // rounding both would read as two pills with a seam rather than as
          // one row with a control on the end.
          //
          // primary-active rather than primary on the selected row, and this is
          // a contrast fix rather than a preference: --color-primary (#6695ff)
          // on surface-strong (#2b3f6c) measures 3.60:1 at 14px, under the
          // 4.5:1 AA floor, on the one row in the menu that has to read as
          // current. primary-active (#8db0ff) measures 4.82:1 on the same
          // plate. The system had already made this exact call once —
          // `nav-active text-primary-active` in the sidebar, with the note in
          // globals.css saying primary "fails at every alpha" — and the
          // dropdowns simply never followed. Same fix now applies to the three
          // date-filter rows in `app/news/page.tsx`.
          className={`flex-1 rounded-l-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
            option === symbol
              ? "bg-surface-strong text-primary-active"
              : "text-body hover:bg-surface-soft hover:text-ink"
          }`}
        >
          {option}
        </button>

        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          disabled={busy || blocked}
          onClick={() => mutate(option, "DELETE")}
          aria-label={`Remove ${option} from your watchlist`}
          // opacity-30 resolved to 1.51:1 light / 1.58:1 dark against the
          // overlay — the disabled state was invisible, on the control whose
          // disabled state was the *only* signal that the floor had been
          // reached. At 50% it measures 2.08:1 / 2.26:1: still recessive,
          // which is what a disabled control should be, but now perceptibly
          // different from the 5.24:1 enabled glyph beside it. The rest of the
          // job is done in words by the group header below, because a dimmed
          // control cannot state a reason and `disabled` also drops the button
          // out of the tab order.
          className="min-h-10 rounded-r-xl px-3 text-sm font-semibold text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
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
        // `aria-haspopup="menu"` is back, and this time the promise is kept:
        // the list below declares role="menu", takes focus when it opens, moves
        // on the arrow keys, jumps on a typed ticker and hands Tab back out.
        // It was removed once precisely because none of that was true — the
        // attribute is only honest alongside the behaviour.
        aria-haspopup="menu"
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
        <div className="panel-overlay absolute left-0 z-20 mt-2 max-h-96 w-60 overflow-y-auto rounded-2xl p-1">
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
              reached. This is where the floor is actually communicated — the
              dimmed control can only show that something is unavailable, never
              why. */}
          <p id="switcher-heading" className="px-4 py-1 text-xs font-semibold text-muted">
            Watchlist{" "}
            <span className="font-mono tabular-nums">({symbols.length})</span>
            {atMin && " · remove is unavailable at one stock"}
          </p>
          <ul {...menuProps} aria-labelledby="switcher-heading">
            {symbols.map((option) => row(option))}
          </ul>
        </div>
      )}
    </div>
  );
}
