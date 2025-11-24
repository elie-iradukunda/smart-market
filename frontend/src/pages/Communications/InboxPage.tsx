// @ts-nocheck
import React, { useEffect, useState } from 'react'
import ConversationList from '../../modules/communications/components/ConversationList'
import { fetchOrdersReadyForCommunication } from '@/api/apiClient'

export default function InboxPage() {
  const [activeCount, setActiveCount] = useState(0)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoadingOrders(true)
    setOrdersError(null)

    fetchOrdersReadyForCommunication()
      .then((data) => {
        if (!isMounted) return
        setOrders(data || [])
      })
      .catch((err: any) => {
        if (!isMounted) return
        setOrdersError(err.message || 'Failed to load orders ready for communication')
      })
      .finally(() => {
        if (!isMounted) return
        setLoadingOrders(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

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

      {/* Main Inbox Layout - Conversation List, Preview, and orders ready for follow-up */}
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
        <div className="hidden lg:block rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl min-h-[400px] space-y-6">
          <p className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">Conversation Preview</p>

          <div className="flex items-center justify-center h-48 bg-gray-50/70 rounded-xl border border-dashed border-gray-300">
            <p className="text-base font-medium text-gray-500 p-4 text-center">
              Select a conversation on the left to load the full message history and reply interface here (demo placeholder).
            </p>
          </div>

          <div className="space-y-3">
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

          {/* Orders ready for communication - Reception helper */}
          <div className="mt-6 rounded-2xl border border-green-100 bg-green-50/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-green-900">Customers with orders ready</p>
              {loadingOrders && <span className="text-[11px] text-green-700">Loading...</span>}
            </div>
            {ordersError && (
              <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1">{ordersError}</p>
            )}
            {!loadingOrders && !ordersError && orders.length === 0 && (
              <p className="text-[11px] text-green-800/80">No ready or delivered orders requiring follow-up right now.</p>
            )}
            {!loadingOrders && !ordersError && orders.length > 0 && (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {orders.map((o) => {
                  const phone = (o.customer_phone || '').replace(/[^0-9+]/g, '')
                  const message = `Hello ${o.customer_name || ''}, your order #${o.order_id} is ${o.status}. Can we confirm payment and delivery?`
                  const waUrl = phone ? `https://wa.me/${phone.startsWith('+') ? phone.slice(1) : phone}?text=${encodeURIComponent(message)}` : null

                  return (
                    <li
                      key={o.order_id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-white/90 border border-green-100 px-3 py-2"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{o.customer_name}</p>
                        <p className="text-[11px] text-gray-600">
                          Order #{o.order_id} · <span className="capitalize">{o.status}</span>
                        </p>
                      </div>
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-green-700"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-500">No phone</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}