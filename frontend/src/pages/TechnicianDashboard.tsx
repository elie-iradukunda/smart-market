// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchWorkOrders, fetchMaterials } from '@/api/apiClient'
import TechnicianDashboardLayout from '@/components/layout/TechnicianDashboardLayout'
// import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
// import StockAlerts from '../modules/dashboards/components/StockAlerts'
import { ArrowRight } from 'lucide-react'

export default function TechnicianDashboard() {
  const navigate = useNavigate()
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [wo, mats] = await Promise.all([fetchWorkOrders(), fetchMaterials()])
        setWorkOrders(wo || [])
        setMaterials(mats || [])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const activeJobs = workOrders.filter((wo) => wo.status !== 'completed').length
  const dueToday = workOrders.filter((wo) => wo.due_date?.split('T')[0] === today).length
  const lowStock = materials.filter((m) => m.current_stock <= (m.reorder_level || 0)).length

  return (
    <TechnicianDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr] items-stretch">
              {/* Main Welcome Card */}
              <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Production Floor</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                    Keep every job{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600">
                      moving through the shop
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                    See the job pipeline and material risks so technicians can focus on the right work and avoid delays.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    to="/production/work-orders"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-sky-50 hover:bg-sky-100 px-4 py-2 text-xs sm:text-sm font-medium text-sky-700 border border-sky-200/50 hover:border-sky-300 transition-all duration-200 hover:shadow-md"
                  >
                    Work Orders
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/orders"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    Orders
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/inventory/materials"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-700 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                  >
                    Materials
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>

                {/* Key Metrics */}
                <dl className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-3 text-sm">
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Active Jobs</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{loading ? '...' : activeJobs}</dd>
                    <dd className="mt-2 text-[11px] text-sky-700">
                      <Link to="/production/work-orders" className="hover:text-sky-800 underline underline-offset-2">
                        View work orders
                      </Link>
                    </dd>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Due Today</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{loading ? '...' : dueToday}</dd>
                    <dd className="mt-2 text-[11px] text-sky-700">
                      <Link to="/production/work-orders" className="hover:text-sky-800 underline underline-offset-2">
                        See today's jobs
                      </Link>
                    </dd>
                  </div>
                  <div className="rounded-xl bg-sky-50/90 px-3 sm:px-4 py-3 border border-sky-200/80 shadow-md hover:shadow-lg transition-shadow ring-1 ring-sky-500/10">
                    <dt className="text-xs font-medium text-sky-700">Materials at Risk</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-sky-800">{loading ? '...' : lowStock}</dd>
                    <dd className="mt-2 text-[11px] text-sky-700">
                      <Link to="/inventory/materials" className="hover:text-sky-800 underline underline-offset-2">
                        Check materials
                      </Link>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Image Card - Hidden on mobile */}
              <div className="hidden md:block rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-sky-900 to-cyan-900 shadow-2xl relative group">
                <img
                  src="https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Technicians working in a print shop"
                  className="h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 w-fit">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Production Snapshot</p>
                  </div>
                  <p className="text-sm lg:text-base font-medium text-white/95 max-w-sm leading-relaxed">
                    Quickly check which jobs are blocked or urgent so the team can stay ahead of deadlines.
                  </p>
                </div>
              </div>
            </div>

            {/* Main widgets area - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">

            </div>
          </div>
        </div>
      </div>
    </TechnicianDashboardLayout>
  )
}
