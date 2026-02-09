'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-white via-neutral-50 to-primary-50 border-t-2 border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transform">
                <span className="text-2xl text-white">✓</span>
              </div>
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                TodoApp
              </h3>
            </div>
            <p className="text-base text-neutral-700 mb-6 max-w-md leading-relaxed font-medium">
              A modern, beautiful task management application to help you stay organized and productive. Built with Next.js and FastAPI. 🚀
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/AbdulRehman2106" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110 transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/abdul-rehman-2213012b9/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110 transform">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-slide-up stagger-1">
            <h4 className="text-base font-bold text-neutral-900 mb-5 flex items-center gap-2">
              <span className="text-lg">🔗</span> Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="animate-slide-up stagger-2">
            <h4 className="text-base font-bold text-neutral-900 mb-5 flex items-center gap-2">
              <span className="text-lg">📚</span> Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-all duration-300 inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-neutral-200 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-neutral-600 flex items-center gap-2">
              © {currentYear} TodoApp. Built with <span className="text-red-500 animate-pulse">❤️</span> using Next.js & FastAPI.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-all duration-300 hover:scale-110 transform">
                Privacy Policy
              </a>
              <a href="#" className="text-sm font-semibold text-neutral-600 hover:text-primary-600 transition-all duration-300 hover:scale-110 transform">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
