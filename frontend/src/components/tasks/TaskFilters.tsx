'use client';

import React from 'react';

export type FilterType = 'all' | 'active' | 'completed';

export interface TaskFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

/**
 * Task filter tabs component for filtering tasks by status.
 */
export const TaskFilters: React.FC<TaskFiltersProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All Tasks', count: counts.all },
    { value: 'active', label: 'Active', count: counts.active },
    { value: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2 animate-slide-up">
      {filters.map((filter, index) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
            activeFilter === filter.value
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-primary-400 hover:bg-primary-50 shadow-sm hover:shadow-md'
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <span className="flex items-center gap-2">
            {filter.value === 'all' && '📋'}
            {filter.value === 'active' && '⏳'}
            {filter.value === 'completed' && '✅'}
            {filter.label}
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              activeFilter === filter.value
                ? 'bg-white/25 text-white'
                : 'bg-neutral-100 text-neutral-700'
            }`}>
              {filter.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default TaskFilters;
