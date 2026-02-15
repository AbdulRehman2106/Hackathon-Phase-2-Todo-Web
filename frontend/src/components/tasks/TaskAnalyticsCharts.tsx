'use client';

import { Task } from '@/lib/types';
import { useMemo } from 'react';

interface TaskAnalyticsChartsProps {
  tasks: Task[];
}

export default function TaskAnalyticsCharts({ tasks }: TaskAnalyticsChartsProps) {
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Category distribution
    const categoryCount: Record<string, number> = {};
    tasks.forEach((task) => {
      const cat = task.category || 'Other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Priority distribution
    const priorityCount = {
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    };

    // Weekly activity (last 7 days)
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayTasks = tasks.filter((t) => {
        const taskDate = new Date(t.created_at);
        return taskDate.toDateString() === date.toDateString();
      });
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: dayTasks.length,
      };
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      categoryCount,
      priorityCount,
      weeklyActivity,
    };
  }, [tasks]);

  const categoryColors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-red-500 to-red-600',
    'from-yellow-500 to-yellow-600',
    'from-pink-500 to-pink-600',
  ];

  const maxWeeklyCount = Math.max(...analytics.weeklyActivity.map((d) => d.count), 1);

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <span>📊</span> Task Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Pie Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-md">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Completion Rate
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Pie chart using conic-gradient */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
                    from 0deg,
                    #10b981 0deg ${analytics.completionRate * 3.6}deg,
                    #e5e7eb ${analytics.completionRate * 3.6}deg 360deg
                  )`,
                }}
              ></div>
              <div className="absolute inset-4 bg-white dark:bg-neutral-800 rounded-full flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                  {Math.round(analytics.completionRate)}%
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Complete</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Completed ({analytics.completed})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-neutral-300 dark:bg-neutral-600 rounded"></div>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Pending ({analytics.pending})
              </span>
            </div>
          </div>
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-md">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Priority Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.priorityCount).map(([priority, count]) => {
              const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              const colors = {
                high: 'bg-red-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500',
              };

              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                      {priority === 'high' && '🔴'} {priority === 'medium' && '🟡'}{' '}
                      {priority === 'low' && '🟢'} {priority}
                    </span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[priority as keyof typeof colors]} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity Line Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-md">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Weekly Activity
          </h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {analytics.weeklyActivity.map((day, index) => {
              const height = (day.count / maxWeeklyCount) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center h-40">
                    <div
                      className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-1000 ease-out hover:from-primary-700 hover:to-primary-500 cursor-pointer group"
                      style={{ height: `${height}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded">
                        {day.count}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-md">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Tasks by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.categoryCount)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count], index) => {
                const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                const colorClass = categoryColors[index % categoryColors.length];

                return (
                  <div key={category} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {category}
                        </span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
