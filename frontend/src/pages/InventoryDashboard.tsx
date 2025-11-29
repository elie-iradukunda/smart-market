// @ts-nocheck
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StockAlerts from '../modules/dashboards/components/StockAlerts'
import { createMaterial } from '@/api/apiClient'
import { currentUserHasPermission } from '@/utils/apiClient'
import { Plus, ArrowRight, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react'

export default function InventoryDashboard() {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')
  const [reorderLevel, setReorderLevel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreateMaterial = currentUserHasPermission('material.create')

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreateMaterial) return
    setSaving(true)
    setError(null)
    try {
      await createMaterial({
        name,
        unit,
        category,
        reorder_level: reorderLevel === '' ? null : Number(reorderLevel),
      })
      setName('')
      setUnit('')
      setCategory('')
      setReorderLevel('')
    } catch (err: any) {
      setError(err.message || 'Failed to create material')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-2xl sm:p-10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"></div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                Inventory Management
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Keep materials <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">available</span>
              </h1>
              <p className="mt-4 text-lg text-gray-300 max-w-xl">
                Monitor stock levels, track movements, and manage suppliers efficiently. Never let production wait for materials again.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/inventory/materials"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition-all hover:scale-105"
                >
                  <Package size={18} />
                  Manage Materials
                </Link>
                <Link
                  to="/inventory/purchase-orders"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <DollarSign size={18} />
                  Purchase Orders
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mb-4">
                    <AlertTriangle size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-400">Low Stock Items</p>
                  <p className="text-2xl font-bold text-white mt-1">12</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 mb-4">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-400">Stock Value</p>
                  <p className="text-2xl font-bold text-white mt-1">$45.2k</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Pending Orders</p>
                      <p className="text-2xl font-bold text-white mt-1">5</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-80"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Stock Alerts</h3>
                <Link to="/inventory/reports" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  View Report <ArrowRight size={16} />
                </Link>
              </div>
              <StockAlerts />
            </div>
          </div>

          {canCreateMaterial && (
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quick Add</h3>
                  <p className="text-xs text-gray-500">Add new material to inventory</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3">
                  <p className="text-xs text-red-600 font-medium flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleCreateMaterial} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Material Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Steel Sheet 5mm"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="kg, pcs"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Raw Material"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reorder Level</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="100"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? 'Saving...' : 'Create Material'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

