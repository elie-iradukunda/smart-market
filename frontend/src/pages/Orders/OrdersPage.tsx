// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchOrders, fetchWorkOrders } from '../../api/apiClient'
import { getAuthUser } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ListOrdered, Users, Tag, Clock, Package, AlertTriangle, ChevronRight, Dices, ChevronLeft } from 'lucide-react'

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
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterMode, setFilterMode] = useState<'active' | 'delivered' | 'all'>('active')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const navigate = useNavigate()
  const user = getAuthUser()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const loadData = async () => {
      try {
        // Check if user is staff (not Admin/Owner AND not Client/Customer)
        const isClient = [4, 13].includes(Number(user?.role_id));
        const isStaff = ![1, 2].includes(Number(user?.role_id)) && !isClient;
        console.log('Role Check:', user?.role_id, 'isStaff:', isStaff, 'isClient:', isClient);

        const [allOrders, workOrdersResult] = await Promise.all([
          fetchOrders(),
          isStaff ? fetchWorkOrders() : Promise.resolve([])
        ])

        if (!isMounted) return

        let relevantOrders = Array.isArray(allOrders) ? allOrders : []

        // If staff, filter orders to only show assigned ones
        if (isStaff && Array.isArray(workOrdersResult)) {
          console.log('WorkOrders fetched:', workOrdersResult.length);
          const myOrderIds = new Set(
            workOrdersResult
              .filter(wo => Number(wo.assigned_to) === Number(user.id))
              .map(wo => Number(wo.order_number || wo.order_id))
          )
          console.log('My IDs:', Array.from(myOrderIds));
          relevantOrders = relevantOrders.filter(o => myOrderIds.has(Number(o.id)))
        }

        const processedData = relevantOrders.map(order => ({
          ...order,
          // Fallback for demo date
          date: order.date || new Date(Date.now() - Math.random() * 86400000 * 30).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' }),
        }))

        setOrders(processedData)
        setCurrentPage(1)
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Failed to load orders')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    loadData()

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleFilterChange = (mode) => {
    setFilterMode(mode)
    setCurrentPage(1) // Reset to first page when filter changes
  }

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
      const isPermissionError = error.toLowerCase().includes('insufficient permissions') ||
        error.toLowerCase().includes('forbidden') ||
        error.toLowerCase().includes('permission')

      return (
        <div className="flex flex-col items-center justify-center p-10 text-red-700 bg-red-50 border border-red-300 rounded-b-3xl">
          <AlertTriangle className="h-6 w-6 mb-3 animate-pulse" />
          <p className="text-base font-medium mb-2">{error}</p>
          {isPermissionError && (
            <p className="text-sm text-red-600 mt-2 text-center max-w-md">
              💡 <strong>Tip:</strong> If permissions were recently updated, please log out and log back in to refresh your session.
            </p>
          )}
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center p-10">
          <Dices className="h-6 w-6 mr-3 text-blue-500 animate-spin" />
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
    <DashboardLayout>
     <div className="px-4 py-4">
  <div className="flex gap-4">
    <main className="flex-1 space-y-4 max-w-7xl mx-auto">
      {/* Simple Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">
          Active Orders & History
        </h1>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading || error || orders.length === 0 ? (
          <StateFeedback />
        ) : (
          <div className="flow-root">
            {/* Filter Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                {filterMode} Orders
              </span>
              <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleFilterChange('active')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    filterMode === 'active' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('delivered')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    filterMode === 'delivered' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  Delivered
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="group hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900">
                        #{String(order.id).substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        {order.date || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PaymentStatusPill paymentStatus={order.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <ChevronRight size={14} className="inline text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  {filteredOrders.length} Total
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded border border-slate-200 bg-white disabled:opacity-50"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="text-slate-400 text-[10px]">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded border border-slate-200 bg-white disabled:opacity-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  </div>
</div>
    </DashboardLayout>
  )
}