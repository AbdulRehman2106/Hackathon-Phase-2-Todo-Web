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
  const [showShortcuts, setShowShortcuts] = useState(false);

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
      // Show shortcuts modal with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }

      // Close shortcuts modal with Escape
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }

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
  }, [showShortcuts]);

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

      {/* Keyboard Shortcuts Help Button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        title="Keyboard shortcuts (Press ?)"
      >
        <span className="text-xl font-bold">?</span>
      </button>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-700">New Task</span>
                <kbd className="px-3 py-1 bg-neutral-100 rounded text-sm font-mono">Ctrl + N</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-700">Show Shortcuts</span>
                <kbd className="px-3 py-1 bg-neutral-100 rounded text-sm font-mono">?</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-700">Close Modal</span>
                <kbd className="px-3 py-1 bg-neutral-100 rounded text-sm font-mono">Esc</kbd>
              </div>
            </div>
            <p className="mt-6 text-sm text-neutral-500 text-center">
              More shortcuts coming soon!
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
