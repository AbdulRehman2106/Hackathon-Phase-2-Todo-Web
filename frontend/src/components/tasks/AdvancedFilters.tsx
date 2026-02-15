'use client';

import { useState } from 'react';

export interface AdvancedFilterOptions {
  priorities: string[];
  categories: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  dueDate: 'all' | 'overdue' | 'today' | 'this-week' | 'this-month';
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: AdvancedFilterOptions) => void;
  availableCategories: string[];
}

export default function AdvancedFilters({
  onFilterChange,
  availableCategories,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilterOptions>({
    priorities: [],
    categories: [],
    dateRange: { start: null, end: null },
    dueDate: 'all',
  });

  const priorities = ['high', 'medium', 'low'];
  const dueDateOptions = [
    { value: 'all', label: 'All Tasks', icon: '📋' },
    { value: 'overdue', label: 'Overdue', icon: '🔴' },
    { value: 'today', label: 'Due Today', icon: '📅' },
    { value: 'this-week', label: 'This Week', icon: '📆' },
    { value: 'this-month', label: 'This Month', icon: '🗓️' },
  ];

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];

    const newFilters = { ...filters, priorities: newPriorities };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDueDateChange = (value: string) => {
    const newFilters = { ...filters, dueDate: value as any };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const newFilters = {
      ...filters,
      dateRange: { ...filters.dateRange, [type]: value || null },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: AdvancedFilterOptions = {
      priorities: [],
      categories: [],
      dateRange: { start: null, end: null },
      dueDate: 'all',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount =
    filters.priorities.length +
    filters.categories.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.dueDate !== 'all' ? 1 : 0);

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-600 transition-all shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium text-neutral-700 dark:text-neutral-300">Advanced Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-4 p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Filter */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span>🎯</span> Priority
              </h4>
              <div className="flex flex-wrap gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityToggle(priority)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium capitalize ${
                      filters.priorities.includes(priority)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {priority === 'high' && '🔴'}
                    {priority === 'medium' && '🟡'}
                    {priority === 'low' && '🟢'}
                    {' '}{priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span>🏷️</span> Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      filters.categories.includes(category)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date Filter */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span>📅</span> Due Date
              </h4>
              <div className="flex flex-wrap gap-2">
                {dueDateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDueDateChange(option.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                      filters.dueDate === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                <span>📆</span> Date Range
              </h4>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
