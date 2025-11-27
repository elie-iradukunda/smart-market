// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import FinanceTopNav from '@/components/layout/FinanceTopNav'
import { fetchInvoices, fetchPayments, fetchPOSSales, fetchJournalEntries, fetchAccounts } from '@/api/apiClient'

export default function AccountantDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openInvoicesCount, setOpenInvoicesCount] = useState(0)
  const [overdueInvoicesCount, setOverdueInvoicesCount] = useState(0)
  const [totalPaymentsAmount, setTotalPaymentsAmount] = useState(0)
  const [posSalesCount, setPosSalesCount] = useState(0)
  const [journalEntriesCount, setJournalEntriesCount] = useState(0)
  const [accountsCount, setAccountsCount] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([
      fetchInvoices(),
      fetchPayments(),
      fetchPOSSales(),
      fetchJournalEntries(),
      fetchAccounts(),
    ])
      .then(([invoices, payments, posSales, journals, accounts]) => {
        if (!isMounted) return

        const invList = Array.isArray(invoices) ? invoices : []
        const pmtList = Array.isArray(payments) ? payments : []
        const posList = Array.isArray(posSales) ? posSales : []
        const jrList = Array.isArray(journals) ? journals : []
        const accList = Array.isArray(accounts) ? accounts : []

        const today = new Date().toISOString().slice(0, 10)

        const openInv = invList.filter((inv: any) => (inv.status || '').toLowerCase() !== 'paid')
        const overdueInv = invList.filter((inv: any) => {
          const status = (inv.status || '').toLowerCase()
          if (status === 'paid') return false
          const due = (inv.due_date || inv.dueDate || '').slice(0, 10)
          if (!due) return false
          return due < today
        })

        const totalPaid = pmtList.reduce((sum: number, p: any) => {
          const amt = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || '0')
          return sum + (isNaN(amt) ? 0 : amt)
        }, 0)

        setOpenInvoicesCount(openInv.length)
        setOverdueInvoicesCount(overdueInv.length || openInv.length)
        setTotalPaymentsAmount(totalPaid)
        setPosSalesCount(posList.length)
        setJournalEntriesCount(jrList.length)
        setAccountsCount(accList.length)
      })
      .catch((err: any) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load finance overview')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0.00'
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <FinanceTopNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Header section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-2xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Finance &amp; accounting</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Stay ahead of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-600"> cash flow &amp; margins</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                Monitor revenue, overdue invoices, and payment trends so the accountant can keep TOP Design
                financially healthy.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Open invoices</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">{loading ? '--' : openInvoicesCount}</dd>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Overdue / outstanding</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">{loading ? '--' : overdueInvoicesCount}</dd>
              </div>
              <div className="rounded-xl bg-indigo-50/90 px-4 py-3 border border-indigo-200 shadow-lg ring-1 ring-indigo-500/10">
                <dt className="text-xs font-medium text-indigo-700">Total payments this period*</dt>
                <dd className="mt-1 text-2xl font-bold text-indigo-800">{loading ? '--' : formatCurrency(totalPaymentsAmount)}</dd>
              </div>
            </dl>

            {/* Quick finance actions */}
            <div className="mt-6 flex flex-wrap gap-3 text-xs">
              <button
                type="button"
                onClick={() => navigate('/finance/invoices')}
                className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-800 border border-indigo-200 hover:bg-indigo-100"
              >
                View &amp; create invoices
              </button>
              <button
                type="button"
                onClick={() => navigate('/finance/payments')}
                className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              >
                Record a payment
              </button>
              <button
                type="button"
                onClick={() => navigate('/pos/sales-history')}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-800 border border-blue-200 hover:bg-blue-100"
              >
                Review POS sales
              </button>
              <button
                type="button"
                onClick={() => navigate('/finance/journals')}
                className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 font-medium text-slate-800 border border-slate-200 hover:bg-slate-100"
              >
                Journal entries
              </button>
            </div>
          </div>

          {/* Side card with finance context */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/6476587/pexels-photo-6476587.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Accountant reviewing financial reports"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-indigo-200">Finance snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Quickly see revenue trends and risk areas before closing the books or approving big purchases.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                to="/finance/invoices"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Invoices
              </Link>
              <Link
                to="/finance/payments"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Payments
              </Link>
              <Link
                to="/finance/journals"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Journal entries
              </Link>
              <Link
                to="/finance/reports"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Finance reports
              </Link>
              <Link
                to="/pos/sales-history"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                POS history
              </Link>
            </div>
          </div>
        </div>

        {/* Second row: finance building blocks */}
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">POS Sales</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? '--' : posSalesCount}</p>
              <p className="mt-1 text-xs text-slate-500">Recorded counter sales to reconcile with cash and mobile money.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pos/sales-history')}
              className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
            >
              Open POS history
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Journal entries</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? '--' : journalEntriesCount}</p>
              <p className="mt-1 text-xs text-slate-500">Manual adjustments and accruals posted into the ledger.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/finance/journals')}
              className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
            >
              View journal entries
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chart of accounts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? '--' : accountsCount}</p>
              <p className="mt-1 text-xs text-slate-500">Accounts available for posting journals and structuring reports.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/finance/reports')}
              className="mt-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
            >
              Open finance reports
            </button>
          </div>
        </div>

        {/* Main widget area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <RevenueOverview />
            </div>
            {error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
