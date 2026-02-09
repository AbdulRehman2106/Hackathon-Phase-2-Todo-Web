import type { Metadata, Viewport } from 'next';
import './globals.css';
import './enhancements.css';
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
    <html lang="en">
      <body className="antialiased bg-white text-neutral-900 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
