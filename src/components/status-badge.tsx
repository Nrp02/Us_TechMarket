import { SIGNIFICANCE_RULE_TEXT } from "@/lib/significance";

// Renders the shared Significant Movement rule's verdict. The rule itself lives
// in lib/significance.ts — this only paints the result it is given.

export function StatusBadge({
  significant,
  onGlass = false,
}: {
  significant: boolean;
  onGlass?: boolean;
}) {
  return (
    <span
      title={SIGNIFICANCE_RULE_TEXT}
      // The tint is a flat token, not `bg-primary/10`. As an alpha it
      // composited against whatever sat behind it, so the same badge measured
      // 4.76:1 at rest and 4.49:1 on a hovered row — contrast that moved with
      // the pointer. The ring is baked for the same reason.
      //
      // The two states differ in fill, in dot colour, and in the word itself.
      // The ring was previously counted as a fourth channel; it measures
      // 1.45:1 light / 1.50:1 dark against its own plate, so it is an edge
      // rather than a signal and nothing should depend on it being read.
      // `onGlass` is the material switch, not a style variant. Two of this
      // badge's three call sites are inside a panel (the watchlist table and
      // Top Movers), where the baked tokens above are correct and a translucent
      // plate would break the One Translucent Layer Rule. The third is the
      // Today's Activity header, where the badge floats on the sky and those
      // same baked tokens paint a chip of panel-coloured paint onto the field.
      // Same component, same meaning, two materials — because the material is
      // decided by what is behind it.
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-2 pr-3 text-xs font-semibold ${
        significant
          ? onGlass
            ? "nav-active text-primary-active"
            : "bg-tint-primary text-primary ring-1 ring-accent-edge ring-inset"
          : onGlass
            ? "panel-chip text-body"
            : "bg-surface-strong text-body"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          significant ? (onGlass ? "bg-primary-active" : "bg-primary") : "bg-muted"
        }`}
        aria-hidden
      />
      {significant ? "Significant" : "Normal"}
    </span>
  );
}
