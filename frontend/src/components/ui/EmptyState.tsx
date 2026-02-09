import React from 'react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Enhanced EmptyState component with beautiful animations and visuals
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No tasks yet',
  message = 'Get started by creating your first task',
  icon,
  action,
  className = '',
}) => {
  const defaultIcon = (
    <div className="relative">
      {/* Animated background circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-primary-100 rounded-full animate-pulse opacity-50"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-primary-200 rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Icon */}
      <div className="relative z-10 w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className={`text-center py-16 animate-fade-in ${className}`}>
      {/* Icon with animation */}
      <div className="flex justify-center mb-8">
        {icon || defaultIcon}
      </div>

      {/* Title with gradient */}
      <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3 animate-slide-up">
        {title}
      </h3>

      {/* Message */}
      <p className="text-base text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed animate-slide-up stagger-1">
        {message}
      </p>

      {/* Decorative elements */}
      <div className="flex justify-center gap-2 mb-8">
        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Action Button with enhanced styling */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform animate-scale-in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {action.label}
        </button>
      )}

      {/* Helpful tips */}
      <div className="mt-8 text-xs text-neutral-500 animate-fade-in stagger-2">
        <p>💡 Tip: Use keyboard shortcuts for faster task creation</p>
      </div>
    </div>
  );
};

export default EmptyState;
