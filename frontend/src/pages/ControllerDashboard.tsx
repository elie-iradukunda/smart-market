// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { currentUserHasPermission } from '@/utils/apiClient'
import { fetchMaterials, fetchPurchaseOrders, fetchStockMovements } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ArrowRight, Users, Package, DollarSign } from 'lucide-react'

interface InventoryStats {
  totalMaterials: number
  lowStockItems: number
  pendingPurchaseOrders: number
  recentMovements: number
}

export default function ControllerDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<InventoryStats>({
    totalMaterials: 0,
    lowStockItems: 0,
    pendingPurchaseOrders: 0,
    recentMovements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [materials, purchaseOrders, stockMovements] = await Promise.all([
          fetchMaterials(),
          fetchPurchaseOrders(),
          fetchStockMovements(),
        ])

        const lowStock = materials.filter((m: any) => m.current_stock <= (m.reorder_level || 10)).length
        const pendingPOs = purchaseOrders.filter((po: any) => po.status === 'pending' || po.status === 'ordered').length
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const recentMoves = stockMovements.filter((sm: any) => new Date(sm.created_at) >= sevenDaysAgo).length

        setStats({
          totalMaterials: materials.length,
          lowStockItems: lowStock,
          pendingPurchaseOrders: pendingPOs,
          recentMovements: recentMoves,
        })
      } catch (err) {
        console.error('Failed to load inventory stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr] items-stretch">
              {/* Main Welcome Card */}
              <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Operations Control</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                    Balance{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">
                      cost, stock & revenue
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                    Give the controller one place to see revenue performance and inventory risk, so they can make fast decisions.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                  {currentUserHasPermission('report.view') && (
                    <Link
                      to="/finance/reports"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-amber-50 hover:bg-amber-100 px-4 py-2 text-xs sm:text-sm font-medium text-amber-700 border border-amber-200/50 hover:border-amber-300 transition-all duration-200 hover:shadow-md"
                    >
                      Finance Reports
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                  {currentUserHasPermission('invoice.create') && (
                    <Link
                      to="/finance/invoices"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                    >
                      Invoices
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                  {currentUserHasPermission('payment.create') && (
                    <Link
                      to="/finance/payments"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-700 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                    >
                      Payments
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                  {currentUserHasPermission('material.view') && (
                    <Link
                      to="/inventory/materials"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 border border-indigo-200/50 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
                    >
                      Materials
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                  {(currentUserHasPermission('stock.move') || currentUserHasPermission('inventory.manage')) && (
                    <Link
                      to="/inventory/purchase-orders"
                      className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-purple-50 hover:bg-purple-100 px-4 py-2 text-xs sm:text-sm font-medium text-purple-700 border border-purple-200/50 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                    >
                      Purchase Orders
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                </div>

                {/* Key Metrics */}
                <dl className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4 text-sm">
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Total Materials</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalMaterials}</dd>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-red-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-red-600">Low Stock Items</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-red-600">{loading ? '...' : stats.lowStockItems}</dd>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Pending POs</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{loading ? '...' : stats.pendingPurchaseOrders}</dd>
                  </div>
                  <div className="rounded-xl bg-amber-50/90 px-3 sm:px-4 py-3 border border-amber-200/80 shadow-md hover:shadow-lg transition-shadow ring-1 ring-amber-500/10">
                    <dt className="text-xs font-medium text-amber-700">Recent Movements</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-amber-800">{loading ? '...' : stats.recentMovements}</dd>
                  </div>
                </dl>
              </div>

              {/* Image Card - Hidden on mobile */}
              <div className="hidden md:block rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-amber-900 to-orange-900 shadow-2xl relative group">
                <img
                  src="https://images.pexels.com/photos/3730760/pexels-photo-3730760.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Manager reviewing performance dashboards"
                  className="h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 w-fit">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Control Snapshot</p>
                  </div>
                  <p className="text-sm lg:text-base font-medium text-white/95 max-w-sm leading-relaxed">
                    See the impact of pricing, material costs, and stock levels before they hit your margins.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick access row - Responsive grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentUserHasPermission('customer.view') && (
                <button
                  type="button"
                  onClick={() => navigate('/crm/customers')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customers</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">View & manage customers</p>
                  </div>
                  <span className="mt-3 text-xs text-amber-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Go to customers <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}

              {currentUserHasPermission('order.view') && (
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                        <Package className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Orders</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Track & update production orders</p>
                  </div>
                  <span className="mt-3 text-xs text-amber-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Go to orders <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}

              {currentUserHasPermission('material.view') && (
                <button
                  type="button"
                  onClick={() => navigate('/inventory/materials')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                        <Package className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Materials & Stock</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Check stock & movements</p>
                  </div>
                  <span className="mt-3 text-xs text-amber-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Go to inventory <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}

              {(currentUserHasPermission('invoice.create') || currentUserHasPermission('payment.create')) && (
                <button
                  type="button"
                  onClick={() => navigate('/finance/invoices')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Finance</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">Invoices & payments overview</p>
                  </div>
                  <span className="mt-3 text-xs text-amber-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open finance workspace <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
