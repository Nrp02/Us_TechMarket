import { HAS_LOGO, logoSrc } from "@/lib/logos";

// Fixed-width badge for every symbol (real icon, real wordmark, or
// lettermark fallback) so every row in a table/list lines up identically —
// wide enough to fit the widest wordmark mark (Micron, ~3.6:1) without
// clipping.
export function CompanyLogo({ symbol, name }: { symbol: string; name: string }) {
  const hasLogo = HAS_LOGO.has(symbol);

  return (
    <span
      className={`flex h-8 w-20 shrink-0 items-center justify-center rounded-full ${
        // Real logos need the always-light plate: their fills are hardcoded and
        // several are near-black, so a theme-aware surface would swallow them
        // in dark mode. The lettermark is plain text and stays theme-aware.
        hasLogo ? "bg-logo-plate" : "bg-surface-strong"
      }`}
      aria-hidden
    >
      {hasLogo ? (
        // eslint-disable-next-line @next/next/no-img-element -- static local SVG, no optimization needed
        <img src={logoSrc(symbol)} alt="" className="h-4 w-auto object-contain" />
      ) : (
        <span className="text-[11px] font-semibold text-body">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}
