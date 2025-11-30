// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchOrders, fetchCustomers, fetchConversations } from '@/api/apiClient'
import { MessageSquare, Users, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function SupportDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadConversations: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
    recentCustomers: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSupportData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch data in parallel
        const [conversations, orders, customers] = await Promise.all([
          fetchConversations().catch(() => []),
          fetchOrders().catch(() => []),
          fetchCustomers().catch(() => []),
        ])

        // Calculate stats
        const conversationList = Array.isArray(conversations) ? conversations : []
        const ordersList = Array.isArray(orders) ? orders : []
        const customersList = Array.isArray(customers) ? customers : []

        // Count unread conversations (if they have an unread flag)
        const unread = conversationList.filter(c => c.unread || c.status === 'unread').length

        // Count pending orders (orders that need attention)
        const pending = ordersList.filter(o =>
          o.status === 'pending' ||
          o.status === 'processing' ||
          o.status === 'in_production'
        ).length

        // Get recent orders (last 5)
        const recent = ordersList
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)

        // Get recent customers (last 5)
        const recentCust = customersList
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)

        setStats({
          totalConversations: conversationList.length,
          unreadConversations: unread,
          pendingOrders: pending,
          totalCustomers: customersList.length,
          recentOrders: recent,
          recentCustomers: recentCust,
        })
      } catch (err: any) {
        console.error('Failed to load support dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadSupportData()
  }, [])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-sky-50/50 via-white to-indigo-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header section */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Customer support</p>
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  Reply faster to
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-600"> every customer message</span>
                </h1>
                <p className="mt-4 text-base text-gray-600 max-w-2xl">
                  See the shared inbox and active conversations so support agents never miss an important request.
                </p>
              </div>

              {/* Quick Stats */}
              <dl className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
                <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                  <dt className="text-xs font-medium text-gray-500">Total Conversations</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalConversations}
                  </dd>
                </div>
                <div className="rounded-xl bg-indigo-50/90 px-4 py-3 border border-indigo-200 shadow-lg ring-1 ring-indigo-500/10">
                  <dt className="text-xs font-medium text-indigo-700">Unread Messages</dt>
                  <dd className="mt-1 text-2xl font-bold text-indigo-800">
                    {loading ? '...' : stats.unreadConversations}
                  </dd>
                </div>
                <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                  <dt className="text-xs font-medium text-gray-500">Pending Orders</dt>
                  <dd className="mt-1 text-2xl font-bold text-amber-600">
                    {loading ? '...' : stats.pendingOrders}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <Link
                  to="/communications/inbox"
                  className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 transition"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Open Inbox
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Orders
                </Link>
                <Link
                  to="/crm/customers"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Customers
                </Link>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
              <img
                src="https://images.pexels.com/photos/8867438/pexels-photo-8867438.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Support agent assisting a customer"
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <p className="text-sm font-medium uppercase tracking-wider text-indigo-200">Support snapshot</p>
                <p className="mt-2 text-base text-gray-100 max-w-sm">
                  Work from a single inbox for email, SMS, and WhatsApp and respond with full context.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="inline h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Main Content Area */}
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            {/* Recent Orders */}
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-indigo-600" />
                  Recent Orders
                </h2>
                <Link
                  to="/orders"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  Loading orders...
                </div>
              ) : stats.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition"
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
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'in_production' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {order.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Customers */}
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Recent Customers
                </h2>
                <Link
                  to="/crm/customers"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  Loading customers...
                </div>
              ) : stats.recentCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent customers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentCustomers.map((customer: any) => (
                    <div
                      key={customer.id}
                      onClick={() => navigate(`/crm/customers/${customer.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {customer.name || customer.customer_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {customer.email || customer.phone || 'No contact info'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate('/communications/inbox')}
              className="group rounded-2xl border border-indigo-200 bg-indigo-50/50 px-5 py-4 text-left shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-100/50 transition flex flex-col justify-between"
            >
              <div>
                <MessageSquare className="h-6 w-6 text-indigo-600 mb-2" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Inbox</p>
                <p className="mt-1 text-sm font-bold text-gray-900 group-hover:text-indigo-700">
                  Respond to customer messages
                </p>
              </div>
              <span className="mt-3 text-xs text-indigo-600 font-semibold">Open inbox →</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <Package className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Orders</p>
                <p className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  Check order status for customers
                </p>
              </div>
              <span className="mt-3 text-xs text-blue-600 font-semibold">View orders →</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/crm/customers')}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <Users className="h-6 w-6 text-emerald-600 mb-2" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customers</p>
                <p className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  View customer details & history
                </p>
              </div>
              <span className="mt-3 text-xs text-blue-600 font-semibold">View customers →</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
