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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = orders.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Orders Ready for Follow-up</h2>
                {orders.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {orders.length} total order{orders.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

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
                <>
                  <div className="space-y-3">
                    {currentOrders.map((order: any) => {
                      const handleWhatsAppClick = () => {
                        const phone = order.customer_phone || order.phone || ''
                        const message = `Hello ${order.customer_name || 'valued customer'}! Your order #${order.id} is ready for pickup. Please visit us at your earliest convenience. Thank you!`
                        const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
                        window.open(whatsappUrl, '_blank')
                      }

                      return (
                        <div
                          key={order.id}
                          onClick={handleWhatsAppClick}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50/50 cursor-pointer transition group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700">
                              Order #{order.id}
                            </p>
                            <p className="text-xs text-gray-600">
                              {order.customer_name || 'Unknown Customer'}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {order.status || 'Pending'}
                            </span>
                            <svg className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(endIndex, orders.length)}</span> of{' '}
                          <span className="font-medium">{orders.length}</span> orders
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition ${currentPage === page
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next
                          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}