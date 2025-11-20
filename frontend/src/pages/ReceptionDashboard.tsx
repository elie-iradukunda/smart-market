// @ts-nocheck
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clearAuth, currentUserHasPermission } from '@/utils/apiClient'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'

export default function ReceptionDashboard() {
  const navigate = useNavigate()

  const canViewReports = currentUserHasPermission('report.view')

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar with logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Reception</h2>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 rounded-full px-3 py-1 border border-red-100 bg-red-50/60 hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>

        {/* Header section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Reception desk</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Welcome guests &amp;
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"> keep jobs flowing</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                See today's production pipeline and sales at a glance so reception can answer customer
                questions confidently and keep work moving.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Jobs in progress</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Customers waiting</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-emerald-50/90 px-4 py-3 border border-emerald-200 shadow-lg ring-1 ring-emerald-500/10">
                <dt className="text-xs font-medium text-emerald-700">Today's sales</dt>
                <dd className="mt-1 text-2xl font-bold text-emerald-800">--</dd>
              </div>
            </dl>
          </div>

          {/* Side card with guidance for reception */}
          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/8867435/pexels-photo-8867435.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Reception helping a customer"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-200">Front desk snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Quickly check job status and today's revenue so you can respond to walk-ins, calls, and
                WhatsApp messages in seconds.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                to="/communications/inbox"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Inbox
              </Link>
              <Link
                to="/production/work-orders"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Work orders
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Orders
              </Link>
              <Link
                to="/pos/terminal"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                POS terminal
              </Link>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        {canViewReports && (
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                <JobPipelineOverview />
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                <RevenueOverview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
