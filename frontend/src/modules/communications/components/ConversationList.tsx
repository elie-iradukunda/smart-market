// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDemoConversations } from '@/api/apiClient'

export default function ConversationList({ onCountChange }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setError(null)

    const list = fetchDemoConversations()
    const safeList = Array.isArray(list) ? list : []
    setConversations(safeList)
    if (onCountChange) onCountChange(safeList.length)
    setLoading(false)
  }, [onCountChange])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-xs sm:text-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-gray-900">Inbox</p>
        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] border border-emerald-100">
          SLA: 95% on time
        </span>
      </div>
      {error && <p className="mb-2 text-[11px] text-red-600">{error}</p>}
      {loading ? (
        <p className="text-[11px] text-gray-500">Loading conversations...</p>
      ) : (
        <div className="space-y-1 max-h-[360px] overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => navigate(`/communications/conversations/${conv.id}`)}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div>
                <p className="text-gray-900 font-medium">{conv.customer || conv.customer_name || conv.contact_name}</p>
                <p className="text-[11px] text-gray-600">{conv.subject || conv.last_message || ''}</p>
              </div>
              <div className="text-right text-[11px]">
                <p className="text-gray-500">{conv.channel || conv.channel_type}</p>
                <p className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {conv.slaStatus || conv.sla_status || 'On Track'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
