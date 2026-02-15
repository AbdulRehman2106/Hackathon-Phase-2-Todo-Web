'use client';

import { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { useState } from 'react';

interface DraggableTaskListProps {
  tasks: Task[];
  onToggle?: (taskId: number) => void;
  onEdit?: (taskId: number) => void;
  onDelete?: (taskId: number) => void;
  onReorder?: (tasks: Task[]) => void;
  selectedTasks?: number[];
  onSelectTask?: (taskId: number) => void;
}

export default function DraggableTaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
  selectedTasks = [],
  onSelectTask,
}: DraggableTaskListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);

    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newTasks = [...tasks];
    const draggedTask = newTasks[draggedIndex];

    // Remove from old position
    newTasks.splice(draggedIndex, 1);

    // Insert at new position
    newTasks.splice(dropIndex, 0, draggedTask);

    // Call parent handler
    onReorder?.(newTasks);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`transition-all duration-200 ${
            dragOverIndex === index
              ? 'border-t-4 border-primary-500 pt-2'
              : ''
          } ${
            draggedIndex === index
              ? 'opacity-50 scale-95'
              : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <div className="cursor-move text-neutral-400 dark:text-neutral-600 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>

            {/* Task Item */}
            <div className="flex-1">
              <TaskItem
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                isSelected={selectedTasks.includes(task.id)}
                onSelect={onSelectTask}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
