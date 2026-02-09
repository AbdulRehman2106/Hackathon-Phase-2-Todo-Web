import React from 'react';

export interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorMessage component for displaying error states with optional retry action.
 *
 * Features:
 * - Clear error icon and message
 * - Optional error title
 * - Optional retry button
 * - Accessible with proper ARIA attributes
 * - Consistent error styling
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 p-5 shadow-md animate-shake ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Error Icon with animation */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <svg
              className="h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1">
          {title && (
            <h3 className="text-base font-bold text-red-900 mb-2 flex items-center gap-2">
              ⚠️ {title}
            </h3>
          )}
          <p className="text-sm font-medium text-red-800 leading-relaxed">{message}</p>

          {/* Retry Button with enhanced styling */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
