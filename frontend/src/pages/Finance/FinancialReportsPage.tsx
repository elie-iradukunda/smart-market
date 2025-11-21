// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ReportFilters from '../../modules/finance/components/ReportFilters'
import { fetchFinancialOverview } from '../../api/apiClient'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ControllerTopNav from '@/components/layout/ControllerTopNav'
import PosTopNav from '@/components/layout/PosTopNav'
import InventoryTopNav from '@/components/layout/InventoryTopNav'

import { getAuthUser } from '@/utils/apiClient'

export default function FinancialReportsPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<{ total_revenue: any; outstanding_amount: any } | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizeNumber = (value: any): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0
    const parsed = parseFloat(value ?? '0')
    return Number.isFinite(parsed) ? parsed : 0
  }

  const kpis = [
    overview
      ? {
          label: 'Revenue (last 30 days)',
          value: `$${normalizeNumber(overview.total_revenue).toFixed(2)}`,
          trend: '',
        }
      : { label: 'Revenue (last 30 days)', value: loading ? 'Loading...' : '$0.00', trend: '' },
    overview
      ? {
          label: 'Outstanding AR',
          value: `$${normalizeNumber(overview.outstanding_amount).toFixed(2)}`,
          trend: '',
        }
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

  const user = getAuthUser()
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const isController = user?.role_id === 4
  const isPosRole = user?.role_id === 5 || user?.role_id === 11
  const isInventoryRole = user?.role_id === 8

  return (
    <div className="min-h-screen bg-slate-50">
      {isController ? (
        <ControllerTopNav />
      ) : isPosRole ? (
        <PosTopNav />
      ) : isInventoryRole ? (
        <InventoryTopNav />
      ) : (
        <OwnerTopNav />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Header Card - light card with blue/green accent */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Financial Overview</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
            Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Reports</span>
          </h1>
          <p className="mt-3 text-base text-gray-600 max-w-xl">
            High-level financial KPIs for the management team. Use the filters to switch periods and report types.
          </p>
        </div>

        {/* Filters and KPI Cards Container - Applying the clean aesthetic */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">

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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-inner mt-4">
        </div>
      </div>
    </div>
  </div>
  )
}