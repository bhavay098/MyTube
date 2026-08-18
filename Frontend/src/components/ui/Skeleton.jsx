const Skeleton = ({ className = "" }) => {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
};

const SkeletonVideoCard = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--surface) p-3">
      <Skeleton className="aspect-video w-full rounded-[1.1rem]" />

      <div className="mt-4 flex gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
    </div>
  );
};

const SkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonVideoCard key={i} />
      ))}
    </div>
  );
};

const SkeletonLine = ({ width = "w-full", height = "h-4" }) => {
  return <Skeleton className={`${width} ${height} rounded-md`} />;
};
export { Skeleton, SkeletonVideoCard, SkeletonGrid, SkeletonLine };

