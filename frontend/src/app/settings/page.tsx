'use client';

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

/**
 * Settings page for app configuration
 */
export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">
            Settings
          </h2>
          <p className="text-base text-neutral-600">
            Manage your app preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* App Info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              About
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Version</span>
                <span className="font-medium text-neutral-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Build</span>
                <span className="font-medium text-neutral-900">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Status</span>
                <span className="font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>

          {/* Cache Management */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Storage
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Clear cached data to free up space. Your tasks will be re-downloaded from the server.
            </p>
            <button
              onClick={async () => {
                if ('caches' in window) {
                  const cacheNames = await caches.keys();
                  await Promise.all(cacheNames.map(name => caches.delete(name)));
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium text-sm"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
