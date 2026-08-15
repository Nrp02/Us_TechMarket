"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

// The watchlist is edited from two places — the Home picker and the Today's
// Activity header switcher — and both were written separately against the same
// cookie and the same API. They had already drifted: one cleared its error on
// close and the other kept a stale 409 around, one declared `role="menu"` and
// the other declared `aria-haspopup="menu"` and no menu, and only one of them
// returned focus anywhere. Every one of those was a separate bug in a component
// that is supposed to be the same component twice.
//
// So the popover behaviour lives here once: open/close, the outside-click and
// Escape handling, the focus contract, and the single mutation both menus make.
// What stays in each component is only what genuinely differs — how the rows
// are laid out and which bound applies to which row.

export function useWatchlistMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // A 409 from a previous opening is stale the moment the popover closes, so
  // closing clears it. Doing this in an effect on `open` would be a cascading
  // render; every close already goes through here.
  //
  // `restoreFocus` is the whole focus contract, and it is deliberately not
  // unconditional. Escape passes true: without it focus falls to <body> and a
  // keyboard visitor loses their place on the page. An outside click passes
  // false, because the pointer has already put focus where the visitor asked
  // for it and dragging it back to the trigger would fight them.
  function close(restoreFocus = false) {
    setOpen(false);
    setMessage(null);
    if (restoreFocus) trigger.current?.focus();
  }

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
    // `close` is intentionally not a dependency: it is redeclared every render
    // and only touches setState and a ref, so re-subscribing on it would tear
    // the listeners down and rebuild them on every keystroke for no gain.
  }, [open]);

  // Both bounds are enforced by the API over the cookie. The disabled states in
  // the menus only spare the visitor a pointless request; when one gets through
  // anyway, the API's own message is what gets shown, never a guess at it.
  async function mutate(symbol: string, method: "POST" | "DELETE") {
    setMessage(null);

    const res = await fetch("/api/watchlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setMessage(body.error ?? "Could not update the watchlist.");
      return;
    }

    // Re-render the server components against the new cookie.
    startTransition(() => router.refresh());
  }

  return {
    open,
    close,
    toggleOpen,
    message,
    pending,
    container,
    trigger,
    mutate,
  };
}
