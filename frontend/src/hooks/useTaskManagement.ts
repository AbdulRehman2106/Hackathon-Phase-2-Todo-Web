import { useState, useCallback } from 'react';
import { Task, CreateTaskPayload } from '@/lib/types';
import { api } from '@/lib/api';

interface UseTaskManagementOptions {
  onSuccess?: (message: string, type: 'success' | 'error') => void;
  onError?: (message: string) => void;
}

/**
 * Custom hook to manage task CRUD operations with optimistic updates.
 * Extracts task management logic from the dashboard component.
 *
 * @param options - Callbacks for success and error handling
 * @returns Task management functions and state
 */
export function useTaskManagement(options: UseTaskManagementOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { onSuccess, onError } = options;

  // Fetch all tasks
  const fetchTasks = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError('');

    try {
      const fetchedTasks = await api.tasks.list(signal);
      setTasks(fetchedTasks);
    } catch (err: any) {
      // Ignore aborted requests
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }
      const errorMessage = err.message || 'Failed to load tasks. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  // Create a new task with optimistic update
  const createTask = useCallback(async (payload: CreateTaskPayload) => {
    const optimisticTask: Task = {
      id: Date.now(),
      user_id: 0,
      title: payload.title,
      description: payload.description ?? null,
      completed: false,
      category: payload.category ?? null,
      due_date: payload.due_date ?? null,
      priority: payload.priority || 'medium',
      is_recurring: payload.is_recurring ?? false,
      recurrence_type: payload.recurrence_type ?? null,
      recurrence_interval: payload.recurrence_interval ?? null,
      recurrence_end_date: payload.recurrence_end_date ?? null,
      parent_task_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prevTasks) => [optimisticTask, ...prevTasks]);

    try {
      const createdTask = await api.tasks.create(payload);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === optimisticTask.id ? createdTask : task))
      );
      onSuccess?.('Task created successfully!', 'success');
      return createdTask;
    } catch (err: any) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== optimisticTask.id));
      onError?.('Failed to create task');
      throw err;
    }
  }, [onSuccess, onError]);

  // Update a task with optimistic update
  const updateTask = useCallback(async (
    taskId: number,
    updates: Partial<Pick<Task, 'title' | 'description' | 'completed' | 'category' | 'due_date' | 'priority'>>
  ) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const originalTask = { ...taskToUpdate };

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      )
    );

    try {
      await api.tasks.update(taskId, updates);
      onSuccess?.('Task updated successfully!', 'success');
    } catch (err: any) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? originalTask : task))
      );
      onError?.('Failed to update task');
      throw err;
    }
  }, [tasks, onSuccess, onError]);

  // Delete a task with optimistic update
  const deleteTask = useCallback(async (taskId: number) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

    try {
      await api.tasks.delete(taskId);
      onSuccess?.('Task deleted successfully', 'success');
      return taskToDelete;
    } catch (err: any) {
      setTasks((prevTasks) => [...prevTasks, taskToDelete].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      onError?.('Failed to delete task');
      throw err;
    }
  }, [tasks, onSuccess, onError]);

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

export default useTaskManagement;
