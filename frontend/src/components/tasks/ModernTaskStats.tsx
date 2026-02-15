'use client';

import { Task } from '@/lib/types';

interface ModernTaskStatsProps {
  tasks: Task[];
}

export default function ModernTaskStats({ tasks }: ModernTaskStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: '📋',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Pending',
      value: pendingTasks,
      icon: '⏳',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: '📊',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`${stat.bgColor} rounded-2xl p-6 card-hover transition-smooth animate-slide-up border border-neutral-200 dark:border-neutral-700`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`text-4xl animate-float`} style={{ animationDelay: `${index * 0.2}s` }}>
              {stat.icon}
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xl font-bold">
                {typeof stat.value === 'number' ? stat.value : stat.value.replace('%', '')}
              </span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            {stat.label}
          </h3>
          <p className={`text-3xl font-bold ${stat.textColor}`}>
            {stat.value}
          </p>

          {/* Progress bar for completion rate */}
          {stat.label === 'Completion Rate' && (
            <div className="mt-4 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
