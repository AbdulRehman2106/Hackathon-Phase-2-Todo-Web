'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-neutral-200 dark:border-neutral-700`}
        ></div>

        {/* Spinning ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-primary-600 border-t-transparent animate-spin absolute inset-0`}
        ></div>

        {/* Inner glow */}
        <div className="absolute inset-2 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
      </div>

      {message && (
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
