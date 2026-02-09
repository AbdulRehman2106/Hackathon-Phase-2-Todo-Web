import React from 'react';
import Button from '@/components/ui/Button';

export interface DeleteConfirmationProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * DeleteConfirmation component for confirming task deletion.
 *
 * Features:
 * - Modal overlay with centered content
 * - Clear warning message
 * - Shows task title being deleted
 * - Confirm and cancel actions
 * - Loading state during deletion
 * - Keyboard support (Escape to cancel)
 * - Danger styling to emphasize destructive action
 */
export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-neutral-900 bg-opacity-60 backdrop-blur-sm transition-all duration-300 animate-fade-in"
        onClick={!isDeleting ? onCancel : undefined}
      ></div>

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-neutral-200">
          {/* Warning Icon with animation */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full animate-pulse shadow-lg">
            <svg
              className="w-8 h-8 text-red-600 animate-wiggle"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3
            id="modal-title"
            className="text-2xl font-bold text-neutral-900 text-center mb-3"
          >
            🗑️ Delete Task?
          </h3>

          {/* Message */}
          <p className="text-base text-neutral-600 text-center mb-4 leading-relaxed">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>

          {/* Task Title with enhanced styling */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 mb-8 shadow-sm">
            <p className="text-sm font-semibold text-red-900 truncate text-center">
              "{taskTitle}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={onConfirm}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete Task'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
