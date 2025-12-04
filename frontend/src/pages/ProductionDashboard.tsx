// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchWorkOrders, fetchOrders } from '@/api/apiClient'
import { currentUserHasPermission } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import StockAlerts from '../modules/dashboards/components/StockAlerts'
import { ClipboardList, Package, CheckCircle2, Loader2, TrendingUp, ArrowRight } from 'lucide-react'

export default function ProductionDashboard() {
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [woData, ordersData] = await Promise.allSettled([
          fetchWorkOrders(),
          fetchOrders(),
        ])
        setWorkOrders(woData.status === 'fulfilled' ? (woData.value || []) : [])
        setOrders(ordersData.status === 'fulfilled' ? (ordersData.value || []) : [])
        
        // Log errors but don't break the dashboard
        if (woData.status === 'rejected') {
          console.error('Failed to load work orders:', woData.reason)
        }
        if (ordersData.status === 'rejected') {
          console.error('Failed to load orders:', ordersData.reason)
        }
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

  const stats = [
    {
      label: 'Active Work Orders',
      value: loading ? '...' : activeWorkOrders,
      icon: ClipboardList,
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-purple-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Orders in Production',
      value: loading ? '...' : ordersInProduction,
      icon: Package,
      color: 'blue',
      bgGradient: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Completed Today',
      value: loading ? '...' : completedToday,
      icon: CheckCircle2,
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr] items-stretch">
              {/* Main Welcome Card */}
              <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Production Manager</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                    Orchestrate the{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                      entire job pipeline
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                    Monitor all work orders, spot bottlenecks, and keep materials under control to deliver jobs on time.
                  </p>
                </div>
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                  {currentUserHasPermission('workorder.view') && (
                    <Link
                      to="/production/work-orders"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 border border-indigo-200/50 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Work Orders
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                  {currentUserHasPermission('order.view') && (
                    <Link
                      to="/orders"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                    >
                      <Package className="w-4 h-4" />
                      Sales Orders
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                  {currentUserHasPermission('material.view') && (
                    <Link
                      to="/inventory/materials"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-700 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                    >
                      <Package className="w-4 h-4" />
                      Materials
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Image Card - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:block rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-indigo-900 to-purple-900 shadow-2xl relative group">
                <img
                  src="https://images.pexels.com/photos/4484076/pexels-photo-4484076.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Production manager overseeing print jobs"
                  className="h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 w-fit">
                    <TrendingUp className="w-4 h-4 text-white/90" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Overview</p>
                  </div>
                  <p className="text-sm lg:text-base font-medium text-white/95 max-w-sm leading-relaxed">
                    See which stages are overloaded and where material shortages might slow the floor.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats section - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="group relative rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.bgGradient}`}></div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            <span className="text-2xl sm:text-3xl font-bold text-gray-300">...</span>
                          </div>
                        ) : (
                          <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${stat.textColor} transition-transform duration-300 group-hover:scale-105`}>
                            {stat.value}
                          </p>
                        )}
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Main widgets area - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2">
                <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <JobPipelineOverview />
                </div>
              </div>
              <div>
                <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                  <StockAlerts />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
