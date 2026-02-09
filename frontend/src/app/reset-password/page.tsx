'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import PasswordStrength from '@/components/ui/PasswordStrength';
import { api } from '@/lib/api';

/**
 * Reset password content component that uses search params
 */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await api.auth.verifyResetToken(token);

        if (response.valid) {
          setIsValidToken(true);
          setUserEmail(response.email || '');
        } else {
          setError(response.error || 'Invalid or expired reset token');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to validate reset token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Form validation
  const validateForm = (): string | null => {
    if (!newPassword || !confirmPassword) {
      return 'All fields are required';
    }

    if (newPassword.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }

    // Check password strength
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return 'Password must contain uppercase, lowercase, and number';
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);

    try {
      // Call reset password API
      await api.auth.resetPassword(token, newPassword);

      // Show success message
      setSuccess(true);

      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <AuthLayout
        title="Validating reset link"
        subtitle="Please wait while we verify your reset token"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AuthLayout>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is invalid or has expired"
      >
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error || 'Invalid or expired reset link'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Password reset links expire after 15 minutes. Please request a new password reset.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-3">
            <Link href="/forgot-password">
              <Button variant="gradient" size="lg" fullWidth>
                Request new reset link
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="secondary" size="lg" fullWidth>
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout
        title="Password reset successful"
        subtitle="Your password has been updated"
      >
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
                  Password successfully reset
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    You can now sign in with your new password. Redirecting to sign in page...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Reset password form
  return (
    <AuthLayout
      title="Reset your password"
      subtitle={`Enter a new password for ${userEmail}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setError('')}
          />
        )}

        {/* New Password Input */}
        <div>
          <Input
            label="New password"
            type="password"
            id="new-password"
            name="new-password"
            autoComplete="new-password"
            required
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
          />
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-2">
              <PasswordStrength password={newPassword} />
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <Input
          label="Confirm password"
          type="password"
          id="confirm-password"
          name="confirm-password"
          autoComplete="new-password"
          required
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          placeholder="••••••••"
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
          {isLoading ? '🔄 Resetting password...' : '🔒 Reset password'}
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
    </AuthLayout>
  );
}

/**
 * Reset password page with Suspense boundary
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout
        title="Loading..."
        subtitle="Please wait"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AuthLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
