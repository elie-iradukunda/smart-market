import React from 'react';
import MessageThread from '../../modules/communications/components/MessageThread';
import ReplyComposer from '../../modules/communications/components/ReplyComposer';

export default function ConversationDetailPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Communications</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Conversation detail</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Full message history with a single customer, plus tools to reply quickly with the right tone and context.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2.2fr,2fr] items-start">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <MessageThread />
        </div>
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <ReplyComposer />
        </div>
      </div>
    </div>
  );
}

