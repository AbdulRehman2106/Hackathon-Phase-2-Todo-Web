'use client';

import React from 'react';
import Button from './Button';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: 'N', description: 'Create new task', category: 'Navigation' },
  { keys: '/', description: 'Focus search', category: 'Navigation' },
  { keys: 'Esc', description: 'Close modal/dialog', category: 'Navigation' },
  { keys: '?', description: 'Show keyboard shortcuts', category: 'Navigation' },

  // Task Actions
  { keys: 'Enter', description: 'Submit form', category: 'Task Actions' },
  { keys: 'E', description: 'Edit selected task', category: 'Task Actions' },
  { keys: 'D', description: 'Delete selected task', category: 'Task Actions' },
  { keys: 'Space', description: 'Toggle task completion', category: 'Task Actions' },

  // View Controls
  { keys: 'L', description: 'Switch to list view', category: 'View Controls' },
  { keys: 'C', description: 'Switch to calendar view', category: 'View Controls' },
  { keys: '1', description: 'Show all tasks', category: 'View Controls' },
  { keys: '2', description: 'Show active tasks', category: 'View Controls' },
  { keys: '3', description: 'Show completed tasks', category: 'View Controls' },
];

/**
 * Modal component to display keyboard shortcuts help.
 */
export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-help-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⌨️</span>
              </div>
              <div>
                <h2 id="shortcut-help-title" className="text-2xl font-bold">
                  Keyboard Shortcuts
                </h2>
                <p className="text-primary-100 text-sm">
                  Boost your productivity with these shortcuts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close shortcuts help"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="animate-slide-up">
              <h3 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></span>
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <span className="text-neutral-700">{shortcut.description}</span>
                    <kbd className="px-3 py-1.5 bg-white border-2 border-neutral-300 rounded-lg text-sm font-semibold text-neutral-900 shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 border-t-2 border-neutral-200 p-6 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              💡 Tip: Press <kbd className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs font-semibold">?</kbd> anytime to view shortcuts
            </p>
            <Button variant="primary" size="md" onClick={onClose}>
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelpModal;
