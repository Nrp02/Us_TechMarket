"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The page header doubles as the navigation for this section: the ticker itself
// is the button, and it opens the watchlist. There is deliberately no secondary
// tab bar on Today's Activity — the sidebar plus this switcher is the whole of it.

export function SymbolSwitcher({
  symbol,
  symbols,
}: {
  symbol: string;
  symbols: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
          className="absolute left-0 z-10 mt-2 w-44 overflow-hidden rounded-2xl border border-hairline bg-canvas py-1 shadow-lg"
        >
          {symbols.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push(`/todays-activity/${option}`);
              }}
              className={`block w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                option === symbol
                  ? "bg-surface-strong text-primary"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
