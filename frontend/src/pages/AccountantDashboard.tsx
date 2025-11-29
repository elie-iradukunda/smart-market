import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  BookOpen,
  PieChart,
  RefreshCw,
  Plus,
  Eye,
  Calendar,
  Users,
  Building2,
  Wallet
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  fetchInvoices,
  fetchPayments,
  fetchPOSSales,
  fetchJournalEntries,
  fetchAccounts,
  fetchFinancialOverview
} from '@/api/apiClient'

interface Invoice {
  id: number
  order_number: string
  customer_name: string
  amount: number
  status: string
  due_date: string
  created_at: string
}

interface Payment {
  id: number
  invoice_number: string
  recorded_by: string
  amount: number
  method: string
  status: string
  created_at: string
  reference?: string
}

interface POSSale {
  id: number
  customer_name?: string
  cashier_name: string
  total: number
  created_at: string
}

interface JournalEntry {
  id: number
  date: string
  description: string
  created_at: string
}

interface FinanceStats {
  totalRevenue: number
  totalCollected: number
  outstanding: number
  overdueAmount: number
  openInvoices: number
  overdueInvoices: number
  paidInvoices: number
  totalPayments: number
  posSalesTotal: number
  posSalesCount: number
  journalEntriesCount: number
  accountsCount: number
}

export default function AccountantDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    totalCollected: 0,
    outstanding: 0,
    overdueAmount: 0,
    openInvoices: 0,
    overdueInvoices: 0,
    paidInvoices: 0,
    totalPayments: 0,
    posSalesTotal: 0,
    posSalesCount: 0,
    journalEntriesCount: 0,
    accountsCount: 0
  })
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [recentPOSSales, setRecentPOSSales] = useState<POSSale[]>([])

  const navigate = useNavigate()

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [invoices, payments, posSales, journals, accounts, overview] = await Promise.all([
        fetchInvoices().catch(() => []),
        fetchPayments().catch(() => []),
        fetchPOSSales().catch(() => []),
        fetchJournalEntries().catch(() => []),
        fetchAccounts().catch(() => []),
        fetchFinancialOverview().catch(() => ({ total_revenue: 0, outstanding_amount: 0 }))
      ])

      const invList = Array.isArray(invoices) ? invoices : []
      const pmtList = Array.isArray(payments) ? payments : []
      const posList = Array.isArray(posSales) ? posSales : []
      const jrList = Array.isArray(journals) ? journals : []
      const accList = Array.isArray(accounts) ? accounts : []

      const today = new Date().toISOString().slice(0, 10)

      const openInv = invList.filter((inv: Invoice) =>
        (inv.status || '').toLowerCase() !== 'paid'
      )
      const overdueInv = invList.filter((inv: Invoice) => {
        const status = (inv.status || '').toLowerCase()
        if (status === 'paid') return false
        const due = (inv.due_date || '').slice(0, 10)
        if (!due) return false
        return due < today
      })
      const paidInv = invList.filter((inv: Invoice) =>
        (inv.status || '').toLowerCase() === 'paid'
      )

      const overdueAmount = overdueInv.reduce((sum: number, inv: Invoice) => {
        const amt = typeof inv.amount === 'number' ? inv.amount : parseFloat(String(inv.amount) || '0')
        return sum + (isNaN(amt) ? 0 : amt)
      }, 0)

      const totalPaid = pmtList
        .filter((p: Payment) => p.status === 'completed')
        .reduce((sum: number, p: Payment) => {
          const amt = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount) || '0')
          return sum + (isNaN(amt) ? 0 : amt)
        }, 0)

      const posSalesTotal = posList.reduce((sum: number, s: POSSale) => {
        const amt = typeof s.total === 'number' ? s.total : parseFloat(String(s.total) || '0')
        return sum + (isNaN(amt) ? 0 : amt)
      }, 0)

      setStats({
        totalRevenue: Number(overview.total_revenue) || 0,
        totalCollected: totalPaid,
        outstanding: Number(overview.outstanding_amount) || 0,
        overdueAmount,
        openInvoices: openInv.length,
        overdueInvoices: overdueInv.length,
        paidInvoices: paidInv.length,
        totalPayments: pmtList.length,
        posSalesTotal,
        posSalesCount: posList.length,
        journalEntriesCount: jrList.length,
        accountsCount: accList.length
      })

      setRecentInvoices(invList.slice(0, 5))
      setRecentPayments(pmtList.slice(0, 5))
      setRecentPOSSales(posList.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'RF 0'
    return `RF ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    switch (s) {
      case 'paid':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pending':
      case 'partial':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'overdue':
      case 'failed':
      case 'refunded':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-sm text-gray-600 font-medium">Loading finance dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your financial operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/finance/invoices/new')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading data</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Revenue
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Total revenue (30 days)</p>
        </div>

        {/* Collected */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Collected
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCollected)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.totalPayments} payments received</p>
        </div>

        {/* Outstanding */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <span className="inline-flex items-center text-xs font-medium text-amber-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Pending
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatCurrency(stats.outstanding)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.openInvoices} open invoices</p>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <span className="inline-flex items-center text-xs font-medium text-red-600">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              Overdue
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatCurrency(stats.overdueAmount)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.overdueInvoices} overdue invoices</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          to="/pos/sales-history"
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.posSalesCount}</p>
              <p className="text-xs text-gray-500">POS Sales</p>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-blue-600">{formatCurrency(stats.posSalesTotal)}</p>
        </Link>

        <Link
          to="/finance/journals"
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.journalEntriesCount}</p>
              <p className="text-xs text-gray-500">Journal Entries</p>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-purple-600">View all entries →</p>
        </Link>

        <Link
          to="/finance/reports"
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-lg group-hover:bg-teal-100">
              <PieChart className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.accountsCount}</p>
              <p className="text-xs text-gray-500">Accounts</p>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-teal-600">Chart of accounts →</p>
        </Link>

        <Link
          to="/finance/invoices"
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.paidInvoices}</p>
              <p className="text-xs text-gray-500">Paid Invoices</p>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-emerald-600">View all invoices →</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/finance/invoices')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100"
          >
            <FileText className="h-4 w-4" />
            Manage Invoices
          </button>
          <button
            onClick={() => navigate('/finance/payments')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
          >
            <CreditCard className="h-4 w-4" />
            Record Payment
          </button>
          <button
            onClick={() => navigate('/finance/journals/new')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100"
          >
            <BookOpen className="h-4 w-4" />
            New Journal Entry
          </button>
          <button
            onClick={() => navigate('/pos')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100"
          >
            <Receipt className="h-4 w-4" />
            Open POS
          </button>
          <button
            onClick={() => navigate('/finance/reports')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            <PieChart className="h-4 w-4" />
            Financial Reports
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
            </div>
            <Link
              to="/finance/invoices"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <FileText className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">No invoices yet</p>
              </div>
            ) : (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="px-5 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          #{invoice.id}
                        </p>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusBadge(invoice.status)}`}>
                          {invoice.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {invoice.customer_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
                      <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(invoice.due_date || invoice.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Recent Payments</h3>
            </div>
            <Link
              to="/finance/payments"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentPayments.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CreditCard className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">No payments yet</p>
              </div>
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="px-5 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/finance/payments/${payment.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          Invoice #{payment.invoice_number}
                        </p>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full border ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span className="capitalize">{payment.method || 'cash'}</span>
                        <span>•</span>
                        <span>{payment.recorded_by}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">+{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* POS Sales Summary */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Recent POS Sales</h3>
          </div>
          <Link
            to="/pos/sales-history"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recentPOSSales.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Receipt className="h-8 w-8 text-gray-300 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">No POS sales yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Sale ID</th>
                  <th className="px-5 py-3 text-left font-medium">Customer</th>
                  <th className="px-5 py-3 text-left font-medium">Cashier</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPOSSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">#{sale.id}</td>
                    <td className="px-5 py-3 text-gray-600">{sale.customer_name || 'Walk-in'}</td>
                    <td className="px-5 py-3 text-gray-600">{sale.cashier_name}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(sale.created_at)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{formatCurrency(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
