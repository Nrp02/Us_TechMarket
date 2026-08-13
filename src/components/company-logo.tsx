import { LOGOS } from "@/lib/logos";

export function CompanyLogo({ symbol, name }: { symbol: string; name: string }) {
  const glyph = LOGOS[symbol];

  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-strong"
      aria-hidden
    >
      {glyph ? (
        <svg viewBox="0 0 24 24" className="size-4" fill={`#${glyph.hex}`}>
          <path d={glyph.path} />
        </svg>
      ) : (
        <span className="text-[11px] font-semibold text-body">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}
