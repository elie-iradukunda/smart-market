// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ReportFilters from '../../modules/finance/components/ReportFilters'
import { fetchFinancialOverview, fetchInvoices, fetchPayments } from '../../api/apiClient'

import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ControllerTopNav from '@/components/layout/ControllerTopNav'
import PosTopNav from '@/components/layout/PosTopNav'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import FinanceTopNav from '@/components/layout/FinanceTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'

import { getAuthUser } from '@/utils/apiClient'

export default function FinancialReportsPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<{ total_revenue: any; outstanding_amount: any } | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

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
    {
      label: 'Payments received (30 days)',
      value: `$${normalizeNumber(totalPaymentsLast30).toFixed(2)}`,
      trend: '',
    },
    {
      label: 'Invoices issued (all time)',
      value: loading ? '—' : String(invoiceCount),
      trend: '',
    },
    {
      label: 'Payments recorded (all time)',
      value: loading ? '—' : String(paymentCount),
      trend: '',
    },
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

    Promise.all([fetchFinancialOverview(), fetchInvoices(), fetchPayments()])
      .then(([overviewData, invoicesData, paymentsData]) => {
        if (!isMounted) return
        setOverview(overviewData)
        setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
        setPayments(Array.isArray(paymentsData) ? paymentsData : [])
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
      {/* Marketing and accountant navs render only for their respective roles based on internal checks */}
      <MarketingTopNav />
      <FinanceTopNav />
      {isController ? (
        <ControllerTopNav />
      ) : isPosRole ? (
        <PosTopNav />
      ) : isInventoryRole ? (
        <InventoryTopNav />
      ) : (
        <OwnerTopNav />
      )}

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <OwnerSideNav />

          <main className="flex-1 space-y-8 max-w-7xl mx-auto">

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
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-5 transition hover:shadow-md"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{kpi.label}</p>
                    <div className="flex items-end justify-between mt-1">
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                        {kpi.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Placeholder for the main report content (e.g., P&L, Balance Sheet) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-inner mt-4" />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}