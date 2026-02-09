'use client';

import React, { useState, useEffect } from 'react';
import { Subtask } from '@/lib/types';
import { api } from '@/lib/api';
import SubtaskItem from './SubtaskItem';
import { useToast } from '@/components/ui/ToastContainer';

export interface SubtaskListProps {
  taskId: number;
}

/**
 * Subtask list component with add, edit, delete, and toggle functionality.
 */
export const SubtaskList: React.FC<SubtaskListProps> = ({ taskId }) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();

  // Fetch subtasks on mount
  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    setIsLoading(true);
    try {
      const fetchedSubtasks = await api.subtasks.list(taskId);
      setSubtasks(fetchedSubtasks);
    } catch (err: any) {
      showToast('Failed to load subtasks', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    setIsAdding(true);
    const optimisticSubtask: Subtask = {
      id: Date.now(),
      task_id: taskId,
      title: newSubtaskTitle.trim(),
      completed: false,
      order: subtasks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSubtasks((prev) => [...prev, optimisticSubtask]);
    setNewSubtaskTitle('');

    try {
      const createdSubtask = await api.subtasks.create(taskId, {
        title: newSubtaskTitle.trim(),
        order: subtasks.length,
      });

      setSubtasks((prev) =>
        prev.map((st) => (st.id === optimisticSubtask.id ? createdSubtask : st))
      );
      showToast('Subtask added', 'success');
    } catch (err: any) {
      setSubtasks((prev) => prev.filter((st) => st.id !== optimisticSubtask.id));
      showToast('Failed to add subtask', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: number) => {
    const subtask = subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return;

    setSubtasks((prev) =>
      prev.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    );

    try {
      await api.subtasks.update(subtaskId, { completed: !subtask.completed });
    } catch (err: any) {
      setSubtasks((prev) =>
        prev.map((st) =>
          st.id === subtaskId ? { ...st, completed: subtask.completed } : st
        )
      );
      showToast('Failed to update subtask', 'error');
    }
  };

  const handleEditSubtask = async (subtaskId: number, title: string) => {
    const subtask = subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return;

    const originalTitle = subtask.title;
    setSubtasks((prev) =>
      prev.map((st) => (st.id === subtaskId ? { ...st, title } : st))
    );

    try {
      await api.subtasks.update(subtaskId, { title });
      showToast('Subtask updated', 'success');
    } catch (err: any) {
      setSubtasks((prev) =>
        prev.map((st) =>
          st.id === subtaskId ? { ...st, title: originalTitle } : st
        )
      );
      showToast('Failed to update subtask', 'error');
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    const subtask = subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return;

    setSubtasks((prev) => prev.filter((st) => st.id !== subtaskId));

    try {
      await api.subtasks.delete(subtaskId);
      showToast('Subtask deleted', 'success');
    } catch (err: any) {
      setSubtasks((prev) => [...prev, subtask].sort((a, b) => a.order - b.order));
      showToast('Failed to delete subtask', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask();
    }
  };

  const completedCount = subtasks.filter((st) => st.completed).length;
  const totalCount = subtasks.length;

  return (
    <div className="mt-3 space-y-2">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
          <span>📋</span>
          <span>Subtasks</span>
          {totalCount > 0 && (
            <span className="text-xs font-normal text-neutral-500">
              ({completedCount}/{totalCount})
            </span>
          )}
        </h4>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full bg-neutral-200 rounded-full h-1.5">
          <div
            className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Subtask list */}
      {isLoading ? (
        <div className="text-sm text-neutral-500 py-2">Loading subtasks...</div>
      ) : (
        <div className="space-y-1">
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={handleToggleSubtask}
              onDelete={handleDeleteSubtask}
              onEdit={handleEditSubtask}
            />
          ))}
        </div>
      )}

      {/* Add new subtask */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a subtask..."
          disabled={isAdding}
          className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100"
        />
        <button
          onClick={handleAddSubtask}
          disabled={!newSubtaskTitle.trim() || isAdding}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SubtaskList;
