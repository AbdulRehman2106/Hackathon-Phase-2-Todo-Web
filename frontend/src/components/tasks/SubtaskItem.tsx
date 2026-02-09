'use client';

import React, { useState } from 'react';
import { Subtask } from '@/lib/types';

export interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: number) => void;
  onDelete: (subtaskId: number) => void;
  onEdit: (subtaskId: number, title: string) => void;
}

/**
 * Individual subtask item component with checkbox and actions.
 */
export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit(subtask.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(subtask.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 px-3 hover:bg-neutral-50 rounded-lg transition-colors group">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => onToggle(subtask.id)}
        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
      />

      {/* Title or Edit Input */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          className="flex-1 px-2 py-1 text-sm border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      ) : (
        <span
          className={`flex-1 text-sm ${
            subtask.completed
              ? 'line-through text-neutral-400'
              : 'text-neutral-700'
          }`}
        >
          {subtask.title}
        </span>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-neutral-500 hover:text-primary-600 transition-colors"
            title="Edit subtask"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(subtask.id)}
            className="p-1 text-neutral-500 hover:text-red-600 transition-colors"
            title="Delete subtask"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SubtaskItem;
