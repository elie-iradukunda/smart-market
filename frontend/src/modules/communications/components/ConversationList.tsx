// @ts-nocheck
import React, { useEffect } from 'react'

export default function ConversationList({ onActiveCountChange }) {
  useEffect(() => {
    // Set count to 0 since we're not fetching conversations
    if (onActiveCountChange) onActiveCountChange(0)
  }, [onActiveCountChange])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-xs sm:text-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-gray-900">Inbox</p>
        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] border border-emerald-100">
          SLA: 95% on time
        </span>
      </div>
      <div className="py-8 text-center">
        <p className="text-sm text-gray-600 mb-2">WhatsApp Communication</p>
        <p className="text-xs text-gray-500">
          Use the "Orders Ready for Follow-up" section to contact customers via WhatsApp when their orders are ready.
        </p>
      </div>
    </div>
  )
}
