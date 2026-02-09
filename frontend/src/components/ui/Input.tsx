import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Input component with label, error states, and helper text.
 *
 * Features:
 * - Optional label with proper association
 * - Error state with error message display
 * - Helper text for additional guidance
 * - Full width option
 * - Accessible with proper ARIA attributes
 * - Touch-friendly (minimum 44px height)
 * - Supports all standard input types
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      id,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Base input styles with enhanced animations
    const baseInputStyles = 'px-4 py-3 text-base border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] bg-white hover:border-primary-300 focus:scale-[1.01] transform shadow-sm focus:shadow-md';

    // Error state styles
    const errorStyles = error
      ? 'border-error-500 focus:ring-error-500 focus:border-error-500 animate-shake'
      : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500';

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    // Combine input styles
    const combinedInputStyles = `${baseInputStyles} ${errorStyles} ${widthStyles} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-neutral-700 mb-2 transition-colors duration-200"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={combinedInputStyles}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-error-600 flex items-center gap-1 animate-slide-down"
            role="alert"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-2 text-sm text-neutral-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
