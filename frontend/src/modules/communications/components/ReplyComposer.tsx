// @ts-nocheck
import React, { useState } from 'react'
import { sendConversationMessage } from '@/api/apiClient'

export default function ReplyComposer({ conversationId, onSent }) {
  const [text, setText] = useState('Hi, thanks for reaching out!')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!conversationId || !text.trim()) return
    setSending(true)
    setError(null)
    try {
      await sendConversationMessage({ conversation_id: conversationId, message: text.trim() })
      setText('')
      if (onSent) onSent()
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Reply</h2>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !conversationId || !text.trim()}
          className="rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Insert Template
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Internal Note
        </button>
      </div>
    </div>
  )
}
