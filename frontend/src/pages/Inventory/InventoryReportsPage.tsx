// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StockAlerts from '../../modules/dashboards/components/StockAlerts'
import { fetchInventoryReport, fetchStockMovements, fetchPurchaseOrders } from '@/api/apiClient'
import { BarChart3, AlertTriangle, PackageX, PackageCheck, DollarSign } from 'lucide-react'

export default function InventoryReportsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([fetchInventoryReport(), fetchStockMovements(), fetchPurchaseOrders()])
      .then(([inventoryData, movementData, poData]) => {
        if (!isMounted) return
        setMaterials(Array.isArray(inventoryData) ? inventoryData : [])
        setMovements(Array.isArray(movementData) ? movementData.slice(0, 10) : [])
        setPurchaseOrders(Array.isArray(poData) ? poData.slice(0, 10) : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load inventory report')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const totalMaterials = materials.length
    let lowStock = 0
    let outOfStock = 0
    let totalQty = 0
    let totalValue = 0

    materials.forEach((m) => {
      if (m.stock_status === 'out_of_stock') outOfStock += 1
      if (m.stock_status === 'low_stock') lowStock += 1
      const qty = typeof m.current_stock === 'number' ? m.current_stock : parseFloat(m.current_stock || '0')
      const unitCost = typeof m.unit_cost === 'number' ? m.unit_cost : parseFloat(m.unit_cost || '0')
      if (Number.isFinite(qty)) {
        totalQty += qty
        if (Number.isFinite(unitCost)) {
          totalValue += qty * unitCost
        }
      }
    })

    return { totalMaterials, lowStock, outOfStock, totalQty, totalValue }
  }, [materials])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <BarChart3 size={20} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">Analytics</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Stock Health & Performance
          </h1>
          <p className="mt-4 text-base text-gray-600 max-w-2xl">
            See low stock, out-of-stock and total quantities so you can plan purchase orders and support production.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </p>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total materials</p>
              <PackageCheck size={16} className="text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalMaterials}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Low stock</p>
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-900">{stats.lowStock}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Out of stock</p>
              <PackageX size={16} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.outOfStock}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Qty</p>
              <PackageCheck size={16} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-900">{stats.totalQty}</p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Total Value</p>
              <DollarSign size={16} className="text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-indigo-900">
              {stats.totalValue ? `$${stats.totalValue.toFixed(2)}` : '$0.00'}
            </p>
          </div>
        </div>

        {/* Main content: stock alerts + material table */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stock Alerts</h3>
              <StockAlerts />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Material stock status</h2>
              {loading && <span className="text-xs text-gray-500">Loading…</span>}
            </div>
            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reorder</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {materials.map((m) => (
                    <tr key={m.id || m.sku} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">{m.sku}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-900 font-medium">{m.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-900">{m.current_stock}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">{m.reorder_level}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span
                          className={
                            m.stock_status === 'out_of_stock'
                              ? 'inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700'
                              : m.stock_status === 'low_stock'
                                ? 'inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700'
                                : 'inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'
                          }
                        >
                          {m.stock_status === 'out_of_stock'
                            ? 'Out of stock'
                            : m.stock_status === 'low_stock'
                              ? 'Low stock'
                              : 'In stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && materials.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No materials found in inventory report.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent stock movements and purchase orders summary */}
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          {/* Recent stock movements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent stock movements</h2>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {movements.map((mv) => (
                    <tr key={mv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">
                        {mv.movement_date ? new Date(mv.movement_date).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{mv.material_name || mv.material_id}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span
                          className={
                            mv.type === 'out'
                              ? 'inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700'
                              : 'inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700'
                          }
                        >
                          {mv.type === 'out' ? 'Out' : 'In'}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{mv.quantity}</td>
                    </tr>
                  ))}
                  {!loading && movements.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        No recent stock movements.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchase orders summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Latest purchase orders</h2>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">PO #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-xs font-mono text-gray-500">#{po.id}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{po.supplier_name || po.supplier_id}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {po.total_amount != null ? `$${Number(po.total_amount).toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                  {!loading && purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        No purchase orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
