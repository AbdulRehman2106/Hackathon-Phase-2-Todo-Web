'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/types';

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Start a conversation
          </h3>
          <p className="text-gray-500 max-w-md">
            Ask me to add, view, complete, update, or delete your tasks using natural language.
          </p>
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p className="font-medium">Try saying:</p>
            <ul className="space-y-1">
              <li>"Add a task to buy groceries tomorrow"</li>
              <li>"Show me all my tasks"</li>
              <li>"Mark task 5 as complete"</li>
              <li>"Delete the meeting task"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
            <div
              className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
