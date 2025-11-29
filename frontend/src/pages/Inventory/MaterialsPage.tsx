// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMaterials } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getAuthUser, currentUserHasPermission } from '@/utils/apiClient'
import { Plus, Search, Package } from 'lucide-react'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchMaterials()
      .then((data) => {
        if (!isMounted) return
        const materialsData = Array.isArray(data) ? data : [];
        setMaterials(materialsData);
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Error fetching materials:', err);
        setError(err.message || 'Failed to load materials')
        setMaterials([]);
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper function to dynamically color stock levels
  const getStockColor = (qty) => {
    if (qty < 20) return 'text-red-700 font-semibold bg-red-50 ring-1 ring-inset ring-red-600/20';
    if (qty < 50) return 'text-amber-700 font-medium bg-amber-50 ring-1 ring-inset ring-amber-600/20';
    return 'text-emerald-700 font-medium bg-emerald-50 ring-1 ring-inset ring-emerald-600/20';
  };

  const filtered = materials.filter((m) => {
    const term = (search || '').toLowerCase()
    if (!term) return true
    return (
      (m.name || '').toLowerCase().includes(term) ||
      (m.category || '').toLowerCase().includes(term)
    )
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 mb-2">
                Inventory
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Raw Materials
              </h1>
              <p className="mt-2 text-gray-500 max-w-xl">
                Track stock levels for key materials used in production and manage reorder points.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:ring-emerald-500 w-full md:w-64"
                />
              </div>
              {currentUserHasPermission('material.create') && (
                <button
                  type="button"
                  onClick={() => navigate('/inventory/materials/new')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-emerald-500/40 transition-all"
                >
                  <Plus size={18} />
                  New Material
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Materials Table Card */}
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-500">Loading materials...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">ID</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Category</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Stock</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">UoM</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{m.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <Package size={16} />
                          </div>
                          <span className="font-medium text-gray-900">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-gray-100 text-gray-600 px-2.5 py-1 text-xs font-medium">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${getStockColor(m.current_stock)}`}>
                          {m.current_stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{m.uom}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/inventory/materials/${m.id}`)}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}