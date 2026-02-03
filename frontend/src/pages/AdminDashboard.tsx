// @ts-nocheck
import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowRight } from 'lucide-react'

import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import StockAlerts from '../modules/dashboards/components/StockAlerts'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Control Panel
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Monitor revenue, production load, stock risk, and marketing performance.
                </p>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/admin/users"
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Users & Access
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/admin/roles"
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Roles
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/admin/audit-logs"
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Audit Logs
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/admin/system-settings"
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Settings
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Key Metrics */}
              <dl className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Open Work Orders</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">13</dd>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Invoices Unpaid</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">RF 3,200</dd>
                </div>
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                  <dt className="text-xs font-medium text-red-700 uppercase">Materials at Risk</dt>
                  <dd className="mt-1 text-2xl font-semibold text-red-800">2</dd>
                </div>
              </dl>
            </div>

            {/* Widgets Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <RevenueOverview />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <JobPipelineOverview />
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <StockAlerts />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <CampaignPerformanceWidget />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}