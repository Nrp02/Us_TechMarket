import { logoSrc } from "@/lib/logos";

// Fixed-width badge for every symbol so every row in a table/list lines up
// identically.
//
// `max-w-full` caps a wordmark at the plate's content width, and because the
// mark keeps its aspect ratio that cap sets its drawn *height* — so the wider
// the lockup, the smaller it renders. Measured at the sizes below: square
// symbols draw the full 16px, and the four wordmarks that do not fit come out
// at micron 15.4px, intuit 14.5px, Qualcomm 13.2px and servicenow 10.5px.
// That is why the padding here is `px-1` rather than `px-2` — the 8px it gives
// back is worth about a pixel of height on each of those four, and costs the
// square marks nothing since they are height-capped well before the width cap.
// servicenow at 6.9:1 is the weakest badge in the set and the one to revisit
// first if a legibility complaint comes back from the gate.
export function CompanyLogo({ symbol, name }: { symbol: string; name: string }) {
  const src = logoSrc(symbol);

  return (
    <span
      className={`flex h-8 w-20 shrink-0 items-center justify-center rounded-full px-1 ${
        // Real marks need the always-light plate: they are drawn in their own
        // brand colours and several are near-black, so a theme-aware surface
        // would swallow them in dark mode. The lettermark is plain text and
        // stays theme-aware.
        src ? "bg-logo-plate" : "bg-surface-strong"
      }`}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote CDN mark; Brandfetch requires these URLs be hotlinked, so next/image optimization (which refetches server-side) is not an option
        <img
          src={src}
          alt=""
          // Same reasoning as news-thumbnail: the fixed h-8 w-20 plate already
          // reserves the box, so lazy loading costs no layout stability and
          // saves the CDN round trips for rows below the fold.
          loading="lazy"
          decoding="async"
          className="h-4 max-w-full object-contain"
        />
      ) : (
        <span className="text-[11px] font-semibold text-body">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}
