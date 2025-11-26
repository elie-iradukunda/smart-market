// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDemoOrders } from '../../api/apiClient'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ControllerTopNav from '@/components/layout/ControllerTopNav'
import ReceptionTopNav from '@/components/layout/ReceptionTopNav'
import SalesTopNav from '@/components/layout/SalesTopNav'
import TechnicianTopNav from '@/components/layout/TechnicianTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'

import { getAuthUser } from '@/utils/apiClient'

// Updated imports with more relevant icons
import { ListOrdered, Users, Tag, Clock, Package, AlertTriangle, ChevronRight, Dices } from 'lucide-react'

// --- Utility Functions for Design ---

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'N/A'
  // Use a stronger blue for currency text
  return <span className="font-extrabold text-blue-700">{`RF ${amount.toLocaleString('en-RW')}`}</span>
}

// Helper to style the Status pill with an Indigo/Blue blend
const getStatusClasses = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      // Brighter Yellow-Orange for contrast
      return 'bg-amber-100 text-amber-800 ring-amber-500/20'
    case 'processing':
      // Primary Blue color
      return 'bg-blue-100 text-blue-800 ring-blue-500/20'
    case 'shipped':
      // Indigo tone
      return 'bg-indigo-100 text-indigo-800 ring-indigo-500/20'
    case 'delivered':
    case 'completed':
      // Success Green
      return 'bg-green-100 text-green-800 ring-green-500/20'
    case 'cancelled':
    case 'failed':
      // Alert Red
      return 'bg-red-100 text-red-800 ring-red-500/20'
    default:
      return 'bg-gray-100 text-gray-800 ring-gray-500/20'
  }
}

// Helper to style the Payment Status pill (for accountants)
const getPaymentStatusClasses = (paymentStatus) => {
  const s = (paymentStatus || '').toLowerCase()
  switch (s) {
    case 'unbilled':
      return 'bg-slate-100 text-slate-700 ring-slate-400/30'
    case 'unpaid':
      return 'bg-red-100 text-red-800 ring-red-500/20'
    case 'partial':
      return 'bg-amber-100 text-amber-800 ring-amber-500/20'
    case 'paid':
      return 'bg-emerald-100 text-emerald-800 ring-emerald-500/20'
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-400/30'
  }
}

// --- OrdersPage Component ---

export default function OrdersPage() {
  // KEEPING ALL STATE AND BACKEND LOGIC AS IS
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterMode, setFilterMode] = useState<'active' | 'delivered' | 'all'>('active')
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchDemoOrders()
      .then(data => {
        if (!isMounted) return
        const processedData = Array.isArray(data) ? data.map(order => ({
            ...order,
            // Fallback for demo date
            date: order.date || new Date(Date.now() - Math.random() * 86400000 * 30).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' }),
        })) : []
        setOrders(processedData)
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load orders')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredOrders = orders.filter((order) => {
    const status = (order.status || '').toLowerCase()
    if (filterMode === 'delivered') return status === 'delivered'
    if (filterMode === 'active') return status !== 'delivered'
    return true
  })

  // Component to render the status pill
  const StatusPill = ({ status }) => (
    <span 
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition duration-300 ${getStatusClasses(status)}`}
    >
      {status}
    </span>
  )

  const PaymentStatusPill = ({ paymentStatus }) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset transition duration-300 ${getPaymentStatusClasses(paymentStatus)}`}
    >
      {paymentStatus === 'unbilled' ? 'Unbilled' : paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1)}
    </span>
  )

  // Component for the Loading/Error/Empty states
  const StateFeedback = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center p-10 text-red-700 bg-red-50 border border-red-300 rounded-b-3xl">
          <AlertTriangle className="h-6 w-6 mr-3 animate-pulse" />
          <p className="text-base font-medium">{error}</p>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center p-10">
          <Dices className="h-6 w-6 mr-3 text-blue-500 animate-spin-slow" /> {/* Custom animation class assumed */}
          <p className="text-base text-gray-500">Fetching the latest orders, please wait...</p>
        </div>
      )
    }

    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-gray-500">
          <Package className="h-10 w-10 mb-4 text-gray-400" />
          <p className="text-lg font-semibold">No orders found.</p>
          <p className="text-sm mt-1">Start by placing a new order on the pricing page.</p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {(() => {
        const user = getAuthUser()
        const isController = user?.role_id === 4
        const isReception = user?.role_id === 2
        const isTechnician = user?.role_id === 5
        const isOwner = user?.role_id === 7
        if (isController) return <ControllerTopNav />
        if (isReception) return <ReceptionTopNav />
        if (isTechnician) return <TechnicianTopNav />
        return <OwnerTopNav />
      })()}
      {(() => {
        const user = getAuthUser()
        const isOwner = user?.role_id === 7
        const isReception = user?.role_id === 2
        const isTechnician = user?.role_id === 5
        if (isOwner || isTechnician || isReception) return null
        return <SalesTopNav />
      })()}

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <OwnerSideNav />

          <main className="flex-1 space-y-8 max-w-7xl mx-auto">
            {/* Header Section - Modern, Elevated Card with Blue Accent */}
            <div className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-2xl border border-slate-200 border-t-4 border-t-indigo-500 transition duration-500 hover:shadow-indigo-300/50">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                  <ListOrdered className="inline h-4 w-4 mr-2" />
                  Order Management System
                </p>
                <h1 className="mt-1 text-4xl font-extrabold text-gray-900 leading-tight">
                  Active Orders & History
                </h1>
              </div>
              <div className="hidden sm:block">
                {/* Action Button with Hover Animation */}
                <button
                  onClick={() => navigate('/new-order')}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/50 hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  + Create New Order
                </button>
              </div>
            </div>
            
            {/* Orders Table/List Section - Elevated Design */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
              
              {loading || error || orders.length === 0 ? (
                <StateFeedback />
              ) : (
                <div className="flow-root">
                  <div className="flex items-center justify-between px-6 pt-4 pb-2 text-xs text-slate-600">
                    <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-500">Showing {filterMode === 'active' ? 'Active Orders' : filterMode === 'delivered' ? 'Delivered Orders' : 'All Orders'}</span>
                    <div className="inline-flex gap-2 bg-slate-100 rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => setFilterMode('active')}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${filterMode === 'active' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('delivered')}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${filterMode === 'delivered' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
                      >
                        Delivered
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterMode('all')}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${filterMode === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-white/70'}`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      
                      {/* Table Header - Sticky and Blue Tinted */}
                      <thead className="bg-indigo-50/70 border-b border-indigo-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                            Order #
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                            <Users className="inline h-4 w-4 mr-2" />
                            Customer
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                            <Clock className="inline h-4 w-4 mr-2" />
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                            <Tag className="inline h-4 w-4 mr-2" />
                            Total
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      
                      {/* Table Body - Dynamic Rows with Hover and Transition */}
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredOrders.map((order, index) => (
                          <tr
                            key={order.id}
                            onClick={() => navigate(`/orders/${order.id}`)}
                            // Hover and Transition effects
                            className="group hover:bg-blue-50/50 transition duration-300 ease-in-out cursor-pointer transform hover:shadow-lg hover:z-20 relative"
                            // Simple "fade-up" effect on initial load (requires external CSS library like animate.css or custom keyframes)
                            style={{ animation: `fadeInUp 0.5s ease-out forwards`, animationDelay: `${index * 0.05}s`, opacity: 0 }}
                          >
                            {/* Order ID/Number */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 transition duration-300 group-hover:text-indigo-800">
                              #{String(order.id).substring(0, 8).toUpperCase()}
                            </td>
                            {/* Customer */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 transition duration-300 group-hover:text-gray-800">
                              {order.customer}
                            </td>
                            {/* Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 transition duration-300">
                              {order.date || 'N/A'} 
                            </td>
                            {/* Total - Uses the formatted span for blue color */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatCurrency(order.total)}
                            </td>
                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <StatusPill status={order.status} />
                            </td>
                            {/* Payment Status */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <PaymentStatusPill paymentStatus={order.paymentStatus} />
                            </td>
                            {/* Action/View Link with animation */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <span className="inline-flex items-center text-blue-600 opacity-80 group-hover:opacity-100 group-hover:font-semibold transition-all duration-300">
                                Details
                                <ChevronRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}