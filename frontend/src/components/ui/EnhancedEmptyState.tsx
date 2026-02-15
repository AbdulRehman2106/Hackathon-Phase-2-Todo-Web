'use client';

interface EnhancedEmptyStateProps {
  type: 'no-tasks' | 'no-results' | 'error' | 'success';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EnhancedEmptyState({
  type,
  title,
  description,
  action,
}: EnhancedEmptyStateProps) {
  const getIllustration = () => {
    switch (type) {
      case 'no-tasks':
        return (
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-7xl animate-float">📋</span>
            </div>
          </div>
        );
      case 'no-results':
        return (
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-7xl animate-float">🔍</span>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-7xl">❌</span>
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="relative w-48 h-48 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-7xl animate-bounce-in">✅</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      {getIllustration()}

      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 text-center">
        {title}
      </h3>

      <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md mb-8">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
