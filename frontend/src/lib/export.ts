'use client';

import { Task } from '@/lib/types';

/**
 * Export tasks to CSV format
 */
export const exportToCSV = (tasks: Task[], filename: string = 'tasks.csv') => {
  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Description',
    'Category',
    'Priority',
    'Status',
    'Due Date',
    'Is Recurring',
    'Recurrence Type',
    'Created At',
    'Updated At'
  ];

  // Convert tasks to CSV rows
  const rows = tasks.map(task => [
    task.id,
    `"${task.title.replace(/"/g, '""')}"`, // Escape quotes
    `"${(task.description || '').replace(/"/g, '""')}"`,
    task.category || '',
    task.priority || 'medium',
    task.completed ? 'Completed' : 'Pending',
    task.due_date || '',
    task.is_recurring ? 'Yes' : 'No',
    task.recurrence_type || '',
    task.created_at,
    task.updated_at
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export tasks to PDF format
 */
export const exportToPDF = async (tasks: Task[], filename: string = 'tasks.pdf') => {
  // Dynamic import to reduce bundle size
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('My Tasks', 14, 20);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Tasks: ${tasks.length}`, 14, 34);
  doc.text(`Completed: ${tasks.filter(t => t.completed).length}`, 14, 40);

  // Add tasks
  let yPosition = 50;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  const lineHeight = 6;

  doc.setFontSize(12);

  tasks.forEach((task, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    // Task number and title
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${task.title}`, margin, yPosition);
    yPosition += lineHeight;

    // Task details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (task.description) {
      const descLines = doc.splitTextToSize(`Description: ${task.description}`, 180);
      doc.text(descLines, margin + 5, yPosition);
      yPosition += lineHeight * descLines.length;
    }

    // Status, Priority, Category
    const details = [];
    details.push(`Status: ${task.completed ? '✓ Completed' : '○ Pending'}`);
    if (task.priority) details.push(`Priority: ${task.priority}`);
    if (task.category) details.push(`Category: ${task.category}`);
    if (task.due_date) details.push(`Due: ${new Date(task.due_date).toLocaleDateString()}`);
    if (task.is_recurring) details.push(`Recurring: ${task.recurrence_type}`);

    doc.text(details.join(' | '), margin + 5, yPosition);
    yPosition += lineHeight + 3;

    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, 200 - margin, yPosition);
    yPosition += 5;
  });

  // Save PDF
  doc.save(filename);
};

/**
 * Export tasks based on format
 */
export const exportTasks = async (
  tasks: Task[],
  format: 'csv' | 'pdf',
  filename?: string
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `tasks_${timestamp}.${format}`;

  if (format === 'csv') {
    exportToCSV(tasks, filename || defaultFilename);
  } else if (format === 'pdf') {
    await exportToPDF(tasks, filename || defaultFilename);
  }
};
