// @ts-nocheck
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clearAuth } from '@/utils/apiClient'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import StockAlerts from '../modules/dashboards/components/StockAlerts'

export default function TechnicianDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-blue-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar with logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Technician</h2>
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
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">Production floor</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Keep every job
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600"> moving through the shop</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                See the job pipeline and material risks so technicians can focus on the right work and avoid
                delays.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Active jobs</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Due today</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">--</dd>
              </div>
              <div className="rounded-xl bg-sky-50/90 px-4 py-3 border border-sky-200 shadow-lg ring-1 ring-sky-500/10">
                <dt className="text-xs font-medium text-sky-700">Materials at risk</dt>
                <dd className="mt-1 text-2xl font-bold text-sky-800">--</dd>
              </div>
            </dl>
          </div>

          {/* Side card with production context */}
          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Technicians working in a print shop"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-sky-200">Production snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Quickly check which jobs are blocked or urgent so the team can stay ahead of deadlines.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
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
                to="/inventory/materials"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Materials
              </Link>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <JobPipelineOverview />
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <StockAlerts />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
