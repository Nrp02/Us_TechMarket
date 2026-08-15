"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/todays-activity", label: "Today's Activity" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    // The rail is a panel too: it sits on the backdrop like everything else, so
    // it takes the same lit top edge and casts to the right. Without the shadow
    // the 1px border was the only thing separating a 240px column of canvas
    // from a page field it now differs from by six points of lightness.
    <aside className="relative z-10 flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas px-4 py-6 shadow-[var(--elev-2)]">
      <div className="flex items-center justify-between gap-2 px-2 pb-8">
        <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink">
          {/* The product had no mark of its own anywhere — the sidebar opened
              with plain text, on a page otherwise full of other companies'
              logos. Three bars at the session's own scale: a wordmark that is
              also the thing the product measures. */}
          <span className="flex h-5 items-end gap-[3px]" aria-hidden>
            <span className="w-[3px] rounded-full bg-primary/40" style={{ height: "10px" }} />
            <span className="w-[3px] rounded-full bg-primary/70" style={{ height: "16px" }} />
            <span className="w-[3px] rounded-full bg-primary" style={{ height: "20px" }} />
          </span>
          US TechMarket
        </span>
        <ThemeToggle />
      </div>
      {/* Labelled because the News page carries a second <nav> (its category
          tabs), and a landmark list offering "navigation" twice with nothing to
          tell them apart makes the visitor enter both to find out which is
          which. */}
      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              // Active state was a plate plus a colour, neither of which a
              // screen reader reports.
              aria-current={isActive ? "page" : undefined}
              // The active plate was surface-strong — grey — so the accent was
              // carried by 14px of text alone and the sidebar held no colour at
              // any time. A tinted plate plus a ring makes the state a shape as
              // well as a colour. Measured 5.18:1 dark / 4.76:1 light for the
              // text on the composited tint.
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-tint-primary text-primary ring-1 ring-accent-edge ring-inset"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
