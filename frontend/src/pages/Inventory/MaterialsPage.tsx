// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMaterials } from '../../api/apiClient'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ControllerTopNav from '@/components/layout/ControllerTopNav'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import TechnicianTopNav from '@/components/layout/TechnicianTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import { getAuthUser, currentUserHasPermission } from '@/utils/apiClient'

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
        // Ensure data is an array, default to empty array if not
        const materialsData = Array.isArray(data) ? data : [];
        setMaterials(materialsData);
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Error fetching materials:', err);
        setError(err.message || 'Failed to load materials')
        setMaterials([]); // Ensure materials is always an array
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const user = getAuthUser()
  const isController = user?.role_id === 4
  const isTechnician = user?.role_id === 7
  const isOwner = user?.role_id === 1

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
    <div className="min-h-screen bg-gray-50">
      {/* Owner sees only OwnerTopNav; technicians see TechnicianTopNav; others see InventoryTopNav */}
      {isOwner ? <OwnerTopNav /> : isTechnician ? <TechnicianTopNav /> : <InventoryTopNav />}

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <OwnerSideNav />

          <main className="flex-1 space-y-6 max-w-6xl mx-auto">

            {/* Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Inventory Management</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
                Raw <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Materials</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 max-w-xl">
                Track stock levels for key materials used in production and manage reorder points.
              </p>
            </div>

            {/* Materials Table Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                <p className="text-lg font-semibold text-slate-900">Current Stock</p>

                <div className="flex w-full sm:w-auto gap-2">
                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="Search by name or category"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 
                                   focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition duration-150"
                  />

                  {currentUserHasPermission('material.create') && (
                    <button
                      type="button"
                      onClick={() => navigate('/inventory/materials/new')}
                      className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                    >
                      + New material
                    </button>
                  )}
                </div>

              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>
              )}
              {loading ? (
                <p className="text-sm text-slate-500 py-4">Loading materials...</p>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:mx-0">

                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-indigo-50/80 border-b border-indigo-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">ID</th>
                        <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Name</th>
                        <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Category</th>
                        <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs text-right">Stock</th>
                        <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">UoM</th>
                        <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(m => (
                        <tr key={m.id} className="hover:bg-blue-50/50 transition duration-150 cursor-pointer">
                          <td className="px-6 py-3 text-slate-500 font-mono text-xs">{m.id}</td>

                          <td className="px-6 py-3 text-slate-900 font-medium">{m.name}</td>
                          <td className="px-6 py-3 text-slate-700">
                            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-0.5 text-xs font-medium">
                              {m.category}
                            </span>
                          </td>
                          <td className={`px-6 py-3 text-right ${getStockColor(m.current_stock)}`}>
                            {m.current_stock}
                          </td>

                          <td className="px-6 py-3 text-slate-700">{m.uom}</td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => navigate(`/inventory/materials/${m.id}`)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
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
          </main>
        </div>
      </div>
    </div>
  )
}