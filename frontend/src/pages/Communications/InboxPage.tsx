// @ts-nocheck
import React, { useState } from 'react'
import ConversationList from '../../modules/communications/components/ConversationList'

export default function InboxPage() {
  const [activeCount, setActiveCount] = useState(0)
  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Customer Support</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Unified <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Inbox</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          WhatsApp Business, Instagram, Facebook, email, and web chat in one queue. Prioritise customers waiting for a reply.
        </p>
      </div>

      {/* Main Inbox Layout - Conversation List and Preview */}
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr] items-start">
        
        {/* Conversation List Card - Applying the consistent card style */}
        <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-0 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-lg font-semibold text-gray-900">Conversations ({activeCount} Active)</p>
          </div>
          {/* The ConversationList component goes here */}
          <ConversationList onCountChange={setActiveCount} />
          <div className="p-3 border-t border-gray-100 flex justify-center bg-gray-50/50">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Load more...
            </button>
          </div>
        </div>
        
        {/* Preview Panel Card - Applying the consistent card style */}
        <div className="hidden lg:block rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl min-h-[400px]">
          <p className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Conversation Preview</p>
          
          <div className="flex items-center justify-center h-48 bg-gray-50/70 rounded-xl border border-dashed border-gray-300">
            <p className="text-base font-medium text-gray-500 p-4 text-center">
              Select a conversation on the left to load the full message history and reply interface here (demo placeholder).
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium text-gray-800">Channel:</span>
              <span>WhatsApp</span>
            </div>
            <div className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium text-gray-800">Assigned To:</span>
              <span>Unassigned</span>
            </div>
            <div className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium text-gray-800">Last Message:</span>
              <span>2 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}