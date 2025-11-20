// @ts-nocheck
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MessageThread from '../../modules/communications/components/MessageThread'
import ReplyComposer from '../../modules/communications/components/ReplyComposer'
import { updateConversationStatus, sendConversationMessage } from '@/api/apiClient'

export default function ConversationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const conversationId = id
  const [actionError, setActionError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)

  // Sidebar context is still mocked for now; can be wired to backend conversation + customer data later
  const customerContext = {
    name: 'Customer',
    phone: '+1 555 123 4567',
    channel: 'WhatsApp',
    status: 'High Priority',
    lastOrder: 'ORD-23001',
    assignedTo: 'Joseph A.',
  };

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">Communications</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Conversation {conversationId}</span> Thread
        </h1>

        <p className="mt-3 text-base text-gray-600 max-w-xl">
          Full message history with a single customer, plus tools to reply quickly with the right tone and context.
        </p>
      </div>

      {/* Main Grid: Message Column (left) and Context Column (right) */}
      <div className="grid gap-6 lg:grid-cols-[2.5fr,1.5fr] items-start">
        
        {/* Message Thread and Composer Column (Primary Focus) */}
        <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-4 shadow-xl space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 px-2">Message History</h2>
          
          {/* Message Thread Area (often needs height constraint in real app) */}
          <div className="h-[450px] overflow-y-auto border-y border-gray-100 py-3">
            <MessageThread conversationId={conversationId} />
          </div>

          {/* Reply Composer Area */}
          <div className="p-2 pt-0">
            <ReplyComposer conversationId={conversationId} onSent={() => { /* could trigger a refresh via parent if needed */ }} />
          </div>
        </div>
        
        {/* Context Sidebar and Actions Column */}
        <div className="space-y-6">
          
          {/* Customer Context Card */}
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Customer Context</h2>
            <div className="space-y-3">
              <div className="text-sm flex justify-between">
                <span className="font-medium text-gray-600">Customer Name:</span>
                <span className="font-semibold text-gray-800">{customerContext.name}</span>
              </div>
              <div className="text-sm flex justify-between">
                <span className="font-medium text-gray-600">Channel:</span>
                <span className="font-semibold text-blue-600 flex items-center gap-1">
                  {/* Placeholder for Channel Icon */}
                  <span className="text-lg">💬</span> {customerContext.channel}
                </span>
              </div>
              <div className="text-sm flex justify-between">
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="font-semibold text-gray-800">{customerContext.phone}</span>
              </div>
              <div className="text-sm flex justify-between">
                <span className="font-medium text-gray-600">Last Order:</span>
                <span className="font-semibold text-purple-600">{customerContext.lastOrder}</span>
              </div>
              <div className="text-sm flex justify-between">
                <span className="font-medium text-gray-600">Assigned To:</span>
                <span className="font-semibold text-gray-800">{customerContext.assignedTo}</span>
              </div>
            </div>
          </div>
          
          {/* Actions Card */}
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b pb-2">Conversation Actions</h2>
            {actionError && (
              <p className="mb-2 rounded-md bg-red-50 border border-red-200 px-2 py-1 text-xs text-red-700">{actionError}</p>
            )}
            <button
              type="button"
              disabled={!conversationId || resolving}
              onClick={async () => {
                if (!conversationId) return
                setActionError(null)
                setResolving(true)
                try {
                  await updateConversationStatus(conversationId, 'closed')
                  navigate('/communications/inbox')
                } catch (err: any) {
                  setActionError(err.message || 'Failed to mark conversation as resolved')
                } finally {
                  setResolving(false)
                }
              }}
              className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150"
            >
              {resolving ? 'Marking as Resolved...' : 'Mark as Resolved'}
            </button>
            <button
              type="button"
              disabled={!conversationId}
              onClick={async () => {
                if (!conversationId) return
                setActionError(null)
                try {
                  await sendConversationMessage({ conversation_id: conversationId, message: '[System] Conversation transferred to manager' })
                } catch (err: any) {
                  setActionError(err.message || 'Failed to transfer to manager')
                }
              }}
              className="w-full rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition duration-150"
            >
              Transfer to Manager
            </button>
            <button
              type="button"
              disabled={!conversationId}
              onClick={async () => {
                if (!conversationId) return
                setActionError(null)
                try {
                  await sendConversationMessage({ conversation_id: conversationId, message: '[System] Follow-up task created from this conversation' })
                } catch (err: any) {
                  setActionError(err.message || 'Failed to create follow-up task')
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              Create Follow-up Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}