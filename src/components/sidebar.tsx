"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";

// Same drawing convention as the theme toggle's sun/moon: 24x24 viewBox,
// currentColor stroke, round caps and joins, no fill. Nothing here is an icon
// package — three glyphs, authored to sit beside three labels.
//
// Stroke width takes the `active` flag rather than a fixed 1.5: DESIGN.md's
// own icon rule already names a 1.5-1.75px range, and until now every icon in
// the product sat at the bottom of it, so active and inactive nav items only
// ever differed by colour. 1.75 on the active icon is the range's own top
// end, not a new number — a second, non-colour channel for the one state the
// accent is already allowed to mark.
type IconProps = { active?: boolean };

function HomeIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.75 : 1.5} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]" aria-hidden>
      <path d="M4.5 11 12 4.5 19.5 11" />
      <path d="M6.5 9.5V19a1 1 0 0 0 1 1H10v-5.5h4V20h2.5a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

// A folded sheet with a headline rule over two body lines — the newspaper the
// product's own typography rule already reaches for ("a serif for the words
// against a grotesque for the instruments is the newspaper structure"), drawn
// rather than stated.
function NewsIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.75 : 1.5} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]" aria-hidden>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <path d="M7.5 8.5h9M7.5 11.5h9M7.5 14.5h5.5" />
    </svg>
  );
}

// A jagged line rather than a generic gauge or bar-chart mark — the same
// shape as the sparklines this page is full of, so the nav item looks like
// the thing it leads to instead of a stock "activity" glyph.
function ActivityIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.75 : 1.5} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]" aria-hidden>
      <path d="M3 14 7 7 10 17 14 5 17 13 21 9" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/news", label: "News", icon: NewsIcon },
  { href: "/todays-activity", label: "Today's Activity", icon: ActivityIcon },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    // The rail is a panel too: it sits on the backdrop like everything else, so
    // it takes the same lit top edge and casts to the right. Without the shadow
    // the 1px border was the only thing separating a 240px column of canvas
    // from a page field it now differs from by six points of lightness.
    //
    // Was shadow-[var(--elev-2)] alone — the comment above already claimed the
    // lit edge, the shadow never actually carried it. Matches the composed
    // form the News category track uses for the same reason: a non-panel-
    // shaped surface can take --edge-lit without pulling in the full `panel`
    // utility's face gradient, which is tuned to a 24px-radius card and fades
    // out within its own top 140px — meaningless spread down a full-height
    // rail with no radius to catch light on.
    <aside className="relative z-10 flex w-60 shrink-0 flex-col border-r border-hairline bg-canvas px-4 py-6 shadow-[var(--edge-lit),var(--elev-2)]">
      {/* Was one row: wordmark and toggle fighting `justify-between` for a
          208px budget (240 rail − 32 rail padding), then losing 16px more to
          this block's own px-2. The toggle's 36px plus its gap left the
          wordmark span about 148px, and "US TechMarket" at 18px/600 needs
          roughly 135 — close enough that it wrapped the moment font
          rendering nudged either number. Splitting the row removes the
          contest rather than trimming it to a fit that would break again the
          next time either piece changes. It also gives the mark its own
          rhythm on the way into the nav below, instead of sharing a line with
          a utility control that has nothing to do with brand. */}
      {/* No horizontal padding of its own — `nav` below has none either, and
          its Links stretch edge to edge across the rail's full 208px inner
          width (flex-col's default align-items: stretch). This block used to
          carry its own px-2, which put the badge's left edge and the
          toggle's right edge 8px inside where every nav pill's edge actually
          falls. One rail, one pair of edges: everything in it now measures
          from the same two verticals. */}
      <div className="flex flex-col gap-3 pb-8">
        <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink">
          {/* The product had no mark of its own anywhere — the sidebar opened
              with plain text, on a page otherwise full of other companies'
              logos. Three bars at the session's own scale, in stepped accent
              opacities: a wordmark that is also the thing the product
              measures.

              Freed from sharing a row with the toggle, the mark now sits in a
              tinted circle with an inset accent ring — the exact plate-and-
              ring recipe every other identity or state token in the system
              already carries (the active sidebar item below, the Significant
              badge, Top Movers' leading rank). The Pill-For-Tokens Rule calls
              for a full pill on anything standing for an identity, and this
              mark had never actually gotten one; the bars themselves are
              unchanged.

              Gap to the wordmark text is 2.5 (10px), not 3 (12px) — matching
              the icon-to-label gap every nav item below uses. Both are a
              small mark beside its text; there was no reason for the two to
              measure differently. */}
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint-primary ring-1 ring-accent-edge ring-inset">
            <span className="flex h-5 items-end gap-[3px]" aria-hidden>
              <span className="w-[3px] rounded-full bg-primary/40" style={{ height: "10px" }} />
              <span className="w-[3px] rounded-full bg-primary/70" style={{ height: "16px" }} />
              <span className="w-[3px] rounded-full bg-primary" style={{ height: "20px" }} />
            </span>
          </span>
          US TechMarket
        </span>
        {/* Was wrapped in flex justify-end, pushed to the rail's right edge
            alone on its row with ~150px of empty space to its left and
            nothing adjacent to read it against — an isolated mark rather
            than a positioned control. No wrapper needed: ThemeToggle sets
            its own fixed size, so as a bare flex-col child it falls to the
            column's natural start — the same left edge the badge, the
            wordmark and every nav pill already share. */}
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
          const Icon = item.icon;

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
              //
              // The icon carries no colour decision of its own — stroke is
              // currentColor, so it is exactly as blue as the label beside it
              // and exactly as grey when it isn't. Nothing added a fourth
              // place the accent can appear.
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-tint-primary text-primary ring-1 ring-accent-edge ring-inset"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              }`}
            >
              <Icon active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
