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
 * Sign-up page for new user registration.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (!email || !password || !confirmPassword) {
      return 'All fields are required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    // Password validation
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return 'Passwords do not match';
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
      // Call signup API
      const response = await api.auth.signUp(email, password);

      // Store auth data
      auth.setAuth(response);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
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
      title="Create your account"
      subtitle="Start organizing your tasks today"
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
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          autoComplete="new-password"
          required
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          helperText="Must be at least 8 characters"
          placeholder="••••••••"
        />

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
          {isLoading ? '🔄 Creating account...' : '🎯 Create Account'}
        </Button>

        {/* Sign-in Link */}
        <div className="text-center animate-fade-in">
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
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
