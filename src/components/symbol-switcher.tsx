"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { TOP_20_SYMBOLS } from "@/lib/symbols";

// The page header doubles as the navigation for this section: the ticker itself
// is the button, and it opens the watchlist. There is deliberately no secondary
// tab bar on Today's Activity — the sidebar plus this switcher is the whole of it.
//
// The menu also edits the watchlist, so a stock can be added or dropped without
// going back to the Home page. Both bounds are enforced by the API over the
// cookie; the disabled states here only spare the visitor a pointless request,
// and the API's own message is shown when one gets through anyway.

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
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const watched = new Set(symbols);
  const unwatched = TOP_20_SYMBOLS.filter((s) => !watched.has(s));
  const atMin = symbols.length <= min;
  const atMax = symbols.length >= max;

  async function mutate(target: string, method: "POST" | "DELETE") {
    setMessage(null);

    const res = await fetch("/api/watchlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: target }),
    });

    if (!res.ok) {
      // Surfaced rather than swallowed: at the cap or the floor this is the
      // only feedback the visitor gets.
      const body = (await res.json()) as { error?: string };
      setMessage(body.error ?? "Could not update the watchlist.");
      return;
    }

    // Re-render the server components against the new cookie. Dropping the
    // stock being viewed is fine and does not navigate away — every Top 20
    // stock has cached prices, so the page keeps working and the stock simply
    // moves down into the "add" group.
    startTransition(() => router.refresh());
  }

  const row = (option: string, action: "add" | "remove") => {
    const blocked = action === "add" ? atMax : atMin;

    return (
      <li key={option} className="flex items-center">
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setOpen(false);
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
          className="px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
        >
          {action === "add" ? "+" : "−"}
        </button>
      </li>
    );
  };

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
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
        <div
          role="menu"
          className="absolute left-0 z-10 mt-2 max-h-96 w-60 overflow-y-auto rounded-2xl border border-hairline bg-canvas py-1 shadow-lg"
        >
          {message && (
            <p className="mx-2 my-1 rounded-xl bg-semantic-down/10 px-3 py-2 text-xs font-medium text-semantic-down">
              {message}
            </p>
          )}

          <p className="px-4 py-1 text-xs font-semibold text-muted">
            Watchlist ({symbols.length}/{max})
          </p>
          <ul>{symbols.map((option) => row(option, "remove"))}</ul>

          {unwatched.length > 0 && (
            <>
              <p className="mt-1 border-t border-hairline px-4 pb-1 pt-2 text-xs font-semibold text-muted">
                Add from Top 20
              </p>
              <ul>{unwatched.map((option) => row(option, "add"))}</ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
