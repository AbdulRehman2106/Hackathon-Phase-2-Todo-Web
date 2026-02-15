import type { Metadata, Viewport } from 'next';
import './globals.css';
import './enhancements.css';
import './animations.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Todo App - Organize Your Tasks',
  description: 'A modern task management application with secure authentication',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

/**
 * Root layout component for the entire application.
 * Error handling is managed by error.tsx and global-error.tsx files.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
