"use client";

import { useRouter } from "next/navigation";

import { DATA_ARRIVED } from "@/components/meteors";
import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
// Aliased because the Escape listener below is on `document` and takes the DOM
// KeyboardEvent, while the menu handler is a React synthetic one. Two different
// types, one name — importing it unaliased silently breaks the other.
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

// The watchlist is edited from two places — the Home picker and the Today's
// Activity header switcher — and both were written separately against the same
// cookie and the same API. They had already drifted: one cleared its error on
// close and the other kept a stale 409 around, one declared `role="menu"` and
// the other declared `aria-haspopup="menu"` and no menu, and only one of them
// returned focus anywhere. Every one of those was a separate bug in a component
// that is supposed to be the same component twice.
//
// So the popover behaviour lives here once: open/close, the outside-click and
// Escape handling, the focus contract, the keyboard model, and the single
// mutation both menus make. What stays in each component is only what genuinely
// differs — how the rows are laid out and which bound applies to which row.

/** How long a type-ahead buffer survives between keystrokes. */
const TYPEAHEAD_RESET_MS = 700;

// These three are module scope rather than closures inside the hook, and not
// only to satisfy the exhaustive-deps lint: none of them reads anything from
// the hook's state, so declaring them per render would be three new function
// identities on every keystroke for no gain.

function itemsIn(row: HTMLElement): HTMLElement[] {
  // Disabled controls are skipped rather than focused-but-inert. The APG allows
  // either; this codebase already states every bound in words next to the list,
  // so a visitor never has to land on a dead row to learn why it is dead.
  return [
    ...row.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'),
  ];
}

function rowOf(el: Element | null): HTMLElement | null {
  return el instanceof Element
    ? (el.closest<HTMLElement>("[data-menu-row]") ?? null)
    : null;
}

function focusRow(row: HTMLElement | undefined, fromEnd = false) {
  const items = row ? itemsIn(row) : [];
  (fromEnd ? items[items.length - 1] : items[0])?.focus();
}

export function useWatchlistMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // `pending` from useTransition covers ONLY the router.refresh() at the end of
  // a mutation. The fetch before it — the round trip that actually takes the
  // time — was outside every state the menus could see, so the whole request
  // window rendered as "nothing is happening". This covers it.
  const [sending, setSending] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  // The list itself, not the popover around it. `role="menu"` expects menuitem
  // children, and these popovers also carry a group header and a `role="status"`
  // line — putting the role on the panel would declare a menu containing two
  // things that are not menu items. The role goes on the <ul>; the messages stay
  // outside it, where they were already announced.
  const menu = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });
  // The popover is rendered only while open, so `aria-controls` on the trigger
  // has nothing to point at when it is closed — which is why each consumer
  // passes `open ? menuId : undefined` rather than the id unconditionally. A
  // reference to a missing element is worse than no reference: it tells a
  // screen reader there is a thing to go to and then does not have one.
  const menuId = useId();

  // A 409 from a previous opening is stale the moment the popover closes, so
  // closing clears it. Doing this in an effect on `open` would be a cascading
  // render; every close already goes through here.
  //
  // `restoreFocus` is the whole focus contract, and it is deliberately not
  // unconditional. Escape passes true: without it focus falls to <body> and a
  // keyboard visitor loses their place on the page. An outside click passes
  // false, because the pointer has already put focus where the visitor asked
  // for it and dragging it back to the trigger would fight them.
  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setMessage(null);
    if (restoreFocus) trigger.current?.focus();
  }, []);

  function toggleOpen() {
    if (open) close();
    else setOpen(true);
  }

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
  }, [open, close]);

  // --- The keyboard model ---------------------------------------------------
  //
  // The popover now declares `role="menu"`, which is a promise with a spec
  // attached rather than a label: a menu is expected to take focus when it
  // opens, move on the arrow keys, jump on a typed letter, and hand focus back
  // out on Tab. Declaring the role and shipping a Tab-through list of buttons
  // is worse than declaring nothing, which is exactly why the role used to be
  // absent here and why the comment that removed it said so.
  //
  // Rows rather than items are the unit of Up/Down, because one of the three
  // menus puts two controls on a row (choose a stock, remove it). Left/Right
  // moves inside a row; a row with a single control simply has nowhere to go.

  const rows = useCallback((): HTMLElement[] => {
    const root = menu.current;
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>("[data-menu-row]")].filter(
      (row) => itemsIn(row).length > 0,
    );
  }, []);

  // Opening puts focus in the menu, on the row the visitor is most likely to
  // want: the one marked current (the stock being viewed) when there is one,
  // otherwise the first. Without this every opening cost a Tab press before the
  // menu could be used at all — the single most common keyboard complaint about
  // a popover, and the reason `aria-expanded` alone was never enough.
  useEffect(() => {
    if (!open) return;
    const root = menu.current;
    if (!root) return;

    const preferred = root.querySelector<HTMLElement>(
      '[data-menu-current="true"] [role="menuitem"]:not([disabled])',
    );
    if (preferred) preferred.focus();
    else focusRow(rows()[0]);

    typeahead.current = { buffer: "", at: 0 };
  }, [open, rows]);

  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    const all = rows();
    if (!all.length) return;

    const current = rowOf(document.activeElement);
    const index = current ? all.indexOf(current) : -1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusRow(all[index < 0 ? 0 : (index + 1) % all.length]);
        return;
      case "ArrowUp":
        event.preventDefault();
        focusRow(all[index <= 0 ? all.length - 1 : index - 1]);
        return;
      case "Home":
        event.preventDefault();
        focusRow(all[0]);
        return;
      case "End":
        event.preventDefault();
        focusRow(all[all.length - 1], true);
        return;
      case "ArrowRight":
      case "ArrowLeft": {
        if (!current) return;
        const items = itemsIn(current);
        const at = items.indexOf(document.activeElement as HTMLElement);
        if (at < 0 || items.length < 2) return;
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : items.length - 1;
        items[(at + step) % items.length]?.focus();
        return;
      }
      case "Tab":
        // A menu does not trap: Tab closes it and moves on. Focus goes back to
        // the trigger FIRST and the event is not prevented, so the browser then
        // computes the next element from the trigger — which is where the
        // visitor's place on the page actually is. Closing without restoring
        // drops focus to <body>, and Tab from <body> restarts at the top of the
        // document, which is worse than doing nothing.
        close(true);
        return;
      default:
        break;
    }

    // Type-ahead. Twenty tickers is exactly the size where hunting with the
    // arrow keys is slower than typing: N-V goes to NVDA in two keystrokes
    // against six presses of Down.
    if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey)
      return;

    const now = Date.now();
    const state = typeahead.current;
    state.buffer =
      now - state.at > TYPEAHEAD_RESET_MS
        ? event.key.toLowerCase()
        : state.buffer + event.key.toLowerCase();
    state.at = now;

    const match = all.find((row) =>
      (row.dataset.menuKey ?? "").toLowerCase().startsWith(state.buffer),
    );
    if (match) {
      event.preventDefault();
      focusRow(match);
    }
  }

  // Both bounds are enforced by the API over the cookie. The disabled states in
  // the menus only spare the visitor a pointless request; when one gets through
  // anyway, the API's own message is what gets shown, never a guess at it.
  async function mutate(symbol: string, method: "POST" | "DELETE") {
    setMessage(null);
    setSending(true);

    const res = await fetch("/api/watchlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setMessage(body.error ?? "Could not update the watchlist.");
      setSending(false);
      return;
    }

    // Re-render the server components against the new cookie.
    // The watchlist round-trip is the only request the browser itself makes in
    // this product, so it is the only place a "new data arrived" signal can
    // honestly originate. The sky listens; nothing else does.
    window.dispatchEvent(new Event(DATA_ARRIVED));
    startTransition(() => router.refresh());
    setSending(false);
  }

  // One flag for both halves of the wait, because a visitor does not care
  // which one they are in. BUSY IS NOT THE SAME AS BLOCKED, and until now the
  // menus rendered them identically: `disabled:opacity-50` was the only signal
  // either state had, so "working on it" and "you cannot do this" looked the
  // same. Busy now speaks, in the same `role="status"` slot the errors use, so
  // the difference arrives through a channel dimming cannot occupy.
  const busy = sending || pending;

  return {
    busy,
    busyMessage: busy ? "Updating your watchlist…" : null,
    open,
    close,
    toggleOpen,
    message,
    pending,
    container,
    trigger,
    mutate,
    /** Put on the trigger as `aria-controls={open ? menuId : undefined}`. */
    menuId,
    /** Spread onto the <ul> holding the rows. Carries the role and key model. */
    menuProps: {
      id: menuId,
      ref: menu,
      role: "menu" as const,
      onKeyDown: onMenuKeyDown,
    },
  };
}
