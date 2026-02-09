import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { Task } from '@/lib/types';

export interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: number, title: string, description: string) => Promise<void>;
}

/**
 * EditTaskModal component for editing existing tasks.
 *
 * Features:
 * - Modal overlay with centered content
 * - Pre-filled form with current task data
 * - Title and description editing
 * - Client-side validation
 * - Loading state during save
 * - Cancel and save actions
 * - Keyboard support (Escape to close)
 */
export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setError('');
  }, [task]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Validate form
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Task title is required';
    }

    if (title.length > 500) {
      return 'Task title must be 500 characters or less';
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await onSave(task.id, title.trim(), description.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isLoading) {
      setTitle(task.title);
      setDescription(task.description || '');
      setError('');
      onClose();
    }
  };

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
        onClick={handleCancel}
      ></div>

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-scale-in border border-neutral-200">
          {/* Header */}
          <div className="mb-8">
            <h3
              id="modal-title"
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"
            >
              ✏️ Edit Task
            </h3>
            <p className="text-sm text-neutral-600 mt-2">Update your task details below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border-2 border-error-200 rounded-xl animate-shake">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-error-700">{error}</p>
                </div>
              </div>
            )}

            {/* Title Input */}
            <div className="mb-4">
              <Input
                label="Task Title"
                type="text"
                id="edit-task-title"
                name="title"
                required
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                placeholder="Enter task title..."
                maxLength={500}
                autoFocus
              />
            </div>

            {/* Description Textarea */}
            <div className="mb-6">
              <Textarea
                label="Description (Optional)"
                id="edit-task-description"
                name="description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                placeholder="Add more details about this task..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="gradient"
                size="md"
                isLoading={isLoading}
                disabled={isLoading || !title.trim()}
              >
                {isLoading ? 'Saving...' : '💾 Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
