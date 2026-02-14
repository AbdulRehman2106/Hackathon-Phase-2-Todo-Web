'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { api } from '@/lib/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await api.chat.getHistory();
      setMessages(history.messages);
      setConversationId(history.conversation_id);
    } catch (err: any) {
      // If no history exists, that's fine - start fresh
      if (err.status !== 404) {
        console.error('Failed to load conversation history:', err);
      }
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.chat.sendMessage(messageContent);

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationId(response.conversation_id);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="text-xl font-semibold text-white">AI Task Assistant</h2>
        <p className="text-sm text-blue-100">
          Manage your tasks with natural language
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Typing Indicator */}
      {isLoading && <TypingIndicator />}

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
