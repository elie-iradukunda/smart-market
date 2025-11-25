// @ts-nocheck
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import StockAlerts from '../modules/dashboards/components/StockAlerts'
import { createMaterial, fetchDemoMaterials } from '@/api/apiClient'
import { currentUserHasPermission } from '@/utils/apiClient'

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-lime-50/50">
      <InventoryTopNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Header section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Inventory management</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Keep materials
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-lime-600"> available, not expensive</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                Watch low stock, critical SKUs, and purchase needs so the production team never waits for
                materials.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                to="/inventory/materials"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Materials
              </Link>
              <Link
                to="/inventory/suppliers"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Suppliers
              </Link>
              <Link
                to="/inventory/stock-movements"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Stock movements
              </Link>
              <Link
                to="/inventory/purchase-orders"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Purchase orders
              </Link>
              <Link
                to="/inventory/reports"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Inventory reports
              </Link>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/4484072/pexels-photo-4484072.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Inventory manager checking stock"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-200">Inventory snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Instantly see which materials are at risk so you can create purchase orders before jobs stop.
              </p>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <StockAlerts />
            </div>
          </div>

          {canCreateMaterial && (
            <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">New material</p>
              {error && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1 mb-1">{error}</p>
              )}
              <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-emerald-900 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-md border border-emerald-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-emerald-900 mb-1">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full rounded-md border border-emerald-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-emerald-900 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-md border border-emerald-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-emerald-900 mb-1">Reorder level</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className="w-full rounded-md border border-emerald-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed w-full"
                >
                  {saving ? 'Saving...' : 'Save material'}
                </button>
                <p className="text-[10px] text-emerald-800/80 leading-snug">
                  Tip: Use this for quick capture when a new stock item arrives. For full editing, go to the
                  Materials page.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
