import { SkeletonPage, SkeletonPanel } from "@/components/skeleton";

// Home's shape: the header block, the five-card row, then the two paired
// panels. Heights are the measured resting heights of the real sections, so
// the skeleton does not resize the page when the content replaces it.
export default function Loading() {
  return (
    <SkeletonPage>
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row">
        <div className="h-[104px] w-full max-w-[520px]" aria-hidden />
        <SkeletonPanel className="h-[212px] w-full lg:w-[370px]" lines={4} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonPanel key={i} className="h-[180px]" lines={3} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 min-[1390px]:grid-cols-[minmax(0,1fr)_360px]">
        <SkeletonPanel className="h-[424px]" lines={5} />
        <SkeletonPanel className="h-[424px]" lines={5} />
      </div>
    </SkeletonPage>
  );
}
