import { SkeletonPage, SkeletonPanel } from "@/components/skeleton";

// The one page with a raised element, and the skeleton keeps that rank: the
// summary card is `panel-raised` here too, so the hierarchy is legible before
// a single word of the narrative exists.
export default function Loading() {
  return (
    <SkeletonPage>
      <div className="h-[92px]" aria-hidden />

      <div className="grid grid-cols-2 gap-3 min-[600px]:grid-cols-3 min-[600px]:gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonPanel key={i} className="h-[152px]" />
        ))}
      </div>

      {/* panel-raised, and with bars for the same reason as the rest: the one
          element on the page that outranks its neighbours should still look
          like it while it is empty. */}
      <div className="panel-raised flex flex-col gap-3 p-8 h-[420px]" aria-hidden>
        {["30%", "92%", "88%", "76%", "94%", "60%"].map((w, i) => (
          <span key={i} className="block h-3 rounded-full bg-surface-soft" style={{ width: w }} />
        ))}
      </div>
    </SkeletonPage>
  );
}
