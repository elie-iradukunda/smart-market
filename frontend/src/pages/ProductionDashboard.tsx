// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchWorkOrders, fetchOrders } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import StockAlerts from '../modules/dashboards/components/StockAlerts'

export default function ProductionDashboard() {
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [woData, ordersData] = await Promise.all([
          fetchWorkOrders(),
          fetchOrders(),
        ])
        setWorkOrders(woData || [])
        setOrders(ordersData || [])
      } catch (err) {
        console.error('Failed to load production data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const activeWorkOrders = workOrders.filter((wo) => wo.status !== 'completed' && wo.status !== 'cancelled').length
  const ordersInProduction = orders.filter((o) => o.status === 'in_production' || o.status === 'processing').length
  const today = new Date().toISOString().split('T')[0]
  const completedToday = workOrders.filter((wo) => {
    if (wo.status !== 'completed') return false
    const completedDate = wo.completed_at || wo.updated_at
    return completedDate?.startsWith(today)
  }).length

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-blue-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header section */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">Production manager</p>
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  Orchestrate the
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600"> entire job pipeline</span>
                </h1>
                <p className="mt-4 text-base text-gray-600 max-w-2xl">
                  Monitor all work orders, spot bottlenecks, and keep materials under control to deliver jobs on
                  time.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <Link
                  to="/production/work-orders"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Work orders board
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Sales orders
                </Link>
                <Link
                  to="/inventory/materials"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Materials
                </Link>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
              <img
                src="https://images.pexels.com/photos/4484076/pexels-photo-4484076.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Production manager overseeing print jobs"
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <p className="text-sm font-medium uppercase tracking-wider text-sky-200">Production overview</p>
                <p className="mt-2 text-base text-gray-100 max-w-sm">
                  See which stages are overloaded and where material shortages might slow the floor.
                </p>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white/95 p-6 shadow-md">
              <p className="text-sm font-medium text-gray-500">Active Work Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? '...' : activeWorkOrders}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white/95 p-6 shadow-md">
              <p className="text-sm font-medium text-gray-500">Orders in Production</p>
              <p className="mt-2 text-3xl font-bold text-sky-600">
                {loading ? '...' : ordersInProduction}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white/95 p-6 shadow-md">
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {loading ? '...' : completedToday}
              </p>
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
    </DashboardLayout>
  )
}
