// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchMaterials, setMaterialPrice } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { currentUserHasPermission } from '@/utils/apiClient'
import { DollarSign, Search, Package, Check, X } from 'lucide-react'
import { toast } from 'react-toastify'

export default function MaterialPricingPage() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ price_per_metre: '', is_sellable: false })

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchMaterials()
      .then((data) => {
        if (!isMounted) return
        setMaterials(Array.isArray(data) ? data : [])
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

  const handleEdit = (material) => {
    setEditingId(material.id)
    setEditForm({
      price_per_metre: material.price_per_metre || '',
      is_sellable: material.is_sellable || false
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({ price_per_metre: '', is_sellable: false })
  }

  const handleSave = async (materialId) => {
    try {
      const price = parseFloat(editForm.price_per_metre)
      if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid price')
        return
      }

      await setMaterialPrice(materialId, price, editForm.is_sellable)
      toast.success('Material price updated successfully')
      
      // Refresh materials
      const updated = await fetchMaterials()
      setMaterials(Array.isArray(updated) ? updated : [])
      setEditingId(null)
      setEditForm({ price_per_metre: '', is_sellable: false })
    } catch (err) {
      toast.error(err.message || 'Failed to update material price')
    }
  }

  const filtered = materials.filter((m) => {
    const term = (search || '').toLowerCase()
    if (!term) return true
    return (
      (m.name || '').toLowerCase().includes(term) ||
      (m.category || '').toLowerCase().includes(term)
    )
  })

  if (!currentUserHasPermission('material.manage')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to manage material pricing.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 mb-2">
                Inventory
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Material Pricing</h1>
              <p className="mt-2 text-gray-500 max-w-xl">
                Set price per metre for materials that can be sold (e.g., banners, vinyl rolls).
              </p>
            </div>

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
          </div>
        </div>

        {/* Materials Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">Loading materials...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {materials.length === 0 
                ? 'No materials found in the system. Please create materials first.' 
                : 'No materials match your search criteria.'}
            </p>
            {materials.length === 0 && (
              <button
                onClick={() => window.location.href = '/inventory/materials'}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Go to Materials
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Metre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sellable</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{material.name}</div>
                        {material.category && (
                          <div className="text-sm text-gray-500">{material.category}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {material.unit || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === material.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">RWF</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editForm.price_per_metre}
                              onChange={(e) => setEditForm({ ...editForm, price_per_metre: e.target.value })}
                              className="w-32 px-3 py-1.5 rounded-lg border-2 border-emerald-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                              placeholder="0.00"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {material.price_per_metre ? `RWF ${parseFloat(material.price_per_metre).toLocaleString()}` : <span className="text-gray-400 italic">Not set</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === material.id ? (
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.is_sellable}
                              onChange={(e) => setEditForm({ ...editForm, is_sellable: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">Mark as sellable</span>
                          </label>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            material.is_sellable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {material.is_sellable ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === material.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(material.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
                              title="Save"
                            >
                              <Check className="h-4 w-4" />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(material)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                            title="Set Price"
                          >
                            <DollarSign className="h-4 w-4" />
                            Set Price
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

