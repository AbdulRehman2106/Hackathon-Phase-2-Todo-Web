/**
 * AI Task Enhancement Component
 *
 * Provides AI-powered enhancements for task creation and editing:
 * - Description enhancement
 * - Auto-categorization
 * - Complexity analysis
 */

'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface AITaskEnhancementProps {
  title: string;
  description: string;
  onEnhance: (enhanced: {
    description?: string;
    category?: string;
    priority?: string;
    tags?: string[];
    complexity?: string;
    estimatedTime?: string;
  }) => void;
}

export default function AITaskEnhancement({ title, description, onEnhance }: AITaskEnhancementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const enhanceTask = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Run all AI enhancements in parallel
      const [enhancedDesc, categorization, complexity] = await Promise.all([
        api.ai.enhanceDescription(title, description),
        api.ai.categorizeTask(title, description),
        api.ai.analyzeComplexity(title, description),
      ]);

      const enhancementResults = {
        description: enhancedDesc,
        category: categorization.category,
        priority: categorization.priority,
        tags: categorization.tags,
        complexity: complexity.complexity,
        estimatedTime: complexity.estimated_time,
        needsSubtasks: complexity.needs_subtasks,
      };

      setResults(enhancementResults);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance task');
    } finally {
      setLoading(false);
    }
  };

  const applyEnhancements = () => {
    if (results) {
      onEnhance({
        description: results.description,
        category: results.category,
        priority: results.priority,
        tags: results.tags,
        complexity: results.complexity,
        estimatedTime: results.estimatedTime,
      });
      setShowResults(false);
      setResults(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhance Button */}
      <button
        onClick={enhanceTask}
        disabled={loading || !title.trim()}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enhancing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            AI Enhance
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Enhancement Results */}
      {showResults && results && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">AI Enhancement Results</h3>
            <button
              onClick={() => setShowResults(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Enhanced Description */}
            {results.description && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Enhanced Description
                </label>
                <p className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-200">
                  {results.description}
                </p>
              </div>
            )}

            {/* Categorization */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {results.category}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  results.priority === 'High' ? 'bg-red-100 text-red-800' :
                  results.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {results.priority}
                </span>
              </div>
            </div>

            {/* Tags */}
            {results.tags && results.tags.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Suggested Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {results.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Complexity Analysis */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Complexity
                </label>
                <span className="text-sm text-gray-900 font-medium">
                  {results.complexity}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Estimated Time
                </label>
                <span className="text-sm text-gray-900 font-medium">
                  {results.estimatedTime}
                </span>
              </div>
            </div>

            {results.needsSubtasks && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-700">
                  💡 This task might benefit from breaking it down into subtasks
                </p>
              </div>
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={applyEnhancements}
            className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Apply Enhancements
          </button>
        </div>
      )}
    </div>
  );
}
