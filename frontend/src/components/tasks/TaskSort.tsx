'use client';

import React from 'react';

export type SortOption = 'date' | 'priority' | 'name' | 'category';

export interface TaskSortProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

/**
 * Task sort dropdown component for sorting tasks.
 */
export const TaskSort: React.FC<TaskSortProps> = ({
  activeSort,
  onSortChange,
}) => {
  const sortOptions = [
    { value: 'date' as SortOption, label: '📅 Due Date', icon: '📅' },
    { value: 'priority' as SortOption, label: '🔥 Priority', icon: '🔥' },
    { value: 'name' as SortOption, label: '🔤 Name (A-Z)', icon: '🔤' },
    { value: 'category' as SortOption, label: '🏷️ Category', icon: '🏷️' },
  ];

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        Sort by:
      </label>
      <select
        id="sort"
        value={activeSort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-5 py-2.5 bg-white border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 shadow-sm hover:shadow-md hover:border-primary-300 font-medium text-neutral-700 cursor-pointer hover:scale-105 transform"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TaskSort;
