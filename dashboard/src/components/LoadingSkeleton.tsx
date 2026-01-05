const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-dark-700 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-dark-700 rounded"></div>
        <div className="h-4 bg-dark-700 rounded"></div>
      </div>
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="bg-dark-800 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-dark-700 rounded w-24"></div>
          <div className="h-8 bg-dark-700 rounded w-32"></div>
        </div>
        <div className="h-12 w-12 bg-dark-700 rounded-full"></div>
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-dark-800 rounded animate-pulse"></div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;