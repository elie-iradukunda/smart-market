// @ts-nocheck
import React from 'react'
import { Link } from 'react-router-dom'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import OwnerTopNav from '@/components/layout/OwnerTopNav'

export default function AccountantDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerTopNav />
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
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Overdue balance</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-indigo-50/90 px-4 py-3 border border-indigo-200 shadow-lg ring-1 ring-indigo-500/10">
                <dt className="text-xs font-medium text-indigo-700">Month-to-date revenue</dt>
                <dd className="mt-1 text-2xl font-bold text-indigo-800">--</dd>
              </div>
            </dl>
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

        {/* Main widget area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <RevenueOverview />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
