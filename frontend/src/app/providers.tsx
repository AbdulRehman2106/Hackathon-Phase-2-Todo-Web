'use client';

import { ToastProvider } from '@/components/ui/ToastContainer';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * Client-side providers wrapper.
 * Separates client components from the server-side root layout.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
