'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

/**
 * Landing page with hero section and features.
 */
export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication and redirect if logged in
    if (auth.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 flex-1">
        <div className="text-center animate-slide-up">
          {/* Decorative elements */}
          <div className="flex justify-center gap-3 mb-6 animate-bounce">
            <span className="text-4xl">✨</span>
            <span className="text-4xl" style={{ animationDelay: '0.1s' }}>📋</span>
            <span className="text-4xl" style={{ animationDelay: '0.2s' }}>✅</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold text-neutral-900 mb-6 leading-tight">
            Organize Your Life,
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 bg-clip-text text-transparent animate-pulse">
              One Task at a Time
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            A simple, beautiful, and powerful task management app to help you stay organized and productive. 🚀
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center animate-scale-in">
            <Link
              href="/sign-up"
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-10 py-5 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg hover:scale-110 transform inline-flex items-center justify-center gap-2"
            >
              <span>🎯</span> Start Free Today
            </Link>
            <Link
              href="/sign-in"
              className="bg-white text-primary-600 px-10 py-5 rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg border-2 border-primary-600 hover:scale-110 transform inline-flex items-center justify-center gap-2"
            >
              <span>🔐</span> Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-28 grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-white to-primary-50 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary-100 animate-slide-up hover:scale-105 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 shadow-lg animate-bounce">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Fast & Simple</h3>
            <p className="text-neutral-600 text-base leading-relaxed">
              Create, edit, and manage tasks in seconds. No complexity, just productivity.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-100 animate-slide-up hover:scale-105 transform hover:-translate-y-2" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg animate-bounce" style={{ animationDelay: '0.1s' }}>
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Secure & Private</h3>
            <p className="text-neutral-600 text-base leading-relaxed">
              Your tasks are encrypted and protected with industry-standard security.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 animate-slide-up hover:scale-105 transform hover:-translate-y-2" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Beautiful Design</h3>
            <p className="text-neutral-600 text-base leading-relaxed">
              Clean, modern interface that makes task management a pleasure.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 border border-neutral-100 animate-fade-in">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Beautiful Animations</h4>
                <p className="text-sm text-neutral-600">Smooth transitions and effects</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">😊</span>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Emoji Support</h4>
                <p className="text-sm text-neutral-600">Add personality to your tasks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-1">Progress Tracking</h4>
                <p className="text-sm text-neutral-600">See your productivity stats</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
