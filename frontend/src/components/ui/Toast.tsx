'use client';

import React, { useEffect, useState } from 'react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: ToastAction;
  onClose: () => void;
}

/**
 * Toast notification component for displaying temporary messages.
 * Supports action buttons for undo/redo functionality.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  action,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // If there's an action, give user more time to click it
    const actualDuration = action ? duration + 2000 : duration;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, actualDuration);

    return () => clearTimeout(timer);
  }, [duration, action, onClose]);

  const handleActionClick = () => {
    action?.onClick();
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const bgColor = {
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    error: 'bg-gradient-to-r from-red-500 to-red-600',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type];

  return (
    <div
      className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] ${
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg flex-shrink-0">
        <span className="text-xl font-bold">{icon}</span>
      </div>
      <p className="font-medium flex-1">{message}</p>

      {action && (
        <button
          onClick={handleActionClick}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all hover:scale-105 transform"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}

      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="text-white hover:text-neutral-200 transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
