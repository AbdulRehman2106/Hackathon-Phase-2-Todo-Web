'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/lib/types';

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="text-7xl animate-bounce">🤖</div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            AI Task Assistant Ready!
          </h3>
          <p className="text-gray-600 max-w-md mb-8">
            I can help you manage your tasks using natural language in multiple languages.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-blue-100">
              <div className="text-2xl mb-2">➕</div>
              <p className="text-sm font-medium text-gray-700">Add Task</p>
              <p className="text-xs text-gray-500 mt-1">"Add a task to buy groceries"</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-purple-100">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm font-medium text-gray-700">View Tasks</p>
              <p className="text-xs text-gray-500 mt-1">"Show me all my tasks"</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-green-100">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm font-medium text-gray-700">Complete Task</p>
              <p className="text-xs text-gray-500 mt-1">"Mark task 5 as complete"</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-red-100">
              <div className="text-2xl mb-2">🗑️</div>
              <p className="text-sm font-medium text-gray-700">Delete Task</p>
              <p className="text-xs text-gray-500 mt-1">"Delete the meeting task"</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Multilingual</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Voice Input</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
            }`}>
              {message.role === 'user' ? '👤' : '🤖'}
            </div>

            {/* Message Bubble */}
            <div className="flex flex-col space-y-1">
              <div
                className={`rounded-2xl px-4 py-3 shadow-md hover:shadow-lg transition-all ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                    : 'bg-white text-gray-900 rounded-tl-sm border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {message.content}
                </div>

                {/* Message Footer */}
                <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                  message.role === 'user' ? 'border-blue-500' : 'border-gray-200'
                }`}>
                  <div
                    className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className={`ml-2 p-1 rounded hover:bg-opacity-20 transition-colors ${
                      message.role === 'user' ? 'hover:bg-white' : 'hover:bg-gray-200'
                    }`}
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <svg className={`w-4 h-4 ${message.role === 'user' ? 'text-blue-100' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className={`w-4 h-4 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
