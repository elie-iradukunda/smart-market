// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { getAuthUser } from '@/utils/apiClient'

import {
  DollarSign,
  Search,
  Users,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  Send,
  Loader,
  XCircle,
} from 'lucide-react'

// RESTORED EXTERNAL API CLIENT IMPORT
import { fetchInvoices, createInvoice, fetchOrders } from '../../api/apiClient'

// --- Utility Functions and Components for Design ---

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'N/A'
  // Use a strong color for financial figures
  return <span className="font-extrabold text-blue-700">{`RF ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
}

// Helper to style the Invoice Status pill
const getInvoiceStatusClasses = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800 ring-gray-500/20'

  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 ring-green-500/20 font-bold'
    case 'sent':
      return 'bg-blue-100 text-blue-800 ring-blue-500/20'
    case 'draft':
      return 'bg-gray-100 text-gray-800 ring-gray-500/20'
    case 'overdue':
      // Strong, noticeable red for overdue status
      return 'bg-red-100 text-red-800 ring-red-500/20 font-bold animate-pulse'
    default:
      return 'bg-amber-100 text-amber-800 ring-amber-500/20'
  }
}

// Component to render the status pill with an icon
const InvoiceStatusPill = ({ status }) => {
  const statusText = status || 'Draft'
  const Icon = ({ className }) => {
    switch (statusText.toLowerCase()) {
      case 'paid':
        return <CheckCircle className={className} />;
      case 'sent':
        return <Send className={className} />;
      case 'draft':
        return <FileText className={className} />;
      case 'overdue':
        return <XCircle className={className} />;
      default:
        return <Clock className={className} />;
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition duration-300 ${getInvoiceStatusClasses(statusText)}`}
    >
      <Icon className="h-3 w-3 mr-1.5" />
      {statusText}
    </span>
  )
}

// Metric Card Component for statistics summary
const MetricCard = ({ title, value, icon: Icon, colorClass, description }) => (
  <div className={`rounded-xl px-4 py-3 border shadow-md transition duration-300 hover:shadow-lg hover:scale-[1.01] ${colorClass}`}>
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <Icon className={`h-5 w-5 ${colorClass.includes('red') ? 'text-red-500' : 'text-gray-500'}`} />
    </div>
    <p className={`mt-1 text-2xl font-extrabold ${colorClass.includes('red') ? 'text-red-700' : 'text-gray-900'}`}>{value}</p>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
)

// --- InvoicesPage Component ---

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newOrderId, setNewOrderId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [ordersReady, setOrdersReady] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [invoiceFormAmount, setInvoiceFormAmount] = useState('')
  const [invoicedOrderIds, setInvoicedOrderIds] = useState<number[]>([])

  const reloadInvoices = () => {
    setLoading(true)
    setError(null)

    fetchInvoices()
      .then((data) => {
        const processedData = Array.isArray(data)
          ? data.map((inv) => {
            const rawAmount = inv.amount
            const amountNum =
              typeof rawAmount === 'number'
                ? rawAmount
                : parseFloat(rawAmount || '0')
            return {
              ...inv,
              amount: isNaN(amountNum) ? 0 : amountNum,
              status: inv.status || 'Draft',
              due_date: inv.due_date || 'N/A',
            }
          })
          : []
        setInvoices(processedData)
      })

      .catch((err) => {
        setError(err.message || 'Failed to load invoices from API')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Fetching data from the external API client
  useEffect(() => {
    let isMounted = true

    setLoading(true)
    setError(null)

    fetchInvoices()
      .then((data) => {
        if (!isMounted) return
        const processedData = Array.isArray(data)
          ? data.map((inv) => {
            const rawAmount = inv.amount
            const amountNum =
              typeof rawAmount === 'number'
                ? rawAmount
                : parseFloat(rawAmount || '0')
            return {
              ...inv,
              amount: isNaN(amountNum) ? 0 : amountNum,
              status: inv.status || 'Draft',
              due_date: inv.due_date || 'N/A',
            }
          })
          : []
        setInvoices(processedData)
      })

      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load invoices from API')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    // Load delivered orders so accountant can create invoices without typing IDs
    setOrdersLoading(true)
    setOrdersError(null)
    fetchOrders()
      .then((orders) => {
        if (!isMounted) return
        const processed = Array.isArray(orders)
          ? orders.map((o: any) => {
            const rawTotal = o.total
            const totalNum =
              typeof rawTotal === 'number'
                ? rawTotal
                : parseFloat(rawTotal || '0')
            return {
              ...o,
              total: isNaN(totalNum) ? 0 : totalNum,
            }
          })
          : []
        setOrdersReady(processed)
      })

      .catch((err) => {
        if (!isMounted) return
        setOrdersError(err.message || 'Failed to load delivered orders')
      })
      .finally(() => {
        if (!isMounted) return
        setOrdersLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Calculate metrics
  const openCount = invoices.filter((i) => (i.status || '').toLowerCase() !== 'paid').length
  const overdueCount = invoices.filter((i) => (i.status || '').toLowerCase() === 'overdue').length
  const totalAmountOpen = invoices
    .filter((i) => (i.status || '').toLowerCase() !== 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  // Filtered list based on state
  const filtered = invoices.filter((inv) => {
    const status = (inv.status || '').toLowerCase()
    const matchesStatus =
      statusFilter === 'All' || status === statusFilter.toLowerCase()

    const term = (search || '').toLowerCase()
    const matchesSearch =
      !term ||
      (inv.customer_name || '').toLowerCase().includes(term) ||
      String(inv.id).toLowerCase().includes(term) ||
      String(inv.order_number).toLowerCase().includes(term)

    return matchesStatus && matchesSearch
  })

  // State Feedback Component for UX
  const StateFeedback = () => {
    if (error) {
      return (
        <div className="p-10 text-red-700 bg-red-50 border border-red-300 rounded-b-2xl flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 mr-3" />
          <p className="text-base font-medium">{error}</p>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="p-10 flex items-center justify-center">
          <Loader className="h-6 w-6 mr-3 text-indigo-500 animate-spin" />
          <p className="text-base text-gray-500">Loading invoice data...</p>
        </div>
      )
    }

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-gray-500">
          <FileText className="h-10 w-10 mb-4 text-gray-400" />
          <p className="text-lg font-semibold">No matching invoices found.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
        </div>
      )
    }

    return null
  }

  const user = getAuthUser()
  const isController = user?.role_id === 4
  const isPosRole = user?.role_id === 5 || user?.role_id === 11

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrderId || !newAmount) return
    const amountNumber = Number(newAmount)
    if (!amountNumber || amountNumber <= 0) return
    setCreating(true)
    setError(null)
    try {
      await createInvoice({ order_id: Number(newOrderId), amount: amountNumber })
      setNewOrderId('')
      setNewAmount('')
      reloadInvoices()
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setCreating(false)
    }
  }

  const deliveredOrders = ordersReady
    .filter((o: any) => {
      const status = (o.status || '').toLowerCase()
      return status === 'delivered'
    })
    .filter((o: any) => !invoicedOrderIds.includes(o.id))

  const handleCreateInvoiceFromOrder = async (order: any) => {
    if (!order?.id) return
    setSelectedOrder(order)
    setInvoiceFormAmount(
      order.total != null && !isNaN(order.total) ? String(order.total) : ''
    )
  }

  const handleSubmitOrderInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder?.id) return
    const amountNumber = Number(invoiceFormAmount)
    if (!amountNumber || amountNumber <= 0) return
    setCreating(true)
    setError(null)
    try {
      await createInvoice({ order_id: selectedOrder.id, amount: amountNumber })
      reloadInvoices()
      setInvoicedOrderIds((prev) =>
        prev.includes(selectedOrder.id) ? prev : [...prev, selectedOrder.id]
      )
      setSelectedOrder(null)
      setInvoiceFormAmount('')
      // Optionally refresh orders list from backend
      setOrdersLoading(true)
      const updated = await fetchDemoOrders()
      setOrdersReady(Array.isArray(updated) ? updated : [])
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice for order')
    } finally {
      setCreating(false)
      setOrdersLoading(false)
    }
  }

  return (
    <DashboardLayout>
      {/* Header Section - Light card with blue gradient top */}
      <div className="rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-200">
        <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 text-white p-6 transition duration-500">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-200">
            <DollarSign className="inline h-4 w-4 mr-2" />
            Accounts Receivable
          </p>
          <h1 className="mt-1 text-4xl font-extrabold leading-tight">
            Financial Invoices
          </h1>
          <p className="mt-2 text-base text-indigo-300 max-w-xl">
            Track all billing records. Monitor open, paid, and overdue invoices to maintain a healthy cash flow.
          </p>
        </div>

        {/* Metrics Grid (light background for contrast and readability) */}
        <div className="bg-white p-6 pt-3">
          <p className="text-lg font-semibold text-gray-800 mb-4">Overview Metrics</p>
          <div className="grid gap-4 md:grid-cols-4 text-sm">
            <MetricCard
              title="Open Invoices"
              value={openCount}
              icon={Clock}
              colorClass="bg-blue-50 border-blue-200"
              description="Total number pending payment."
            />
            <MetricCard
              title="Total Open Amount"
              value={formatCurrency(totalAmountOpen)}
              icon={DollarSign}
              colorClass="bg-indigo-50 border-indigo-200"
              description="Total revenue outstanding."
            />
            <MetricCard
              title="Overdue Invoices"
              value={overdueCount}
              icon={AlertTriangle}
              colorClass="bg-red-50 border-red-300"
              description="Immediate action required."
            />
            <MetricCard
              title="Total Records"
              value={invoices.length}
              icon={FileText}
              colorClass="bg-gray-50 border-gray-200"
              description="All invoices generated to date."
            />
          </div>
        </div>
      </div>

      {/* Delivered orders ready for invoicing */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-900">Delivered Orders Ready for Invoicing</p>
          {ordersLoading && (
            <div className="flex items-center text-xs text-gray-500">
              <Loader className="h-4 w-4 mr-1 animate-spin text-indigo-500" />
              Loading orders...
            </div>
          )}
        </div>
        {selectedOrder && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 bg-slate-50/60">
            <form
              onSubmit={handleSubmitOrderInvoice}
              className="flex flex-wrap items-center gap-3 text-sm"
            >
              <div className="text-gray-700 font-medium">
                Creating invoice for order
                <span className="ml-1 font-bold text-indigo-700">#{selectedOrder.id}</span>
                <span className="ml-2 text-gray-500">({selectedOrder.customer})</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceFormAmount}
                  onChange={(e) => setInvoiceFormAmount(e.target.value)}
                  className="w-28 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null)
                    setInvoiceFormAmount('')
                  }}
                  className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
                >
                  {creating ? 'Saving…' : 'Save invoice'}
                </button>
              </div>
            </form>
          </div>
        )}
        {ordersError ? (
          <div className="p-6 flex items-center text-sm text-red-600 bg-red-50 border-t border-red-100">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {ordersError}
          </div>
        ) : deliveredOrders.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 flex items-center justify-center">
            <FileText className="h-5 w-5 mr-2 text-gray-400" />
            No delivered orders waiting for invoices.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {deliveredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.customer}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 capitalize">{order.paymentStatus}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleCreateInvoiceFromOrder(order)}
                        disabled={creating}
                        className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Create invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice List and Filters */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

            <p className="text-xl font-semibold text-gray-900">Invoice List ({filtered.length})</p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customer, ID, or Order..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200"
                />
              </div>

              {/* Quick create invoice form */}
              <form
                onSubmit={handleCreateInvoice}
                className="flex flex-wrap items-center gap-2 border border-indigo-100 rounded-2xl px-3 py-2 bg-indigo-50/40"
              >
                <input
                  type="number"
                  min="1"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  placeholder="Order ID"
                  className="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
                >
                  {creating ? 'Saving…' : 'New invoice'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Table Container */}
        {loading || error || filtered.length === 0 ? (
          <StateFeedback />
        ) : (
          <div className="flow-root">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50/70 border-b border-indigo-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      <Users className="inline h-4 w-4 mr-2" />
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      Order #
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/finance/invoices/${inv.id}`)}
                      className="group hover:bg-blue-50/50 transition duration-300 ease-in-out cursor-pointer"
                    >
                      {/* Invoice ID/Number */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 group-hover:text-indigo-700">
                        #{String(inv.id).toUpperCase()}
                      </td>
                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {inv.customer_name}
                      </td>
                      {/* Due Date (Assuming API provides due_date or using default) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inv.due_date}
                      </td>
                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {formatCurrency(inv.amount)}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <InvoiceStatusPill status={inv.status} />
                      </td>
                      {/* Order Number */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500 font-medium hover:text-indigo-700">
                        #{inv.order_number || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}