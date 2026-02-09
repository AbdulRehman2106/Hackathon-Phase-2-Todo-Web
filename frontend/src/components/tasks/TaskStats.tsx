'use client';

import React, { useMemo } from 'react';
import { Task } from '@/lib/types';

export interface TaskStatsProps {
  tasks: Task[];
}

/**
 * Task Statistics Dashboard showing completion trends and insights.
 */
export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category breakdown
    const categoryStats = tasks.reduce((acc, task) => {
      const cat = task.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = { total: 0, completed: 0 };
      acc[cat].total++;
      if (task.completed) acc[cat].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // Priority breakdown
    const priorityStats = tasks.reduce((acc, task) => {
      const pri = task.priority || 'medium';
      if (!acc[pri]) acc[pri] = { total: 0, completed: 0 };
      acc[pri].total++;
      if (task.completed) acc[pri].completed++;
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // Overdue tasks
    const overdue = tasks.filter(t =>
      !t.completed && t.due_date && new Date(t.due_date) < new Date()
    ).length;

    // Due today
    const today = new Date().toDateString();
    const dueToday = tasks.filter(t =>
      !t.completed && t.due_date && new Date(t.due_date).toDateString() === today
    ).length;

    return {
      total,
      completed,
      pending,
      completionRate,
      categoryStats,
      priorityStats,
      overdue,
      dueToday,
    };
  }, [tasks]);

  if (tasks.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-white to-neutral-50 dark:bg-neutral-800 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-8 shadow-xl mb-8 animate-slide-up hover:shadow-2xl transition-all duration-300">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-6 flex items-center gap-2">
        📊 Task Statistics & Insights
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-5 border-2 border-primary-200 dark:border-primary-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 transform animate-slide-up">
          <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">{stats.completionRate}%</div>
          <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-400 mb-3">Completion Rate</div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 dark:bg-primary-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-5 border-2 border-red-200 dark:border-red-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 transform animate-slide-up stagger-1">
          <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.overdue}</div>
          <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-400 mb-2">Overdue Tasks</div>
          {stats.overdue > 0 && (
            <div className="mt-2 text-xs text-red-700 dark:text-red-400 font-bold flex items-center gap-1 animate-pulse">
              <span className="text-base">⚠️</span> Needs attention
            </div>
          )}
        </div>

        {/* Due Today */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-5 border-2 border-orange-200 dark:border-orange-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 transform animate-slide-up stagger-2">
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-1">{stats.dueToday}</div>
          <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-400 mb-2">Due Today</div>
          {stats.dueToday > 0 && (
            <div className="mt-2 text-xs text-orange-700 dark:text-orange-400 font-bold flex items-center gap-1">
              <span className="text-base">📅</span> Focus on these
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 transform animate-slide-up stagger-3">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.pending}</div>
          <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-400 mb-2">Pending Tasks</div>
          <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">{stats.completed} completed</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryStats).length > 0 && (
        <div className="mb-8">
          <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-300 mb-4 flex items-center gap-2">
            <span className="text-lg">🏷️</span> By Category
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats.categoryStats).map(([category, data], index) => (
              <div
                key={category}
                className="bg-gradient-to-br from-white to-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 border-2 border-neutral-200 dark:border-neutral-600 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-2">{category}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-3">
                  {data.completed}/{data.total} completed
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(data.completed / data.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Breakdown */}
      <div>
        <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-300 mb-4 flex items-center gap-2">
          <span className="text-lg">🔥</span> By Priority
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(stats.priorityStats).map(([priority, data], index) => {
            const colors = {
              high: 'bg-gradient-to-br from-red-50 to-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400',
              medium: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
              low: 'bg-gradient-to-br from-green-50 to-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-800 text-green-700 dark:text-green-400',
            };
            const icons = {
              high: '🔴',
              medium: '🟡',
              low: '🟢',
            };
            return (
              <div
                key={priority}
                className={`rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform animate-fade-in ${colors[priority as keyof typeof colors]}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-sm font-bold capitalize flex items-center gap-2">
                  <span className="text-base">{icons[priority as keyof typeof icons]}</span>
                  {priority}
                </div>
                <div className="text-xs font-semibold opacity-90 mt-2">
                  {data.completed}/{data.total} tasks
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
