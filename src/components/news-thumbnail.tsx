import { FINNHUB_LOGO, logoSrc } from "@/lib/logos";

// Thumbnails are always a mark, never article photography: the company's logo
// for a per-symbol article, and the data provider's mark for market news, which
// belongs to no single company.
//
// The lettermark branch below is unreachable today and is kept only as a guard.
// `related_symbols` cannot hold a non-Top-20 ticker — `mentionsSymbol` rejects
// anything absent from `SYMBOL_ALIASES` — and `logos.test.ts` asserts all 20
// have a mark, so `logoSrc` never returns null here. It would start mattering
// if either of those changed.
//
// Note it does *not* cover the failure that can actually happen: an unreachable
// CDN resolves to an empty plate, because that is an image that fails to load
// rather than a null src, and catching it would need an onError handler and so
// a client component.
//
// Finnhub's image field is not used. It supplied an image for nearly every
// article, but only 10 distinct URLs across 90 articles — 69 sharing one Yahoo
// Finance placeholder and 13 the Reuters publisher logo — so the page rendered
// the same two pictures over and over. Dropping images also removes the need
// for a client-side onError fallback, leaving this a server component.

// One fixed-width plate for every state so every thumbnail in the list lines up
// identically. `max-w-full` on the mark lets a wide wordmark scale down rather
// than spill past the plate.
const PLATE = "flex h-20 w-44 shrink-0 items-center justify-center rounded-xl px-4";
// Real marks get the always-light plate (they are drawn in their own brand
// colours and several are near-black); the lettermark stays theme-aware.
const LOGO_PLATE = `${PLATE} bg-logo-plate`;
const TEXT_PLATE = `${PLATE} bg-surface-strong`;

export function NewsThumbnail({ symbol }: { symbol: string | null }) {
  // Market news carries no tickers at all — that is how the category is
  // identified — so a null symbol is exactly the market case.
  const src = symbol ? logoSrc(symbol) : FINNHUB_LOGO;

  if (src) {
    return (
      <span className={LOGO_PLATE} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN mark; Brandfetch requires these URLs be hotlinked, so next/image optimization (which refetches server-side) is not an option */}
        <img src={src} alt="" className="h-9 max-w-full object-contain" />
      </span>
    );
  }

  return (
    <span className={TEXT_PLATE} aria-hidden>
      <span className="text-sm font-semibold text-body">{symbol}</span>
    </span>
  );
}
