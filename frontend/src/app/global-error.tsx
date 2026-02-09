'use client';

import React from 'react';

/**
 * Global error component for handling errors in the root layout.
 * This catches errors that occur in the root layout itself.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #fef2f2, #fed7aa)',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: '42rem',
            width: '100%',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '2px solid #fecaca',
            padding: '2rem',
            textAlign: 'center',
          }}>
            {/* Error Icon */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '1.5rem',
            }}>
              ⚠️
            </div>

            {/* Error Title */}
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#dc2626',
            }}>
              Critical Error
            </h1>

            {/* Error Message */}
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
            }}>
              A critical error occurred. Please refresh the page or contact support.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '0.5rem',
                textAlign: 'left',
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#991b1b',
                  marginBottom: '0.5rem',
                }}>
                  Error Details (Dev Mode):
                </h3>
                <pre style={{
                  fontSize: '0.75rem',
                  color: '#b91c1c',
                  overflow: 'auto',
                  maxHeight: '10rem',
                  whiteSpace: 'pre-wrap',
                }}>
                  {error.message}
                </pre>
                {error.digest && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#dc2626',
                    marginTop: '0.5rem',
                  }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
