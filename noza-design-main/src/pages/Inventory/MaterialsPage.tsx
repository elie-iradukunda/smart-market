// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchMaterials } from '../../api/apiClient'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchMaterials()
      .then((data) => {
        if (!isMounted) return
        setMaterials(data || [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load materials')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper function to dynamically color stock levels (example logic)
  const getStockColor = (qty) => {
    if (qty < 20) return 'text-red-700 font-semibold bg-red-100/50';
    if (qty < 50) return 'text-amber-700 font-medium bg-amber-100/50';
    return 'text-green-700 font-medium';
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
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Inventory Management</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Raw <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Materials</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          Track stock levels for key materials used in production and manage reorder points.
        </p>
      </div>

      {/* Materials Table Card - Applying the clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-lg font-semibold text-gray-900">Current Stock</p>
          {/* Search Input - Cleaned up and uses primary focus color */}
          <input
            type="text"
            placeholder="Search by name or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                             focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
          />

        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading materials...</p>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">

            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  {/* Table Headers - Increased padding and clearer typography */}
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Stock</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">UoM</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-blue-50/50 transition duration-150 cursor-pointer">
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{m.id}</td>

                    <td className="px-6 py-3 text-gray-800 font-medium">{m.name}</td>
                    <td className="px-6 py-3 text-gray-600">
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-0.5 text-xs font-medium">
                        {m.category}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-right ${getStockColor(m.current_stock)}`}>
                      {m.current_stock}
                    </td>

                    <td className="px-6 py-3 text-gray-600">{m.uom}</td>
                    <td className="px-6 py-3 text-center">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        View / Edit
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
  )
}