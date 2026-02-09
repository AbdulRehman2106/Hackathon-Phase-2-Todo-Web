'use client';

import React from 'react';
import Button from '@/components/ui/Button';

/**
 * Error component for handling errors in the app directory.
 * This is a Next.js App Router error boundary.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to console in development
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl text-white">⚠️</span>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-center text-neutral-600 mb-6">
          We encountered an unexpected error. Don't worry, your data is safe.
          Try refreshing the page or go back to the homepage.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <h3 className="text-sm font-bold text-red-800 mb-2">Error Details (Dev Mode):</h3>
            <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            🔄 Try Again
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto"
          >
            🏠 Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
