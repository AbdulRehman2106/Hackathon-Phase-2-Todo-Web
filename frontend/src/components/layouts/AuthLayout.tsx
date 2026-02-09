import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * AuthLayout component for authentication pages (sign-up, sign-in).
 *
 * Features:
 * - Modern gradient background
 * - Centered card layout with enhanced shadows
 * - Responsive design (mobile-first)
 * - Consistent branding with home link
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo/Branding with Home Link */}
        <Link href="/" className="flex justify-center mb-8 group">
          <div className="relative animate-bounce">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl group-hover:shadow-primary-500/50 transition-all duration-300 group-hover:scale-110 transform flex items-center justify-center p-4">
              <Image src="/logo.svg" alt="Logo" width={48} height={48} className="w-full h-full object-contain filter invert brightness-0" />
            </div>
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          </div>
        </Link>

        {/* Title */}
        <h1 className="text-center text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3 animate-slide-down">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-center text-lg text-neutral-600 mb-10 animate-fade-in font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-scale-in relative z-10">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-12 border-2 border-neutral-100 backdrop-blur-sm">
          {children}
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center animate-fade-in">
          <Link
            href="/"
            className="text-base font-semibold text-neutral-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center gap-2 hover:gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
