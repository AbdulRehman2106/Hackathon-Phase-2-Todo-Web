'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/lib/types';

export interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

/**
 * Calendar view component for visualizing tasks by due date
 */
export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Group tasks by date
    const tasksByDate: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = new Date(task.due_date).toDateString();
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
      }
    });

    return {
      year,
      month,
      daysInMonth,
      startingDayOfWeek,
      tasksByDate,
    };
  }, [currentDate, tasks]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(calendarData.year, calendarData.month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(calendarData.year, calendarData.month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      calendarData.month === today.getMonth() &&
      calendarData.year === today.getFullYear()
    );
  };

  const getTasksForDay = (day: number) => {
    const date = new Date(calendarData.year, calendarData.month, day);
    const dateKey = date.toDateString();
    return calendarData.tasksByDate[dateKey] || [];
  };

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < calendarData.startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= calendarData.daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          📅 Calendar View
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Month and Year */}
      <div className="text-center mb-4">
        <h4 className="text-2xl font-bold text-neutral-900">
          {monthNames[calendarData.month]} {calendarData.year}
        </h4>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-neutral-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayTasks = getTasksForDay(day);
          const hasOverdue = dayTasks.some(t => !t.completed && new Date(t.due_date!) < new Date());
          const completedCount = dayTasks.filter(t => t.completed).length;
          const pendingCount = dayTasks.filter(t => !t.completed).length;

          return (
            <div
              key={day}
              className={`aspect-square border rounded-lg p-2 transition-all hover:shadow-md ${
                isToday(day)
                  ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                  : 'border-neutral-200 hover:border-primary-200'
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Day number */}
                <div className={`text-sm font-semibold mb-1 ${
                  isToday(day) ? 'text-primary-700' : 'text-neutral-700'
                }`}>
                  {day}
                </div>

                {/* Task indicators */}
                {dayTasks.length > 0 && (
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(task => (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={`text-xs px-1.5 py-0.5 rounded truncate text-left transition-colors ${
                          task.completed
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : hasOverdue
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                        title={task.title}
                      >
                        {task.completed ? '✓' : '○'} {task.title}
                      </button>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-neutral-500 px-1.5">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Task count summary */}
                {dayTasks.length > 0 && (
                  <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                    {pendingCount > 0 && <span className="text-blue-600">{pendingCount}</span>}
                    {completedCount > 0 && <span className="text-green-600">✓{completedCount}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span className="text-neutral-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span className="text-neutral-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span className="text-neutral-600">Overdue</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
