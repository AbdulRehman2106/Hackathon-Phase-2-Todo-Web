'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { exportTasks } from '@/lib/export';
import { useToast } from '@/components/ui/ToastContainer';

export interface ExportButtonProps {
  tasks: Task[];
}

/**
 * Export button component for exporting tasks to CSV or PDF
 */
export const ExportButton: React.FC<ExportButtonProps> = ({ tasks }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { showToast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      await exportTasks(tasks, format);
      showToast(`Tasks exported to ${format.toUpperCase()} successfully!`, 'success');
    } catch (err: any) {
      showToast(`Failed to export tasks to ${format.toUpperCase()}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isExporting ? 'Exporting...' : 'Export Tasks'}
      </button>

      {showMenu && !isExporting && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-10 animate-fade-in">
          <div className="py-1">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors"
            >
              <span>📊</span>
              <span>Export as CSV</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 transition-colors"
            >
              <span>📄</span>
              <span>Export as PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ExportButton;
