'use client';

import { Task } from '@/lib/types';
import { useState } from 'react';
import TaskItem from './TaskItem';

interface KanbanBoardProps {
  tasks: Task[];
  onToggle?: (taskId: number) => void;
  onEdit?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: 'todo' | 'in-progress' | 'done') => void;
}

type KanbanColumn = 'todo' | 'in-progress' | 'done';

export default function KanbanBoard({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumn | null>(null);

  // Categorize tasks by status
  const getTasksByStatus = (status: KanbanColumn) => {
    if (status === 'done') {
      return tasks.filter((t) => t.completed);
    } else if (status === 'in-progress') {
      // Tasks with due date in next 7 days and not completed
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return tasks.filter(
        (t) =>
          !t.completed &&
          t.due_date &&
          new Date(t.due_date) <= weekFromNow &&
          new Date(t.due_date) >= new Date()
      );
    } else {
      // Todo: not completed and either no due date or due date > 7 days
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return tasks.filter(
        (t) =>
          !t.completed &&
          (!t.due_date || new Date(t.due_date) > weekFromNow)
      );
    }
  };

  const columns: Array<{
    id: KanbanColumn;
    title: string;
    icon: string;
    color: string;
    bgColor: string;
  }> = [
    {
      id: 'todo',
      title: 'To Do',
      icon: '📋',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      icon: '⏳',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      id: 'done',
      title: 'Done',
      icon: '✅',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: KanbanColumn) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: KanbanColumn) => {
    e.preventDefault();

    if (!draggedTask) return;

    // Update task status based on column
    if (columnId === 'done' && !draggedTask.completed) {
      onToggle?.(draggedTask.id);
    } else if (columnId !== 'done' && draggedTask.completed) {
      onToggle?.(draggedTask.id);
    }

    onStatusChange?.(draggedTask.id, columnId);

    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);

        return (
          <div
            key={column.id}
            className={`rounded-xl border-2 transition-all ${
              dragOverColumn === column.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 scale-105'
                : 'border-neutral-200 dark:border-neutral-700'
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`${column.bgColor} p-4 rounded-t-xl border-b-2 border-neutral-200 dark:border-neutral-700`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{column.icon}</span>
                  <h3 className={`text-lg font-bold ${column.color}`}>
                    {column.title}
                  </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${column.bgColor} ${column.color}`}>
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="p-4 space-y-3 min-h-[400px] bg-white dark:bg-neutral-800">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-5xl mb-3 opacity-50">{column.icon}</div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No tasks in {column.title.toLowerCase()}
                  </p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-move transition-all ${
                      draggedTask?.id === task.id ? 'opacity-50 scale-95' : 'opacity-100'
                    }`}
                  >
                    <TaskItem
                      task={task}
                      onToggle={onToggle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
