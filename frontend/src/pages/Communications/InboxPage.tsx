// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
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
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Communications Inbox</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage all customer conversations and communications in one place
            </p>
          </div>

          {/* Main Inbox Layout - Conversation List, Preview, and orders ready for follow-up */}
          <div className="grid gap-6 lg:grid-cols-[2fr,3fr] items-start">
            {/* Conversation List Card */}
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-0 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeCount > 0 ? `${activeCount} active conversations` : 'No active conversations'}
                </p>
              </div>
              <ConversationList onActiveCountChange={setActiveCount} />
            </div>

            {/* Orders Ready for Communication Card */}
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Orders Ready for Follow-up</h2>

              {loadingOrders ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading orders...</p>
                </div>
              ) : ordersError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {ordersError}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No orders ready for communication</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.customer_name || 'Unknown Customer'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}