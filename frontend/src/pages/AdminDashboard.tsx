// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, currentUserHasPermission } from '@/utils/apiClient'
import AdminTopNav from '@/components/layout/AdminTopNav'

import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import StockAlerts from '../modules/dashboards/components/StockAlerts'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const canViewReports = currentUserHasPermission('report.view')
  const canViewCampaigns = currentUserHasPermission('campaign.view') || currentUserHasPermission('campaign.manage')

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    // Background wrapper for admin / manager / viewer
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-0 pb-10">
      <AdminTopNav />
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6 sm:px-6 lg:px-8">
        {/* Top bar with title and logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Admin</h2>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 rounded-full px-3 py-1 border border-red-100 bg-red-50/60 hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>

        {/* Main Header and Image Section Grid */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-stretch">
          
          {/* Main Welcome Card - Cleaned up glassmorphism and enhanced typography */}
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              {/* Adjusted color to a deep blue/purple similar to the image */}
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Admin control panel</p>
              {/* Enhanced font size and weight for a more professional headline */}
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Good afternoon, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">TOP Design</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                Monitor revenue, production load, stock risk, and marketing performance in a single, powerful control center.
              </p>
            </div>

            {/* Quick Links/Action Tags - Admin-only navigation */}
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <Link
                to="/admin/users"
                // Cleaned up link styling: subtle shadow, light background, focus on text color
                className="inline-flex items-center rounded-full bg-blue-50/50 border border-blue-100 px-4 py-1.5 font-medium text-blue-800 hover:bg-blue-100 transition duration-150 ease-in-out shadow-sm"
              >
                Users & Access
              </Link>
              <Link
                to="/admin/roles"
                className="inline-flex items-center rounded-full bg-blue-50/50 border border-blue-100 px-4 py-1.5 font-medium text-blue-800 hover:bg-blue-100 transition duration-150 ease-in-out shadow-sm"
              >
                Roles
              </Link>
              <Link
                to="/admin/audit-logs"
                className="inline-flex items-center rounded-full bg-blue-50/50 border border-blue-100 px-4 py-1.5 font-medium text-blue-800 hover:bg-blue-100 transition duration-150 ease-in-out shadow-sm"
              >
                Audit logs
              </Link>
              <Link
                to="/admin/system-settings"
                className="inline-flex items-center rounded-full bg-blue-50/50 border border-blue-100 px-4 py-1.5 font-medium text-blue-800 hover:bg-blue-100 transition duration-150 ease-in-out shadow-sm"
              >
                System settings
              </Link>

              {/* Other admin-level quick links */}
              <Link
                to="/ai/overview"
                className="inline-flex items-center rounded-full bg-purple-50/50 border border-purple-100 px-4 py-1.5 font-medium text-purple-800 hover:bg-purple-100 transition duration-150 ease-in-out shadow-sm"
              >
                <span className="mr-1.5 text-xs">✨</span> AI overview
              </Link>
              {/* Non-admin domain dashboards (CRM, Inventory, Finance, etc.) are accessed from role-specific dashboards, not from here */}
            </div>

            {/* Key Metric Snapshot - Enhanced for cleaner look */}
            <dl className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-white/70 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Open work orders</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">13</dd>
              </div>
              <div className="rounded-xl bg-white/70 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Invoices unpaid</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">$3,200</dd>
              </div>
              {/* Highlight Card for Alerts - Made slightly more subtle/premium */}
              <div className="rounded-xl bg-amber-50/90 px-4 py-3 border border-amber-200 shadow-lg ring-1 ring-amber-500/10">
                <dt className="text-xs font-medium text-amber-700">Materials at risk</dt>
                <dd className="mt-1 text-2xl font-bold text-amber-800">2</dd>
              </div>
            </dl>
          </div>

          {/* Operations Image Card - Retaining dark, high-contrast style */}
          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/6476584/pexels-photo-6476584.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Large format printing workshop"
              className="h-full w-full object-cover opacity-70" // Slightly reduced opacity for a deeper look
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-indigo-300">Live operations snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Get instant visibility on your print shop status and act before bottlenecks appear.
              </p>
            </div>
          </div>
        </div>

        {/* Component Grid - Ensuring component containers match the new design (assuming components use the same card styling) */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            {canViewReports && <RevenueOverview />}
            {canViewReports && <JobPipelineOverview />}
          </div>
          <div className="space-y-6">
            {canViewReports && <StockAlerts />}
            {canViewCampaigns && <CampaignPerformanceWidget />}
          </div>
        </div>
      </div>
    </div>
  )
}