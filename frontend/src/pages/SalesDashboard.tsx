// @ts-nocheck
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clearAuth } from '@/utils/apiClient'
import SalesTopNav from '@/components/layout/SalesTopNav'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'

export default function SalesDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar with logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Sales</h2>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 rounded-full px-3 py-1 border border-red-100 bg-red-50/60 hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>

        {/* Shared sales navbar */}
        <SalesTopNav />

        {/* Header section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Sales</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Convert more
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"> leads into orders</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                See how sales campaigns and offers are turning into revenue so reps know where to focus.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                to="/crm/leads"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Leads
              </Link>
              <Link
                to="/crm/quotes"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Quotes
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Orders
              </Link>
              <Link
                to="/communications/inbox"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Inbox
              </Link>
              <Link
                to="/marketing/campaigns"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Campaigns
              </Link>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Sales team collaborating"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-200">Sales snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Quickly see which initiatives are driving quotes and orders this week.
              </p>
            </div>
          </div>
        </div>

        {/* Key sales actions for accountants */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">1. Capture interest</p>
              <h3 className="mt-1 text-sm font-bold text-gray-900">Create leads</h3>
              <p className="mt-1 text-xs text-gray-600">
                When a company or person asks for prices, add them as a lead so you don&apos;t lose the opportunity.
              </p>
            </div>
            <div className="mt-3">
              <Link
                to="/crm/leads"
                className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Go to Leads
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">2. Send prices</p>
              <h3 className="mt-1 text-sm font-bold text-gray-900">Create & manage quotes</h3>
              <p className="mt-1 text-xs text-gray-600">
                Prepare price offers for leads and customers. Keep them as Draft or Sent until the customer decides.
              </p>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Link
                to="/crm/quotes"
                className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                Go to Quotes
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white/95 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">3. Customer says &quot;Yes&quot;</p>
              <h3 className="mt-1 text-sm font-bold text-gray-900">Approve quote → Order</h3>
              <p className="mt-1 text-xs text-gray-600">
                When a customer accepts a quote, approve it in the quotes screen so the system creates an order.
              </p>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Link
                to="/crm/quotes"
                className="inline-flex items-center rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
              >
                Review Quotes
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <CampaignPerformanceWidget />
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <RevenueOverview />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
