import React from 'react';
import { Task } from '@/lib/types';
import TaskItem from './TaskItem';

export interface TaskListProps {
  tasks: Task[];
  onToggle?: (taskId: number) => void;
  onEdit?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  selectedTasks?: number[];
  onSelectTask?: (taskId: number) => void;
  showBulkActions?: boolean;
}

/**
 * TaskList component for displaying tasks organized by completion status.
 */
export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  selectedTasks = [],
  onSelectTask,
  showBulkActions = false,
}) => {
  // Separate tasks by completion status
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="space-y-8">
      {/* Pending Tasks Section */}
      {pendingTasks.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-neutral-900">
                Active Tasks
              </h2>
            </div>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 shadow-sm">
              {pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div key={task.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <TaskItem
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={showBulkActions ? onSelectTask : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-neutral-900">
                Completed
              </h2>
            </div>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-100 text-green-700 shadow-sm">
              {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <div className="space-y-3">
            {completedTasks.map((task, index) => (
              <div key={task.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <TaskItem
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={showBulkActions ? onSelectTask : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
