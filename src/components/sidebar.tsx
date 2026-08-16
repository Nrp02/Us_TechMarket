"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// One drawing convention for every glyph in the product: 24x24 viewBox,
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
    // The <aside> is now only the gutter; the card inside it is the object.
    //
    // 272px = the card's 240px plus 16px of padding either side, so the card
    // keeps the exact width the old flush rail had. That is deliberate rather
    // than tidy: the wordmark measures 172px intrinsic against 207px of inner
    // width, and an earlier pass already lost that fight once when the budget
    // shrank. Widening the shell rather than narrowing the card means the
    // 35px of headroom is untouched and nothing inside can reflow.
    //
    // py-8 matches the content column's own top padding, so the card's top
    // edge lines up with the page title beside it instead of floating at some
    // unrelated height.
    <aside className="relative z-10 w-60 shrink-0">
      {/* Sticky, because a card is only as tall as its content and the page
          beside it is several thousand pixels long. The <aside> stretches to
          full height as a flex item, which is what gives this something to
          stick within. */}
      <div className="panel-rail sticky top-6 flex flex-col px-4 py-6">
        {/* No horizontal padding of its own — `nav` below has none either, and
            its Links stretch edge to edge across the rail's full 208px inner
            width (flex-col's default align-items: stretch). One rail, one pair
            of edges: everything in it measures from the same two verticals.

            This was a two-row flex column, split so the wordmark and the theme
            toggle stopped contesting a 208px budget. With the toggle gone the
            contest is gone with it, so the wrapper collapses back to the one
            thing it now holds. */}
        <div className="pb-8">
          <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-ink">
            {/* The product had no mark of its own anywhere — the sidebar opened
                with plain text, on a page otherwise full of other companies'
                logos. Three bars at the session's own scale, in stepped accent
                opacities: a wordmark that is also the thing the product
                measures.

                The mark sits in a tinted circle with an inset accent ring — the
                exact plate-and-ring recipe every other identity or state token
                in the system already carries (the active sidebar item below, the
                Significant badge, Top Movers' leading rank). The Pill-For-Tokens
                Rule calls for a full pill on anything standing for an identity.

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
                // any time. A translucent plate, a lit ring and a soft glow make
                // the state a shape as well as a colour — see `nav-active` in
                // globals.css for why the label is primary-active rather than
                // primary, which fails at every alpha.
                //
                // The icon carries no colour decision of its own — stroke is
                // currentColor, so it is exactly as blue as the label beside it
                // and exactly as grey when it isn't. Nothing added a fourth
                // place the accent can appear.
                //
                // Hover is a translucent white lift rather than the opaque
                // surface-soft plate: that token is baked over the panel canvas,
                // and a panel-coloured chip on the rail read as a patch of the
                // wrong material sitting on the glass.
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "nav-active text-primary-active"
                    : "text-body hover:bg-white/[0.055] hover:text-ink"
                }`}
              >
                <Icon active={isActive} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
