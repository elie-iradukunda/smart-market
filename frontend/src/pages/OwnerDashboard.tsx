// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth } from '@/utils/apiClient'

export default function OwnerDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Business Owner</h2>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 rounded-full px-3 py-1 border border-red-100 bg-red-50/60 hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>

        {/* Hero section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Owner command center</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Run your entire <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">print business</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                Quick access to finance, operations, sales, marketing, and team controls in one place.
              </p>
            </div>

            {/* High-level areas */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Money & performance</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Link to="/finance/reports" className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-800 border border-blue-100 hover:bg-blue-100">Finance reports</Link>
                  <Link to="/finance/invoices" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Invoices</Link>
                  <Link to="/finance/payments" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Payments</Link>
                  <Link to="/pos/sales-history" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">POS sales</Link>
                  <Link to="/finance/journals" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Journal entries</Link>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Operations & inventory</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Link to="/orders" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Orders</Link>
                  <Link to="/production/work-orders" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Work orders</Link>
                  <Link to="/inventory/materials" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Materials</Link>
                  <Link to="/inventory/purchase-orders" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Purchase orders</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: People, customers, marketing, AI */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-5 shadow-xl">
              <p className="text-xs font-semibold text-gray-500 mb-2">Customers & sales</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link to="/crm/leads" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Leads</Link>
                <Link to="/crm/quotes" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Quotes</Link>
                <Link to="/orders" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Sales orders</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-5 shadow-xl">
              <p className="text-xs font-semibold text-gray-500 mb-2">Marketing & campaigns</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link to="/marketing/campaigns" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Campaigns</Link>
                <Link to="/marketing/ad-performance" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Ad performance</Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-5 shadow-xl">
              <p className="text-xs font-semibold text-gray-500 mb-2">AI & insights</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link to="/ai/overview" className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-800 border border-purple-100 hover:bg-purple-100">
                  <span className="mr-1.5 text-xs">✨</span> AI overview
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-5 shadow-xl">
              <p className="text-xs font-semibold text-gray-500 mb-2">Team & communication</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link to="/communications/inbox" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Inbox</Link>
                <Link to="/admin/users" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Users</Link>
                <Link to="/admin/roles" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Roles & permissions</Link>
                <Link to="/admin/audit-logs" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">Audit logs</Link>
                <Link to="/admin/system-settings" className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100">System settings</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
