import React from 'react';
import ConversationList from '../../modules/communications/components/ConversationList';

export default function InboxPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Communications</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Unified inbox</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          WhatsApp Business, Instagram, Facebook, email, and web chat in one queue. Prioritise customers waiting for
          a reply.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2.2fr,2fr] items-start">
        <ConversationList />
        <div className="hidden rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500 lg:block">
          <p className="font-medium text-gray-900 mb-1">Preview panel</p>
          <p>Select a conversation on the left to preview messages here (demo placeholder).</p>
        </div>
      </div>
    </div>
  );
}

