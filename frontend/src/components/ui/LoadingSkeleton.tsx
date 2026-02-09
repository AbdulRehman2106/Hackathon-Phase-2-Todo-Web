import React from 'react';

export interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Enhanced LoadingSkeleton with shimmer effect
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-neutral-200 p-6 shadow-md animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Header with checkbox and title */}
          <div className="flex items-start gap-4 mb-4">
            {/* Checkbox skeleton */}
            <div className="w-6 h-6 bg-neutral-200 rounded-lg loading-skeleton"></div>

            {/* Title skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-neutral-200 rounded-lg w-3/4 loading-skeleton"></div>
              <div className="h-4 bg-neutral-200 rounded-lg w-full loading-skeleton"></div>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-neutral-200 rounded-lg loading-skeleton"></div>
              <div className="w-8 h-8 bg-neutral-200 rounded-lg loading-skeleton"></div>
            </div>
          </div>

          {/* Tags skeleton */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-7 w-20 bg-neutral-200 rounded-lg loading-skeleton"></div>
            <div className="h-7 w-24 bg-neutral-200 rounded-lg loading-skeleton"></div>
            <div className="h-7 w-28 bg-neutral-200 rounded-lg loading-skeleton"></div>
            <div className="h-7 w-16 bg-neutral-200 rounded-lg loading-skeleton"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
