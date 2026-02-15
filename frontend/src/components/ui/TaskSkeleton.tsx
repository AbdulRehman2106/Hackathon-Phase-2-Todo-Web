'use client';

export default function TaskSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-start gap-4">
            {/* Checkbox skeleton */}
            <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>

            <div className="flex-1 space-y-3">
              {/* Title skeleton */}
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>

              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-neutral-100 dark:bg-neutral-700/50 rounded w-full"></div>
                <div className="h-4 bg-neutral-100 dark:bg-neutral-700/50 rounded w-5/6"></div>
              </div>

              {/* Tags skeleton */}
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
              </div>
            </div>

            {/* Actions skeleton */}
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
