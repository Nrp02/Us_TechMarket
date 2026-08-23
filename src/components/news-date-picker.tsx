"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

// Was a native <details>/<summary> disclosure — the only one in the codebase.
// That kept the News page a server component with zero client JS, but native
// <details> has no outside-click-close behaviour (only the summary itself or
// Escape closes it), which made this the one dropdown in the app that stayed
// open when a visitor clicked elsewhere. Every other dropdown
// (symbol-switcher.tsx, add-stock-menu.tsx, watchlist-picker.tsx) is a client
// component with an explicit outside-click listener; this now matches them.
//
// Deliberately not built on use-watchlist-menu.ts: that hook also carries
// POST/DELETE mutation calls and a multi-row ARIA menu keyboard model for
// rows with two controls each (pick a stock / remove it). This is a flat list
// of navigation links with no mutation and no per-row controls, so it only
// needs the open/close/outside-click/Escape piece, copied rather than shared.

export type DateOption = {
  key: string;
  label: string;
  href: string;
  current: boolean;
  /** Rules a divider above this row — used above "All dates" only. */
  separator?: boolean;
};

export function NewsDatePicker({
  dateLabel,
  options,
}: {
  dateLabel: string;
  options: DateOption[];
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  // Only referenced while the list is rendered — see the note on menuId in
  // use-watchlist-menu.ts for why it is not set unconditionally.
  const listId = useId();

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative shrink-0">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        // 44px on a touch pointer, unchanged on a mouse — the same floor the
        // three watchlist menus take. See the note in use-watchlist-menu.ts.
        className="panel-control flex w-fit items-center gap-2 px-4 py-2 text-sm font-semibold text-ink pointer-coarse:min-h-11"
      >
        {dateLabel}
        <svg
          viewBox="0 0 20 20"
          className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
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
      </button>

      {open && (
        <div className="panel-overlay absolute right-0 z-20 mt-2 w-56 rounded-2xl p-1 [--overlay-origin:top_right]">
          <ul id={listId}>
            {options.map((option) => (
              <li
                key={option.key}
                className={
                  option.separator ? "mt-1 border-t border-hairline pt-1" : undefined
                }
              >
                <Link
                  href={option.href}
                  onClick={() => close()}
                  aria-current={option.current ? "page" : undefined}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    option.current
                      ? "bg-surface-strong text-primary-active"
                      : "text-body hover:bg-surface-soft hover:text-ink"
                  }`}
                >
                  {option.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
