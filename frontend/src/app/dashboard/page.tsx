'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import TaskStats from '@/components/tasks/TaskStats';
import SearchBar from '@/components/tasks/SearchBar';
import TaskFilters, { FilterType } from '@/components/tasks/TaskFilters';
import TaskSort, { SortOption } from '@/components/tasks/TaskSort';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import DeleteConfirmation from '@/components/tasks/DeleteConfirmation';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import ExportButton from '@/components/tasks/ExportButton';
import CalendarView from '@/components/tasks/CalendarView';
import { useToast } from '@/components/ui/ToastContainer';
import { api } from '@/lib/api';
import { Task } from '@/lib/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useAbortController } from '@/hooks/useAbortController';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import ShortcutHelpModal from '@/components/ui/ShortcutHelpModal';

/**
 * Dashboard page with all improvements:
 * - Search functionality
 * - Filter tabs (All/Active/Completed)
 * - Bulk actions
 * - Categories and due dates
 * - Toast notifications
 */
export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New state for improvements
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search for performance
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(-1);

  const { showToast } = useToast();
  const { getSignal } = useAbortController();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError('');

    try {
      const fetchedTasks = await api.tasks.list(getSignal());
      setTasks(fetchedTasks);
    } catch (err: any) {
      // Ignore aborted requests
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }
      setError(err.message || 'Failed to load tasks. Please try again.');
      showToast('Failed to load tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
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
  }, [tasks, activeFilter, debouncedSearchQuery, sortBy]);

  // Calculate counts for filter tabs
  const filterCounts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  }), [tasks]);

  // Handle create task
  const handleCreateTask = async (
    title: string,
    description: string,
    category: string,
    dueDate: string,
    priority: string,
    isRecurring: boolean,
    recurrenceType: string,
    recurrenceInterval: number,
    recurrenceEndDate: string
  ) => {
    setIsCreating(true);

    const optimisticTask: Task = {
      id: Date.now(),
      user_id: 0,
      title,
      description: description || null,
      completed: false,
      category: category || null,
      due_date: dueDate || null,
      priority: priority || 'medium',
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : null,
      recurrence_interval: isRecurring ? recurrenceInterval : null,
      recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
      parent_task_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prevTasks) => [optimisticTask, ...prevTasks]);

    try {
      const createdTask = await api.tasks.create({
        title,
        description: description || null,
        category: category || null,
        due_date: dueDate || null,
        priority: priority || 'medium',
        is_recurring: isRecurring,
        recurrence_type: isRecurring ? recurrenceType : null,
        recurrence_interval: isRecurring ? recurrenceInterval : 1,
        recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === optimisticTask.id ? createdTask : task))
      );
      showToast('Task created successfully!', 'success');
    } catch (err: any) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== optimisticTask.id));
      showToast('Failed to create task', 'error');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (taskId: number) => {
    const taskToToggle = tasks.find((task) => task.id === taskId);
    if (!taskToToggle) return;

    const newCompletedState = !taskToToggle.completed;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: newCompletedState } : task
      )
    );

    try {
      await api.tasks.update(taskId, { completed: newCompletedState });

      // Show success toast with undo action
      showToast(
        newCompletedState ? 'Task completed!' : 'Task marked as pending',
        {
          type: 'success',
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                await api.tasks.update(taskId, { completed: !newCompletedState });
                setTasks((prevTasks) =>
                  prevTasks.map((task) =>
                    task.id === taskId ? { ...task, completed: !newCompletedState } : task
                  )
                );
                showToast('Action undone', 'success');
              } catch (err) {
                showToast('Failed to undo action', 'error');
              }
            },
          },
          duration: 4000,
        }
      );
    } catch (err: any) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: taskToToggle.completed } : task
        )
      );
      showToast('Failed to update task', 'error');
    }
  };

  const handleEdit = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
    }
  };

  const handleSaveEdit = async (taskId: number, title: string, description: string) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (!taskToEdit) return;

    const originalTitle = taskToEdit.title;
    const originalDescription = taskToEdit.description;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, title, description: description || null, updated_at: new Date().toISOString() }
          : task
      )
    );

    try {
      await api.tasks.update(taskId, { title, description: description || null });
      showToast('Task updated successfully!', 'success');
    } catch (err: any) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, title: originalTitle, description: originalDescription }
            : task
        )
      );
      showToast('Failed to update task', 'error');
      throw err;
    }
  };

  const handleDelete = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setDeletingTask(task);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    setIsDeleting(true);
    const taskToDelete = deletingTask;

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== deletingTask.id));
    setDeletingTask(null);

    try {
      await api.tasks.delete(deletingTask.id);

      // Show success toast with undo action
      showToast('Task deleted successfully', {
        type: 'success',
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              // Recreate the task
              const recreatedTask = await api.tasks.create({
                title: taskToDelete.title,
                description: taskToDelete.description,
                category: taskToDelete.category,
                due_date: taskToDelete.due_date,
                priority: taskToDelete.priority,
                is_recurring: taskToDelete.is_recurring,
                recurrence_type: taskToDelete.recurrence_type,
                recurrence_interval: taskToDelete.recurrence_interval ?? 1,
                recurrence_end_date: taskToDelete.recurrence_end_date,
              });
              setTasks((prevTasks) => [recreatedTask, ...prevTasks]);
              showToast('Task restored', 'success');
            } catch (err) {
              showToast('Failed to restore task', 'error');
            }
          },
        },
        duration: 5000,
      });
    } catch (err: any) {
      setTasks((prevTasks) => [...prevTasks, taskToDelete].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      showToast('Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk actions
  const handleSelectTask = (taskId: number) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    const tasksToDelete = tasks.filter(t => selectedTasks.includes(t.id));
    const taskIds = [...selectedTasks];

    setTasks(prev => prev.filter(t => !selectedTasks.includes(t.id)));
    setSelectedTasks([]);

    try {
      await Promise.all(selectedTasks.map(id => api.tasks.delete(id)));

      // Show success toast with undo action
      showToast(`${taskIds.length} tasks deleted`, {
        type: 'success',
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              // Recreate all deleted tasks
              const recreatedTasks = await Promise.all(
                tasksToDelete.map(task =>
                  api.tasks.create({
                    title: task.title,
                    description: task.description,
                    category: task.category,
                    due_date: task.due_date,
                    priority: task.priority,
                    is_recurring: task.is_recurring,
                    recurrence_type: task.recurrence_type,
                    recurrence_interval: task.recurrence_interval ?? 1,
                    recurrence_end_date: task.recurrence_end_date,
                  })
                )
              );
              setTasks(prev => [...recreatedTasks, ...prev]);
              showToast('Tasks restored', 'success');
            } catch (err) {
              showToast('Failed to restore some tasks', 'error');
            }
          },
        },
        duration: 5000,
      });
    } catch (err: any) {
      setTasks(prev => [...prev, ...tasksToDelete].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      showToast('Failed to delete some tasks', 'error');
    }
  };

  const handleBulkComplete = async () => {
    if (selectedTasks.length === 0) return;

    const originalTasks = tasks.filter(t => selectedTasks.includes(t.id));
    setTasks(prev => prev.map(t =>
      selectedTasks.includes(t.id) ? { ...t, completed: true } : t
    ));

    try {
      await Promise.all(selectedTasks.map(id => api.tasks.update(id, { completed: true })));
      showToast(`${selectedTasks.length} tasks completed`, 'success');
      setSelectedTasks([]);
    } catch (err: any) {
      setTasks(prev => prev.map(t => {
        const original = originalTasks.find(ot => ot.id === t.id);
        return original ? { ...t, completed: original.completed } : t;
      }));
      showToast('Failed to complete some tasks', 'error');
    }
  };

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      description: 'Create new task',
      handler: () => {
        // Scroll to top where the form is
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Focus on the title input
        setTimeout(() => {
          const titleInput = document.getElementById('task-title') as HTMLInputElement;
          titleInput?.focus();
        }, 300);
      },
    },
    {
      key: '/',
      description: 'Focus search',
      handler: () => {
        searchInputRef.current?.focus();
      },
      preventDefault: true,
    },
    {
      key: 'Escape',
      description: 'Close modal',
      handler: () => {
        setEditingTask(null);
        setDeletingTask(null);
        setShowShortcutHelp(false);
      },
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      handler: () => {
        setShowShortcutHelp(true);
      },
      preventDefault: true,
    },
    {
      key: 'l',
      description: 'Switch to list view',
      handler: () => {
        setViewMode('list');
        showToast('Switched to list view', 'success');
      },
    },
    {
      key: 'c',
      description: 'Switch to calendar view',
      handler: () => {
        setViewMode('calendar');
        showToast('Switched to calendar view', 'success');
      },
    },
    {
      key: '1',
      description: 'Show all tasks',
      handler: () => {
        setActiveFilter('all');
      },
    },
    {
      key: '2',
      description: 'Show active tasks',
      handler: () => {
        setActiveFilter('active');
      },
    },
    {
      key: '3',
      description: 'Show completed tasks',
      handler: () => {
        setActiveFilter('completed');
      },
    },
  ]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Page Header with Stats */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                Your Tasks
              </h1>
              <p className="text-lg text-neutral-600">
                Stay organized and productive with your task list
              </p>
            </div>
            {totalTasks > 0 && (
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl shadow-lg">
                <span className="text-3xl font-bold">{completionRate}%</span>
                <span className="text-sm">Complete</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {totalTasks > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-white to-neutral-50 rounded-xl p-5 border border-neutral-200 shadow-md hover:shadow-xl transition-all hover:scale-105 transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📊</span>
                  <div className="text-3xl font-bold text-neutral-900">{totalTasks}</div>
                </div>
                <div className="text-sm font-medium text-neutral-600">Total Tasks</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-md hover:shadow-xl transition-all hover:scale-105 transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⏳</span>
                  <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
                </div>
                <div className="text-sm font-medium text-blue-700">Active</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-md hover:shadow-xl transition-all hover:scale-105 transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">✅</span>
                  <div className="text-3xl font-bold text-green-600">{completedCount}</div>
                </div>
                <div className="text-sm font-medium text-green-700">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-md hover:shadow-xl transition-all hover:scale-105 transform md:hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🎯</span>
                  <div className="text-3xl font-bold text-purple-600">{completionRate}%</div>
                </div>
                <div className="text-sm font-medium text-purple-700">Progress</div>
              </div>
            </div>
          )}
        </div>

        {/* Task Form */}
        <div className="mb-8">
          <TaskForm onSubmit={handleCreateTask} isLoading={isCreating} />
        </div>

        {/* Task Statistics Dashboard */}
        {tasks.length > 0 && <TaskStats tasks={tasks} />}

        {/* Search Bar */}
        {tasks.length > 0 && (
          <div className="relative">
            <SearchBar
              ref={searchInputRef}
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks by title, description, or category..."
            />
            {searchQuery && (
              <div id="search-results-count" className="sr-only" role="status" aria-live="polite">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'result' : 'results'} found
              </div>
            )}
            <button
              onClick={() => setShowShortcutHelp(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-all flex items-center gap-2"
              aria-label="Show keyboard shortcuts help"
              type="button"
            >
              <span aria-hidden="true">⌨️</span>
              <span className="hidden sm:inline">Shortcuts</span>
              <kbd className="px-2 py-0.5 bg-white border border-neutral-300 rounded text-xs" aria-hidden="true">?</kbd>
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        {tasks.length > 0 && (
          <TaskFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />
        )}

        {/* View Toggle and Sort */}
        {tasks.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                📅 Calendar View
              </button>
            </div>

            {/* Sort Dropdown (only show in list view) */}
            {viewMode === 'list' && (
              <TaskSort
                activeSort={sortBy}
                onSortChange={setSortBy}
              />
            )}
          </div>
        )}

        {/* Bulk Actions Bar (only in list view) */}
        {tasks.length > 0 && viewMode === 'list' && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-all font-medium"
            >
              {showBulkActions ? 'Cancel Selection' : 'Select Multiple'}
            </button>

            <div className="flex items-center gap-3">
              {/* Export Button */}
              <ExportButton tasks={filteredTasks} />

              {showBulkActions && selectedTasks.length > 0 && (
                <>
                  <span className="text-sm text-neutral-600">
                    {selectedTasks.length} selected
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-all"
                  >
                    {selectedTasks.length === filteredTasks.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={handleBulkComplete}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
                  >
                    Complete
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={fetchTasks}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {isLoading && <LoadingSkeleton count={3} />}

        {/* Empty State */}
        {!isLoading && !error && tasks.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-12 animate-fade-in">
            <EmptyState
              title="No tasks yet"
              message="Get started by creating your first task above. Stay organized and productive!"
            />
          </div>
        )}

        {/* No Results State */}
        {!isLoading && !error && tasks.length > 0 && filteredTasks.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-12 animate-fade-in text-center">
            <p className="text-xl font-semibold text-neutral-900 mb-2">No tasks found</p>
            <p className="text-neutral-600">Try adjusting your search or filter</p>
          </div>
        )}

        {/* Calendar View */}
        {!isLoading && !error && filteredTasks.length > 0 && viewMode === 'calendar' && (
          <CalendarView
            tasks={filteredTasks}
            onTaskClick={(task) => setEditingTask(task)}
          />
        )}

        {/* Task List */}
        {!isLoading && !error && filteredTasks.length > 0 && viewMode === 'list' && (
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectedTasks={selectedTasks}
            onSelectTask={handleSelectTask}
            showBulkActions={showBulkActions}
          />
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            onSave={handleSaveEdit}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingTask && (
          <DeleteConfirmation
            isOpen={!!deletingTask}
            taskTitle={deletingTask.title}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingTask(null)}
            isDeleting={isDeleting}
          />
        )}

        {/* Keyboard Shortcuts Help Modal */}
        <ShortcutHelpModal
          isOpen={showShortcutHelp}
          onClose={() => setShowShortcutHelp(false)}
        />
      </div>
    </DashboardLayout>
  );
}
