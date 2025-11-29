// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import { clearAuth, currentUserHasPermission } from '@/utils/apiClient'
import { fetchMaterials, fetchPurchaseOrders, fetchStockMovements } from '@/api/apiClient'
import ControllerTopNav from '@/components/layout/ControllerTopNav'

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

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-amber-50/50 px-0 pb-10">
      <ControllerTopNav />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-8">

        {/* Header section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-amber-700">Operations control</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Balance
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600"> cost, stock &amp; revenue</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                Give the controller one place to see revenue performance and inventory risk, so they can make
                fast decisions.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-4 text-sm">
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Total materials</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalMaterials}</dd>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Low stock items</dt>
                <dd className="mt-1 text-2xl font-bold text-red-600">{loading ? '...' : stats.lowStockItems}</dd>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                <dt className="text-xs font-medium text-gray-500">Pending POs</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">{loading ? '...' : stats.pendingPurchaseOrders}</dd>
              </div>
              <div className="rounded-xl bg-amber-50/90 px-4 py-3 border border-amber-200 shadow-lg ring-1 ring-amber-500/10">
                <dt className="text-xs font-medium text-amber-700">Recent movements</dt>
                <dd className="mt-1 text-2xl font-bold text-amber-800">{loading ? '...' : stats.recentMovements}</dd>
              </div>
            </dl>
          </div>

          {/* Side card with control context */}
          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/3730760/pexels-photo-3730760.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Manager reviewing performance dashboards"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-200">Control snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                See the impact of pricing, material costs, and stock levels before they hit your margins.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {currentUserHasPermission('report.view') && (
                <Link
                  to="/finance/reports"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Finance reports
                </Link>
              )}
              {currentUserHasPermission('invoice.create') && (
                <Link
                  to="/finance/invoices"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Invoices
                </Link>
              )}
              {currentUserHasPermission('payment.create') && (
                <Link
                  to="/finance/payments"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Payments
                </Link>
              )}
              {currentUserHasPermission('material.view') && (
                <Link
                  to="/inventory/materials"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Materials
                </Link>
              )}
              {(currentUserHasPermission('stock.move') || currentUserHasPermission('inventory.manage')) && (
                <Link
                  to="/inventory/purchase-orders"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Purchase orders
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick access row based on controller permissions */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {currentUserHasPermission('customer.view') && (
            <button
              type="button"
              onClick={() => navigate('/crm/customers')}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Customers</p>
                <p className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">View &amp; manage customers</p>
              </div>
              <span className="mt-3 text-xs text-blue-600 font-semibold">Go to customers →</span>
            </button>
          )}

          {currentUserHasPermission('order.view') && (
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Orders</p>
                <p className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">Track &amp; update production orders</p>
              </div>
              <span className="mt-3 text-xs text-blue-600 font-semibold">Go to orders →</span>
            </button>
          )}

          {currentUserHasPermission('material.view') && (
            <button
              type="button"
              onClick={() => navigate('/inventory/materials')}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Materials &amp; stock</p>
                <p className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">Check stock &amp; movements</p>
              </div>
              <span className="mt-3 text-xs text-blue-600 font-semibold">Go to inventory →</span>
            </button>
          )}

          {(currentUserHasPermission('invoice.create') || currentUserHasPermission('payment.create')) && (
            <button
              type="button"
              onClick={() => navigate('/finance/invoices')}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Finance</p>
                <p className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-700">Invoices &amp; payments overview</p>
              </div>
              <span className="mt-3 text-xs text-blue-600 font-semibold">Open finance workspace →</span>
            </button>
          )}
        </div>

        {/* Main widgets area intentionally kept minimal for controller (no owner-level revenue/stock widgets) */}
      </div>
    </div>
  )
}
