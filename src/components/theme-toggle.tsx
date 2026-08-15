"use client";

// Dark is the default: layout.tsx renders <html data-theme="dark"> and the
// pre-paint script there downgrades to light only when the visitor has stored
// that choice. This button is the only thing that writes the preference.
//
// The current theme is deliberately NOT held in React state. It already lives
// on <html>, and mirroring it into state would mean either rendering the wrong
// icon on the server (no way to read localStorage there) or correcting it in an
// effect, which flickers. Instead both icons render and the `dark:` variant
// picks one, so the markup is correct on first paint in either theme.

/** Shared with the pre-paint script in layout.tsx — keep the two in sync. */
export const THEME_STORAGE_KEY = "theme";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing can refuse storage. The theme still switches for this
      // page view; it just will not survive a reload.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      // size-9 (36px), not size-8 (32px). Both clear WCAG 2.2's 24px minimum,
      // so this was never a violation — but iPad is a named target and this is
      // the smallest hit area in the product, on glass. The icon stays 18px.
      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-surface-soft hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[18px]"
        aria-hidden
      >
        {/* Each icon shows the theme you would switch TO. */}
        <g className="hidden dark:block">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </g>
        <path
          className="block dark:hidden"
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        />
      </svg>
    </button>
  );
}
