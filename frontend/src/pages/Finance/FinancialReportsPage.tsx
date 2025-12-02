// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportFilters from '../../modules/finance/components/ReportFilters'
import { fetchFinancialOverview, fetchInvoices, fetchPayments, fetchSalesReport } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getAuthUser } from '@/utils/apiClient'
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, CreditCard, FileText } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

// Simple CSS Bar Chart Component
const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-300">
        <p className="text-gray-400">No sales data available for this period</p>
      </div>
    )
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => parseFloat(d.total_sales) || 0), 100)

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
          Sales Trend (Last 30 Days)
        </h3>
      </div>

      <div className="h-64 flex items-end justify-between gap-2">
        {data.slice(0, 14).reverse().map((day, index) => { // Show last 14 days for better fit
          const value = parseFloat(day.total_sales) || 0
          const height = (value / maxValue) * 100
          const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })

          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div className="relative w-full flex items-end justify-center h-full">
                <div
                  className="w-full max-w-[40px] bg-indigo-500 rounded-t-md transition-all duration-300 group-hover:bg-indigo-600 relative"
                  style={{ height: `${Math.max(height, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {formatCurrency(value)}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[10px] sm:text-xs text-gray-500 font-medium truncate w-full text-center">{date}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Recent Transactions Table
const RecentTransactions = ({ payments, invoices }) => {
  // Combine and sort by date
  const transactions = [
    ...payments.map(p => ({ ...p, type: 'payment', date: p.created_at })),
    ...invoices.map(i => ({ ...i, type: 'invoice', date: i.created_at }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No recent transactions found</td>
              </tr>
            ) : (
              transactions.map((t, idx) => (
                <tr key={`${t.type}-${t.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.type === 'payment' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {t.type === 'payment' ? <CreditCard className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                      {t.type === 'payment' ? 'Payment' : 'Invoice'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {t.type === 'payment' ? `PAY-${t.id}` : `INV-${t.id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {formatCurrency(t.amount || t.total || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${(t.status === 'paid' || t.status === 'completed')
                        ? 'bg-green-100 text-green-800'
                        : t.status === 'pending' || t.status === 'unpaid'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {t.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function FinancialReportsPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<{ total_revenue: any; outstanding_amount: any } | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizeNumber = (value: any): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    const parsed = parseFloat(value ?? '0')
    return Number.isFinite(parsed) ? parsed : 0
  }

  const withinLastDays = (isoDate: string | null | undefined, days: number) => {
    if (!isoDate) return false
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return false
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= days
  }

  const totalPaymentsLast30 = payments.reduce((sum, p: any) => {
    if (!withinLastDays(p.created_at, 30)) return sum
    const amt = normalizeNumber(p.amount)
    return sum + amt
  }, 0)

  const invoiceCount = invoices.length
  const paymentCount = payments.length

  const kpis = [
    overview
      ? {
        label: 'Revenue (last 30 days)',
        value: formatCurrency(overview.total_revenue),
        trend: '+12.5%', // Placeholder trend logic
        icon: DollarSign,
        color: 'bg-green-50 text-green-700 border-green-200'
      }
      : { label: 'Revenue (last 30 days)', value: loading ? 'Loading...' : 'RF 0.00', trend: '', icon: DollarSign, color: 'bg-gray-50 text-gray-700' },
    overview
      ? {
        label: 'Outstanding AR',
        value: formatCurrency(overview.outstanding_amount),
        trend: '-2.3%', // Placeholder trend logic
        icon: FileText,
        color: 'bg-amber-50 text-amber-700 border-amber-200'
      }
      : { label: 'Outstanding AR', value: loading ? 'Loading...' : 'RF 0.00', trend: '', icon: FileText, color: 'bg-gray-50 text-gray-700' },
    {
      label: 'Payments (30 days)',
      value: formatCurrency(totalPaymentsLast30),
      trend: '+5.4%',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Total Invoices',
      value: loading ? '—' : String(invoiceCount),
      trend: '',
      icon: FileText,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
  ]

  const getTrendColor = (trend) => {
    if (!trend) return 'text-gray-400'
    if (trend.startsWith('+')) return 'text-green-600'
    if (trend.startsWith('-')) return 'text-red-600'
    return 'text-gray-500'
  }

  const getTrendIcon = (trend) => {
    if (!trend) return null
    if (trend.startsWith('+')) return <ArrowUpRight className="w-4 h-4 mr-1" />
    if (trend.startsWith('-')) return <ArrowDownRight className="w-4 h-4 mr-1" />
    return null
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([
      fetchFinancialOverview(),
      fetchInvoices(),
      fetchPayments(),
      fetchSalesReport()
    ])
      .then(([overviewData, invoicesData, paymentsData, salesReportData]) => {
        if (!isMounted) return
        setOverview(overviewData)
        setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
        setPayments(Array.isArray(paymentsData) ? paymentsData : [])
        setSalesData(Array.isArray(salesReportData) ? salesReportData : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load financial overview')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const user = getAuthUser()
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <DashboardLayout>
      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Financial Overview</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Reports</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          High-level financial KPIs for the management team. Use the filters to switch periods and report types.
        </p>
      </div>

      <div className="space-y-8">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-center">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <div
                key={idx}
                className={`rounded-2xl border ${kpi.color ? kpi.color.replace('text-', 'border-').split(' ')[2] : 'border-gray-100'} bg-white p-6 shadow-sm transition hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${kpi.color || 'bg-gray-100'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {kpi.trend && (
                    <div className={`flex items-center text-sm font-bold ${getTrendColor(kpi.trend)}`}>
                      {getTrendIcon(kpi.trend)}
                      {kpi.trend}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts and Tables Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sales Trend Chart - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <SalesTrendChart data={salesData} />
          </div>

          {/* Recent Transactions - Takes up 1 column */}
          <div className="lg:col-span-1">
            <RecentTransactions payments={payments} invoices={invoices} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}