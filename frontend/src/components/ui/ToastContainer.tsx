'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: ToastAction;
  duration?: number;
}

interface ToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions | 'success' | 'error' | 'info' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, options?: ToastOptions | 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();

    // Support legacy string type parameter
    let toastOptions: ToastOptions;
    if (typeof options === 'string') {
      toastOptions = { type: options };
    } else {
      toastOptions = options || {};
    }

    const toast: ToastData = {
      id,
      message,
      type: toastOptions.type || 'info',
      action: toastOptions.action,
      duration: toastOptions.duration,
    };

    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            action={toast.action}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
