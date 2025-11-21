// @ts-nocheck
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clearAuth, currentUserHasPermission } from '@/utils/apiClient'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'

export default function MarketingDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar with logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Marketing</h2>
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
              <p className="text-sm font-semibold uppercase tracking-wider text-fuchsia-700">Marketing performance</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Turn campaigns into
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-600"> revenue for TOP Design</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                Track campaign performance, cost per lead, and revenue impact so marketing can double down on
                the channels that work.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Active campaigns</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Leads this month</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-fuchsia-50/90 px-4 py-3 border border-fuchsia-200 shadow-lg ring-1 ring-fuchsia-500/10">
                <dt className="text-xs font-medium text-fuchsia-700">ROAS</dt>
                <dd className="mt-1 text-2xl font-bold text-fuchsia-800">--</dd>
              </div>
            </dl>
          </div>

          {/* Side card with marketing context */}
          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Marketing team reviewing campaign performance"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-fuchsia-200">Campaign snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Quickly see which campaigns are bringing in leads and revenue so you can adjust budgets in real
                time.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                to="/marketing/campaigns"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Campaigns
              </Link>
              <Link
                to="/marketing/ad-performance"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Ad performance
              </Link>
              <Link
                to="/crm/leads"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Leads
              </Link>
              <Link
                to="/finance/reports"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Marketing ROI
              </Link>
              <Link
                to="/ai/overview"
                className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-800 border border-purple-100 hover:bg-purple-100"
              >
                <span className="mr-1.5 text-xs">✨</span> AI insights
              </Link>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            {currentUserHasPermission('campaign.view') && (
              <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                <CampaignPerformanceWidget />
              </div>
            )}
          </div>
          <div className="space-y-6">
            {currentUserHasPermission('report.view') && (
              <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                <RevenueOverview />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
