'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * DashboardLayout component for authenticated pages.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    if (!auth.isAuthenticated()) {
      router.push('/sign-in');
      return;
    }

    // Get user data
    const user = auth.getUser();
    if (user) {
      setUserEmail(user.email);
    }

    setIsLoading(false);
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N for new task
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // Focus on task input
        const taskInput = document.querySelector('input[name="title"]') as HTMLInputElement;
        if (taskInput) {
          taskInput.focus();
          taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle sign out
  const handleSignOut = () => {
    auth.signOut();
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <Navbar isAuthenticated={true} userEmail={userEmail} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1" role="main">
        {children}
      </main>

      {/* AI Chat Button */}
      <button
        onClick={() => router.push('/dashboard/chat')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center z-40 group"
        title="AI Task Assistant"
      >
        <svg
          className="w-7 h-7 group-hover:rotate-12 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
          {/* Sparkle effect */}
          <circle cx="18" cy="6" r="1.5" fill="currentColor" className="animate-pulse" />
          <circle cx="6" cy="18" r="1" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
        </svg>
      </button>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
