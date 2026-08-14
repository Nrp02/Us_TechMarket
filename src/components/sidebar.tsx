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
    <aside className="flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas px-4 py-6">
      <div className="flex items-center justify-between gap-2 px-2 pb-8">
        <span className="text-lg font-semibold tracking-tight text-ink">
          US TechMarket
        </span>
        <ThemeToggle />
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-surface-strong text-primary"
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
