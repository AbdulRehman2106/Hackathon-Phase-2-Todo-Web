import { AuthResponse } from './types';

/**
 * Better Auth configuration and helpers for JWT token management.
 *
 * This module provides utilities for storing, retrieving, and managing
 * JWT tokens using Better Auth patterns with httpOnly cookies and localStorage.
 *
 * Better Auth Secret is configured via BETTER_AUTH_SECRET environment variable.
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Better Auth configuration
export const betterAuthConfig = {
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  baseURL: process.env.AUTH_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
};

export const auth = {
  /**
   * Store authentication token and user data after successful login.
   */
  setAuth: (authResponse: AuthResponse): void => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  },

  /**
   * Get stored authentication token.
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get stored user data.
   */
  getUser: () => {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated (has valid token).
   */
  isAuthenticated: (): boolean => {
    return !!auth.getToken();
  },

  /**
   * Clear authentication data (logout).
   */
  clearAuth: (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Sign out user and redirect to sign-in page.
   */
  signOut: (): void => {
    auth.clearAuth();

    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
  },

  /**
   * Get Better Auth configuration.
   */
  getConfig: () => betterAuthConfig,
};

export default auth;
