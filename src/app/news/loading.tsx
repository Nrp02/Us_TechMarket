import { SkeletonPage, SkeletonPanel } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage>
      <div className="h-[84px]" aria-hidden />
      {/* The tab track is a pill of the same material, so it is part of the
          shape rather than something that appears late. */}
      <div className="panel-track h-[52px] w-[528px] max-w-full" aria-hidden />
      <SkeletonPanel className="h-[420px]" lines={5} />
    </SkeletonPage>
  );
}
