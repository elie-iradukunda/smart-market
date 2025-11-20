// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchConversationMessages } from '@/api/apiClient'

export default function MessageThread({ conversationId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!conversationId) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchConversationMessages(conversationId)
      .then((data) => {
        if (!isMounted) return
        setMessages(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load messages')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [conversationId])

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Message Thread</h2>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-3 text-xs text-gray-500">Loading messages...</p>
      ) : (
        <div className="mt-3 space-y-2">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={
                'max-w-sm rounded px-3 py-2 text-sm ' +
                (msg.sender === 'staff'
                  ? 'ml-auto bg-primary-600 text-white'
                  : 'mr-auto bg-gray-100 text-gray-900')
              }
            >
              <p>{msg.message}</p>
              <p className="mt-1 text-[10px] opacity-70">
                {msg.channel || 'Conversation'} ·{' '}
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>
          ))}
          {messages.length === 0 && !error && (
            <p className="text-xs text-gray-500">No messages in this conversation yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
