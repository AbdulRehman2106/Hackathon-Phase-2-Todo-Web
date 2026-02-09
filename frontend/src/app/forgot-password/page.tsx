'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { api } from '@/lib/api';

/**
 * Forgot password page for requesting password reset email.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form validation
  const validateForm = (): string | null => {
    if (!email) {
      return 'Email address is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Call forgot password API
      await api.auth.forgotPassword(email);

      // Show success message
      setSuccess(true);
      setEmail(''); // Clear email field
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      {success ? (
        // Success message
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Check your email
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    If an account exists with this email, you will receive a password reset link shortly.
                    The link will expire in 15 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back to sign-in link */}
          <div className="text-center">
            <Link
              href="/sign-in"
              className="font-semibold text-primary-600 hover:text-primary-700 focus:outline-none focus:underline transition-all duration-300 hover:scale-105 inline-block"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        // Form
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => setError('')}
            />
          )}

          {/* Email Input */}
          <Input
            label="Email address"
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="you@example.com"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Sending...' : '📧 Send reset link'}
          </Button>

          {/* Back to sign-in link */}
          <div className="text-center animate-fade-in">
            <p className="text-sm text-neutral-600">
              Remember your password?{' '}
              <Link
                href="/sign-in"
                className="font-semibold text-primary-600 hover:text-primary-700 focus:outline-none focus:underline transition-all duration-300 hover:scale-105 inline-block"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
