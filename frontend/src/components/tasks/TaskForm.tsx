import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

export interface TaskFormProps {
  onSubmit: (
    title: string,
    description: string,
    category: string,
    dueDate: string,
    priority: string,
    isRecurring: boolean,
    recurrenceType: string,
    recurrenceInterval: number,
    recurrenceEndDate: string
  ) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'];
const PRIORITIES = [
  { value: 'low', label: 'Low Priority', color: 'text-green-600' },
  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
  { value: 'high', label: 'High Priority', color: 'text-red-600' },
];
const RECURRENCE_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

/**
 * TaskForm component for creating new tasks with categories, due dates, and priority.
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [error, setError] = useState('');

  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Task title is required';
    }
    if (title.length > 500) {
      return 'Task title must be 500 characters or less';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSubmit(
        title.trim(),
        description.trim() || '',
        category,
        dueDate,
        priority,
        isRecurring,
        recurrenceType,
        recurrenceInterval,
        recurrenceEndDate
      );

      // Reset form on success
      setTitle('');
      setDescription('');
      setCategory('');
      setDueDate('');
      setPriority('medium');
      setIsRecurring(false);
      setRecurrenceType('daily');
      setRecurrenceInterval(1);
      setRecurrenceEndDate('');
    } catch (err: any) {
      setError(err.message || 'Failed to create task. Please try again.');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setDueDate('');
    setPriority('medium');
    setIsRecurring(false);
    setRecurrenceType('daily');
    setRecurrenceInterval(1);
    setRecurrenceEndDate('');
    setError('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-primary-50 rounded-2xl border-2 border-primary-200 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
          <span className="text-2xl text-white">✨</span>
        </div>
        <h3 className="text-xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Create New Task
        </h3>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-shake shadow-md">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="task-title" className="block text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
          <span className="text-base">🎯</span> Task Title <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          id="task-title"
          name="title"
          required
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          placeholder="What needs to be done? 🎯"
          maxLength={500}
        />
      </div>

      <div className="mb-5">
        <Textarea
          label="📝 Description (Optional)"
          id="task-description"
          name="description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          placeholder="Add more details... ✨"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="due-date" className="block text-sm font-medium text-neutral-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            id="due-date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Recurring Task Section */}
      <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="is-recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
          />
          <label htmlFor="is-recurring" className="text-sm font-medium text-neutral-700">
            🔄 Make this a recurring task
          </label>
        </div>

        {isRecurring && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div>
              <label htmlFor="recurrence-type" className="block text-xs font-medium text-neutral-600 mb-1">
                Repeat
              </label>
              <select
                id="recurrence-type"
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {RECURRENCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="recurrence-interval" className="block text-xs font-medium text-neutral-600 mb-1">
                Every
              </label>
              <input
                type="number"
                id="recurrence-interval"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isLoading}
                min="1"
                max="365"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="recurrence-end-date" className="block text-xs font-medium text-neutral-600 mb-1">
                Until (Optional)
              </label>
              <input
                type="date"
                id="recurrence-end-date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading || !title.trim()}
          className="shadow-md hover:shadow-lg transition-all hover:scale-105 transform"
        >
          {isLoading ? 'Creating...' : '✓ Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
