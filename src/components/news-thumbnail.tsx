import { logoNudge, logoSrc } from "@/lib/logos";
import type { NewsCategory } from "@/lib/news-category";

// Thumbnails are always a mark, never article photography: company logo, then
// ticker lettermark for companies with no freely-licensed logo, then a category
// icon for market news that belongs to no single company.
//
// Finnhub's image field is not used. It supplied an image for nearly every
// article, but only 10 distinct URLs across 90 articles — 69 sharing one Yahoo
// Finance placeholder and 13 the Reuters publisher logo — so the page rendered
// the same two pictures over and over. Dropping images also removes the need
// for a client-side onError fallback, leaving this a server component.

const ICONS: Record<NewsCategory, string> = {
  company: "M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4",
  industry: "M2 20h20M4 20V9l5 3V9l5 3V4l6 4v12",
  market: "M3 17l6-6 4 4 8-8M21 7h-5m5 0v5",
};

// One fixed-width plate for every state (real icon, real wordmark, ticker
// lettermark, or category icon) so every thumbnail in the list lines up
// identically — wide enough to fit the widest wordmark mark (Micron, ~3.6:1)
// without clipping.
const PLATE =
  "flex h-20 w-44 shrink-0 items-center justify-center rounded-xl";
// Real logos get the always-light plate (their fills are hardcoded and several
// are near-black); the text-based states stay on the theme-aware surface.
const LOGO_PLATE = `${PLATE} bg-logo-plate`;
const TEXT_PLATE = `${PLATE} bg-surface-strong`;

export function NewsThumbnail({
  category,
  logoSymbol,
  symbol,
}: {
  category: NewsCategory;
  logoSymbol: string | null;
  symbol: string | null;
}) {
  if (logoSymbol) {
    return (
      <span className={LOGO_PLATE} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG, no optimization needed */}
        <img
          src={logoSrc(logoSymbol)}
          alt=""
          className={`h-9 w-auto object-contain ${logoNudge(logoSymbol)}`}
        />
      </span>
    );
  }

  if (symbol) {
    return (
      <span className={TEXT_PLATE} aria-hidden>
        <span className="text-sm font-semibold text-body">{symbol}</span>
      </span>
    );
  }

  return (
    <span className={TEXT_PLATE} aria-hidden>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7 text-muted"
      >
        <path d={ICONS[category]} />
      </svg>
    </span>
  );
}
