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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr] items-stretch">
              {/* Main Welcome Card */}
              <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Inventory Management</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                    Keep materials{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                      available
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                    Monitor stock levels, track movements, and manage suppliers efficiently. Never let production wait for materials again.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    to="/inventory/materials"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-700 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                  >
                    <Package size={16} />
                    Manage Materials
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/inventory/purchase-orders"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-teal-50 hover:bg-teal-100 px-4 py-2 text-xs sm:text-sm font-medium text-teal-700 border border-teal-200/50 hover:border-teal-300 transition-all duration-200 hover:shadow-md"
                  >
                    <DollarSign size={16} />
                    Purchase Orders
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>

              {/* Stats Card - Hidden on mobile */}
              <div className="hidden md:block rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-gradient-to-br from-emerald-900 to-teal-900 shadow-2xl relative p-6 lg:p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mb-3">
                      <AlertTriangle size={18} />
                    </div>
                    <p className="text-xs font-medium text-gray-300">Low Stock Items</p>
                    <p className="text-xl font-bold text-white mt-1">12</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 mb-3">
                      <TrendingUp size={18} />
                    </div>
                    <p className="text-xs font-medium text-gray-300">Stock Value</p>
                    <p className="text-xl font-bold text-white mt-1">RF 45.2k</p>
                  </div>
                  <div className="col-span-2 rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-300">Pending Orders</p>
                        <p className="text-xl font-bold text-white mt-1">5</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-80"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main widgets area - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2">
                <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
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
                <div className="rounded-xl lg:rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
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
        </div>
      </div>
    </DashboardLayout>
  )
}

