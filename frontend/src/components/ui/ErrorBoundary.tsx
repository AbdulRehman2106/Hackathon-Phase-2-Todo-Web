'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully.
 * Prevents the entire app from crashing when a component error occurs.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-8 animate-scale-in">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
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
              Try refreshing the page or contact support if the problem persists.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <h3 className="text-sm font-bold text-red-800 mb-2">Error Details (Dev Mode):</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                🔄 Try Again
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.href = '/dashboard'}
                className="w-full sm:w-auto"
              >
                🏠 Go to Dashboard
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                ↻ Refresh Page
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t-2 border-neutral-200 text-center">
              <p className="text-sm text-neutral-500">
                Need help? Contact support at{' '}
                <a
                  href="mailto:support@example.com"
                  className="text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  support@example.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
