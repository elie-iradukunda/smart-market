// @ts-nocheck
import React, { useEffect, useState } from 'react'
import ReportFilters from '../../modules/finance/components/ReportFilters'
import { fetchFinancialOverview } from '../../api/apiClient'

export default function FinancialReportsPage() {
  const [overview, setOverview] = useState<{ total_revenue: number; outstanding_amount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const kpis = [
    overview
      ? { label: 'Revenue (last 30 days)', value: `$${overview.total_revenue.toFixed(2)}`, trend: '' }
      : { label: 'Revenue (last 30 days)', value: loading ? 'Loading...' : '$0.00', trend: '' },
    overview
      ? { label: 'Outstanding AR', value: `$${overview.outstanding_amount.toFixed(2)}`, trend: '' }
      : { label: 'Outstanding AR', value: loading ? 'Loading...' : '$0.00', trend: '' },
    { label: 'Gross Margin', value: '—', trend: '' },
    { label: 'Cash at Bank', value: '—', trend: '' },
  ]

  const getTrendColor = (trend) => {
    if (trend.startsWith('+')) return 'text-green-600';
    if (trend.startsWith('-')) return 'text-red-600';
    return 'text-gray-500';
  };

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchFinancialOverview()
      .then((data) => {
        if (!isMounted) return
        setOverview(data)
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

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Financial Overview</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Reports</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          High-level financial KPIs for the management team. Use the filters to switch periods and report types.
        </p>
      </div>

      {/* Filters and KPI Cards Container - Applying the clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-6">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
        )}

        {/* Report Filters component */}
        <ReportFilters />

        {/* KPI Grid - Enhanced card style */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map(kpi => (
            <div
              key={kpi.label}
              // KPI Card Styling: Rounded-xl, cleaner border, better shadow
              className="rounded-xl border border-gray-100 bg-gray-50/70 p-5 transition hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{kpi.label}</p>
              <div className="flex items-end justify-between mt-1">
                {/* Main Value */}
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                {/* Trend Indicator */}
                <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for the main report content (e.g., P&L, Balance Sheet) */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-inner mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Income Statement</h3>
            <p className="text-sm text-gray-500">
              The full report content (charts, tables, etc.) would be rendered here, controlled by the filters above.
            </p>
        </div>
      
      </div>
    </div>
  )
}