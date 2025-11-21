// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import StockAlerts from '../../modules/dashboards/components/StockAlerts'
import { fetchInventoryReport, fetchStockMovements, fetchPurchaseOrders } from '@/api/apiClient'

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-lime-50/50">
      <InventoryTopNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Inventory reports</p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Stock health &
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-lime-600">
              inventory performance
            </span>
          </h1>
          <p className="mt-4 text-base text-gray-600 max-w-2xl">
            See low stock, out-of-stock and total quantities so you can plan purchase orders and support production.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {/* KPI cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-gray-100 bg-white/95 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total materials</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalMaterials}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Low stock</p>
            <p className="mt-2 text-2xl font-bold text-amber-900">{stats.lowStock}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Out of stock</p>
            <p className="mt-2 text-2xl font-bold text-red-900">{stats.outOfStock}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total quantity on hand</p>
            <p className="mt-2 text-2xl font-bold text-emerald-900">{stats.totalQty}</p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Total stock value</p>
            <p className="mt-2 text-2xl font-bold text-indigo-900">
              {stats.totalValue ? `$${stats.totalValue.toFixed(2)}` : '$0.00'}
            </p>
          </div>
        </div>

        {/* Main content: stock alerts + material table */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <StockAlerts />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Material stock status</h2>
              {loading && <span className="text-xs text-gray-500">Loading…</span>}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">SKU</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Current stock</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reorder level</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {materials.map((m) => (
                    <tr key={m.id || m.sku}>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 text-xs sm:text-sm">{m.sku}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-700 text-xs sm:text-sm">{m.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-900 text-xs sm:text-sm">{m.current_stock}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-700 text-xs sm:text-sm">{m.reorder_level}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
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
                        className="px-4 py-6 text-center text-xs sm:text-sm text-gray-500"
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
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Material</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {movements.map((mv) => (
                    <tr key={mv.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        {mv.movement_date ? new Date(mv.movement_date).toLocaleDateString() : ''}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">{mv.material_name || mv.material_id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
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
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">{mv.quantity}</td>
                    </tr>
                  ))}
                  {!loading && movements.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-xs sm:text-sm text-gray-500">
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
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">PO #</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Supplier</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">{po.id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-700">{po.supplier_name || po.supplier_id}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm">
                        <span className="inline-flex rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                          {po.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {po.total_amount != null ? `$${Number(po.total_amount).toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                  {!loading && purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-xs sm:text-sm text-gray-500">
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
    </div>
  )
}
