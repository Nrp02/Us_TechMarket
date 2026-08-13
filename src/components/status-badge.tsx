// Renders the shared Significant Movement rule's verdict. The rule itself lives
// in lib/significance.ts — this only paints the result it is given.

export function StatusBadge({ significant }: { significant: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        significant
          ? "bg-primary/10 text-primary"
          : "bg-surface-strong text-body"
      }`}
    >
      {significant ? "Significant" : "Normal"}
    </span>
  );
}
