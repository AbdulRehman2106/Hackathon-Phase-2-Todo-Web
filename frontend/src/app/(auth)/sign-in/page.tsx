'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layouts/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';

/**
 * Sign-in page for existing user authentication.
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if already authenticated
    if (auth.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Form validation
  const validateForm = (): string | null => {
    if (!email || !password) {
      return 'All fields are required';
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

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Call signin API
      const response = await api.auth.signIn(email, password);

      // Store auth data
      auth.setAuth(response);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
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

        {/* Password Input */}
        <div>
          <Input
            label="Password"
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="••••••••"
          />
          {/* Forgot Password Link */}
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:underline transition-all duration-300"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? '🔄 Signing in...' : '🚀 Sign in'}
        </Button>

        {/* Sign-up Link */}
        <div className="text-center animate-fade-in">
          <p className="text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-primary-600 hover:text-primary-700 focus:outline-none focus:underline transition-all duration-300 hover:scale-105 inline-block"
            >
              Sign up →
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
