import { useState, useMemo } from 'react';
import { Task } from '@/lib/types';
import { FilterType } from '@/components/tasks/TaskFilters';
import { SortOption } from '@/components/tasks/TaskSort';

/**
 * Custom hook to manage task filtering and sorting logic.
 * Extracts complex filtering logic from the dashboard component.
 *
 * @param tasks - Array of all tasks
 * @param searchQuery - Search query string (should be debounced)
 * @param activeFilter - Current filter type (all/active/completed)
 * @param sortBy - Current sort option
 * @returns Filtered and sorted tasks, plus filter counts
 */
export function useTaskFilters(
  tasks: Task[],
  searchQuery: string,
  activeFilter: FilterType,
  sortBy: SortOption
) {
  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply status filter
    if (activeFilter === 'active') {
      result = result.filter(task => !task.completed);
    } else if (activeFilter === 'completed') {
      result = result.filter(task => task.completed);
    }

    // Apply search filter (using debounced query for performance)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.category && task.category.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) -
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'date':
        default:
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
    });

    return result;
  }, [tasks, activeFilter, searchQuery, sortBy]);

  // Calculate counts for filter tabs
  const filterCounts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  }), [tasks]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.filter(t => !t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedCount,
      pendingCount,
      completionRate,
    };
  }, [tasks]);

  return {
    filteredTasks,
    filterCounts,
    stats,
  };
}

export default useTaskFilters;
