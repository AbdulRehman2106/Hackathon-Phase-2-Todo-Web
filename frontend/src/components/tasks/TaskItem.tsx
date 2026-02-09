import React, { memo, useState } from 'react';
import { Task } from '@/lib/types';
import SubtaskList from './SubtaskList';

export interface TaskItemProps {
  task: Task;
  onToggle?: (taskId: number) => void;
  onEdit?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  isSelected?: boolean;
  onSelect?: (taskId: number) => void;
}

/**
 * TaskItem component for displaying a single task with category and due date.
 */
const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Check if task is overdue
  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();
  const isDueSoon = task.due_date && !task.completed &&
    new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Format due date
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Category colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Work: 'bg-blue-100 text-blue-700 border-blue-200',
      Personal: 'bg-green-100 text-green-700 border-green-200',
      Shopping: 'bg-purple-100 text-purple-700 border-purple-200',
      Health: 'bg-red-100 text-red-700 border-red-200',
      Finance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[category] || colors.Other;
  };

  // Priority colors and icons
  const getPriorityDisplay = (priority: string | null) => {
    const displays: Record<string, { color: string; icon: string; label: string }> = {
      high: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴', label: 'High' },
      medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡', label: 'Medium' },
      low: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🟢', label: 'Low' },
    };
    return displays[priority || 'medium'] || displays.medium;
  };

  const priorityDisplay = getPriorityDisplay(task.priority);

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all duration-300 animate-slide-up ${
        isSelected ? 'ring-2 ring-primary-500 border-primary-500' : ''
      } ${
        task.completed
          ? 'border-neutral-200 bg-neutral-50/50'
          : 'border-neutral-200 hover:border-primary-300 hover:shadow-lg shadow-md hover:scale-[1.02] transform'
      }`}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Selection Checkbox (for bulk actions) */}
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(task.id)}
            className="mt-1 w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
          />
        )}

        {/* Completion Checkbox */}
        <button
          onClick={() => onToggle?.(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
            task.completed
              ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 scale-110'
              : 'border-neutral-300 hover:border-primary-500 hover:bg-primary-50 hover:scale-110'
          }`}
          aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
        >
          {task.completed && (
            <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`text-base font-semibold mb-1 transition-all duration-300 ${
              task.completed
                ? 'text-neutral-400 line-through'
                : 'text-neutral-900'
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={`text-sm mb-2 transition-all duration-300 ${
                task.completed ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Tags: Priority, Category, Due Date, Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Badge */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityDisplay.color}`}>
              {priorityDisplay.icon} {priorityDisplay.label}
            </span>

            {/* Category Tag */}
            {task.category && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getCategoryColor(task.category)}`}>
                {task.category}
              </span>
            )}

            {/* Due Date Tag */}
            {task.due_date && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                isOverdue
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : isDueSoon
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                📅 {formatDueDate(task.due_date)}
              </span>
            )}

            {/* Status Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                task.completed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {task.completed ? '✓ Completed' : '○ Pending'}
            </span>

            {/* Subtasks Toggle Button */}
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              📋 Subtasks
              <svg
                className={`w-3 h-3 ml-1 transition-transform ${showSubtasks ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Subtasks Section */}
          {showSubtasks && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <SubtaskList taskId={task.id} />
            </div>
          )}

          {/* Hover Preview Tooltip */}
          {showPreview && task.description && (
            <div className="absolute z-10 mt-2 p-3 bg-neutral-900 text-white text-sm rounded-lg shadow-xl max-w-xs animate-fade-in">
              <p className="font-semibold mb-1">{task.title}</p>
              <p className="text-neutral-300">{task.description}</p>
              <div className="absolute -top-1 left-4 w-2 h-2 bg-neutral-900 transform rotate-45"></div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={() => onEdit(task.id)}
              className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 hover:scale-110 transform"
              aria-label="Edit task"
              title="Edit task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 hover:scale-110 transform"
              aria-label="Delete task"
              title="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(TaskItem, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.category === nextProps.task.category &&
    prevProps.task.due_date === nextProps.task.due_date &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onToggle === nextProps.onToggle &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onSelect === nextProps.onSelect
  );
});
