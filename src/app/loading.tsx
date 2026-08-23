import { SkeletonPage, SkeletonPanel } from "@/components/skeleton";

// Home's shape: the session band, the five-card row, then the two paired
// panels. Heights are the measured resting heights of the real sections, so
// the skeleton does not resize the page when the content replaces it.
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonPanel className="h-[92px]" lines={2} />

      {/* The same grid string the real section carries, span included, so the
          skeleton and the page break to the same column counts at the same
          widths. */}
      <div className="grid grid-cols-2 gap-3 min-[600px]:gap-4 lg:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonPanel key={i} className="h-[180px]" lines={3} />
        ))}
      </div>

      {/* Tracks and gaps copied from page.tsx rather than approximated: the
          skeleton used gap-6 and a 360px track against the page's gap-10 /
          gap-6 and minmax(748px,1fr)_minmax(300px,360px), so the first paint
          settled sideways by 16px when the content arrived. */}
      <div className="grid grid-cols-1 gap-10 min-[1130px]:grid-cols-[minmax(748px,1fr)_minmax(300px,360px)] min-[1130px]:gap-6">
        <SkeletonPanel className="h-[424px]" lines={5} />
        <SkeletonPanel className="h-[424px]" lines={5} />
      </div>
    </SkeletonPage>
  );
}
