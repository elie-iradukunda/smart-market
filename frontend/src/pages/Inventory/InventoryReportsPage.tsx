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
      <div className="space-y-8 min-h-screen bg-slate-50/50 pb-10">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BarChart3 size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Analytics & Reports</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Inventory Intelligence
          </h1>
          <p className="mt-3 text-base text-slate-500 max-w-2xl leading-relaxed">
            Real-time insights into stock levels, valuation, and movement history to optimize your supply chain.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-600" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">Total Items</p>
              <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <PackageCheck size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalMaterials}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-600 transition-colors">Low Stock</p>
              <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                <AlertTriangle size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.lowStock}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-red-600 transition-colors">Out of Stock</p>
              <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                <PackageX size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.outOfStock}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-colors">Total Qty</p>
              <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <PackageCheck size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalQty.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">Valuation</p>
              <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              <span className="text-lg font-medium text-slate-400 mr-1">RF</span>
              {stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Main Table: Material Stock Status */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Stock Levels</h2>
              <p className="text-sm text-slate-500 mt-1">Detailed inventory status by item</p>
            </div>
            {loading && <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 animate-pulse">Updating...</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">SKU</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Item Name</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">In Stock</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Reorder Level</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {materials.map((m) => (
                  <tr key={m.id || m.sku} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{m.sku}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{m.name}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{m.current_stock}</td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-500">{m.reorder_level}</td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${m.stock_status === 'out_of_stock'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : m.stock_status === 'low_stock'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}
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
                    <td colSpan={5} className="px-8 py-12 text-center text-sm text-slate-500">
                      No inventory items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Grid: Alerts, Movements, POs */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">

          {/* Stock Alerts */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Stock Alerts</h3>
            <p className="text-sm text-slate-500 mb-6">Items requiring immediate attention</p>
            <StockAlerts />
          </div>

          {/* Recent Movements */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm h-full overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Recent Movements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Item</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {movements.slice(0, 8).map((mv) => (
                    <tr key={mv.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 whitespace-nowrap text-xs text-slate-500">
                        {mv.movement_date ? new Date(mv.movement_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{mv.material_name || mv.material_id}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${mv.type === 'out' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {mv.type === 'out' ? 'Outgoing' : 'Incoming'}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm font-bold text-right ${mv.type === 'out' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {mv.type === 'out' ? '-' : '+'}{mv.quantity}
                      </td>
                    </tr>
                  ))}
                  {!loading && movements.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No movements recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest POs */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm h-full overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Latest Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">PO #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {purchaseOrders.slice(0, 8).map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-medium text-slate-900">#{po.id}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${po.status === 'received' ? 'text-emerald-600' :
                              po.status === 'ordered' ? 'text-blue-600' : 'text-slate-500'
                            }`}>
                            {po.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">{po.supplier_name || po.supplier_id}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900 text-right">
                        {po.total_amount != null ? `RF ${Number(po.total_amount).toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                  {!loading && purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">No purchase orders.</td>
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
