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


  return (
    <DashboardLayout>
      <div className="px-4 py-4">
  <div className="mx-auto max-w-7xl space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">
        Financial Invoices
      </h1>
    </div>

    {/* Metrics Grid */}
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard
        title="Open Invoices"
        value={openCount}
        icon={Clock}
        colorClass="bg-white border-gray-100"
        description="Total number pending payment."
      />
      <MetricCard
        title="Total Open Amount"
        value={formatCurrency(totalAmountOpen)}
        icon={DollarSign}
        colorClass="bg-white border-gray-100"
        description="Total revenue outstanding."
      />
      <MetricCard
        title="Overdue Invoices"
        value={overdueCount}
        icon={AlertTriangle}
        colorClass="bg-white border-gray-100"
        description="Immediate action required."
      />
      <MetricCard
        title="Total Records"
        value={invoices.length}
        icon={FileText}
        colorClass="bg-white border-gray-100"
        description="All invoices generated to date."
      />
    </div>

    {/* Invoice List and Filters */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">Invoice List</p>
            <span className="text-xs font-bold text-gray-400">({filtered.length})</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none transition duration-150"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customer, ID, or Order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition duration-150"
              />
            </div>
          </div>
        </div>
      </div>

      {loading || error || filtered.length === 0 ? (
        <StateFeedback />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> Customer
                  </div>
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Order #</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/dashboard/admin/finance/invoices/${inv.id}`)}
                  className="group hover:bg-gray-50 transition duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900 group-hover:text-blue-600">
                    #{String(inv.id).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                    {inv.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {inv.due_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium text-gray-900">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InvoiceStatusPill status={inv.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-blue-500 font-medium group-hover:underline">
                    #{inv.order_number || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
</div>
    </DashboardLayout>
  )
}