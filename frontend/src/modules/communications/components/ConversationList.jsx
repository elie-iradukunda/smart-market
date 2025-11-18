import React from 'react';
import { fetchDemoConversations } from '../../../api/apiClient';
import SlaBadge from './SlaBadge';

export default function ConversationList() {
  const conversations = fetchDemoConversations();

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Open Conversations</h2>
      <ul className="mt-3 space-y-2">
        {conversations.map(conv => (
          <li
            key={conv.id}
            className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 hover:bg-gray-50"
          >
            <div>
              <p className="text-gray-800">{conv.customer}</p>
              <p className="text-xs text-gray-500">
                {conv.channel} · {conv.subject}
              </p>
            </div>
            <SlaBadge status={conv.slaStatus} />
          </li>
        ))}
      </ul>
    </div>
  );
}

