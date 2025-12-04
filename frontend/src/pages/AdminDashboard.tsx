// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { currentUserHasPermission, getAuthUser } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowRight } from 'lucide-react'

import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import StockAlerts from '../modules/dashboards/components/StockAlerts'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const user = getAuthUser()
  // If this is the owner/admin role (role_id === 1), do not show AdminDashboard; redirect to owner dashboard instead
  if (user && user.role_id === 1) {
    navigate('/dashboard/owner')
    return null
  }

  const canViewReports = currentUserHasPermission('report.view')
  const canViewCampaigns = currentUserHasPermission('campaign.view') || currentUserHasPermission('campaign.manage')

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr] items-stretch">
              {/* Main Welcome Card */}
              <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Admin Control Panel</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                    Good afternoon,{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                      TOP Design
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                    Monitor revenue, production load, stock risk, and marketing performance in a single, powerful control center.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    to="/admin/users"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    Users & Access
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/admin/roles"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    Roles
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    Audit Logs
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/admin/system-settings"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    Settings
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/ai/overview"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-purple-50 hover:bg-purple-100 px-4 py-2 text-xs sm:text-sm font-medium text-purple-700 border border-purple-200/50 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                  >
                    <span className="text-xs">✨</span> AI Overview
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>

                {/* Key Metrics */}
                <dl className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-3 text-sm">
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Open Work Orders</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">13</dd>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Invoices Unpaid</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">RF 3,200</dd>
                  </div>
                  <div className="rounded-xl bg-amber-50/90 px-3 sm:px-4 py-3 border border-amber-200/80 shadow-md hover:shadow-lg transition-shadow ring-1 ring-amber-500/10">
                    <dt className="text-xs font-medium text-amber-700">Materials at Risk</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-amber-800">2</dd>
                  </div>
                </dl>
              </div>

              {/* Image Card - Hidden on mobile */}
              <div className="hidden md:block rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-blue-900 to-purple-900 shadow-2xl relative group">
                <img
                  src="https://images.pexels.com/photos/6476584/pexels-photo-6476584.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Large format printing workshop"
                  className="h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 w-fit">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Live Snapshot</p>
                  </div>
                  <p className="text-sm lg:text-base font-medium text-white/95 max-w-sm leading-relaxed">
                    Get instant visibility on your print shop status and act before bottlenecks appear.
                  </p>
                </div>
              </div>
            </div>

            {/* Component Grid - Responsive */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2 space-y-6">
                {canViewReports && (
                  <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <RevenueOverview />
                  </div>
                )}
                {canViewReports && (
                  <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <JobPipelineOverview />
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {canViewReports && (
                  <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <StockAlerts />
                  </div>
                )}
                {canViewCampaigns && (
                  <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <CampaignPerformanceWidget />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}