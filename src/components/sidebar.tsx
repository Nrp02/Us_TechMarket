"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SHORTCUTS } from "@/components/keyboard-shortcuts";

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

// The shortcut list is imported rather than restated so the hint printed on a
// row and the key that actually navigates cannot drift apart — the same
// single-source reasoning the significance rule already gets.
const KEY_BY_HREF = new Map(SHORTCUTS.map((s) => [s.href, s.key]));

export function Sidebar() {
  const pathname = usePathname();

  return (
    // The <aside> is the gutter; the name and the nav card are the two objects
    // in it. The card no longer has to fit the wordmark, which is what let its
    // vertical padding come down from py-6 to py-4 — it holds three rows now
    // and nothing else, so the old headroom was measuring a thing that had
    // moved out.
    <aside className="relative z-10 w-60 shrink-0">
      {/* No wordmark and no mark of our own in here. The name is the page's
          masthead now (see `app/page.tsx`), and the glyph that used to sit
          beside it is gone entirely.

          Dropping the glyph follows from what this interface is full of: a logo
          plate on every watchlist row, every Top Movers rank and every news
          thumbnail. A small blue mark of our own was competing inside that
          crowd rather than standing apart from it, and a product whose screen
          is covered in other companies' logos differentiates by not adding one
          more in the same place.

          The consequence worth knowing: the product's name now appears on Home
          only. News opens with "News" and Today's Activity with a ticker, so a
          visitor landing on either has the rail's three items for orientation
          and nothing that says what this is. That is a deliberate trade, not an
          oversight. */}
      {/* Sticky, because a card is only as tall as its content and the page
          beside it is several thousand pixels long. The <aside> stretches to
          full height as a flex item, which is what gives this something to
          stick within. */}
      <div className="panel-rail sticky top-6 flex flex-col px-4 py-4">
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const key = KEY_BY_HREF.get(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                // The shortcut is declared here and drawn nowhere. It WAS
                // printed on the row as muted mono — `g h`, `g n`, `g a` — and
                // that was removed on report: the owner read it as characters
                // somebody had forgotten to delete. Which is a fair reading.
                // Bare letters at the end of a nav row have no container, no
                // affordance and no punctuation saying "this is a key"; the
                // only thing marking them as different from the label is that
                // they are quieter, and quiet stray text reads as debris rather
                // than as an offer.
                //
                // The fix is not to shout. If it comes back it comes back as a
                // KEY — a plate with a border, sized and inset like a keycap —
                // because the shape is what carries the meaning, not the text.
                // Until then this attribute is the whole affordance: screen
                // readers announce it with the link, and the README documents
                // it for everyone else.
                aria-keyshortcuts={key ? `g ${key}` : undefined}
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
                // Hover is a translucent lift rather than the opaque
                // surface-soft plate: that token is baked over the panel canvas,
                // and a panel-coloured chip on the rail read as a patch of the
                // wrong material sitting on the glass. It is the same blue-white
                // the glass rim is made of (--color-glass-lift), not plain
                // white — on a field this saturated, neutral white light reads
                // as grey paint smeared on the pane.
                // py-3, not py-2, and the reason is the iPad rather than the
                // laptop. These three rows are the product's whole navigation
                // and they measured 206x36 — legal under WCAG 2.2 AA, which
                // asks 24x24, but six pixels under the 44 a finger is drawn
                // against on a touch screen, on the one control a visitor has
                // to hit before they can do anything else. The rail has the
                // room: it holds three items and nothing else, so the height
                // comes out of slack rather than out of density. The dense
                // controls — table rows, dropdown rows, the picker pill — keep
                // their size; this is a navigation fix, not a blanket inflation
                // of a product that is meant to be read close.
                className={`flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "nav-active text-primary-active"
                    : "text-body hover:bg-glass-lift hover:text-ink"
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
