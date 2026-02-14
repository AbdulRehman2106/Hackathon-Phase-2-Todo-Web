'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)]">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
            AI Task Assistant
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your tasks using natural language - just tell me what you need!
          </p>
        </div>

        <div className="h-[calc(100%-6rem)]">
          <ChatInterface />
        </div>
      </div>
    </DashboardLayout>
  );
}
