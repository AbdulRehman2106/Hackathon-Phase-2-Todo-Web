import React from 'react';

/**
 * Skip link component for keyboard navigation accessibility.
 * Allows keyboard users to skip directly to main content.
 */
export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
