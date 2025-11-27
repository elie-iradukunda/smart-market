// @ts-nocheck
import React, { useEffect, useState } from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchMaterial, createMaterial, updateMaterial, deleteMaterial } from '../../api/apiClient'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import { getAuthUser } from '@/utils/apiClient'

export default function MaterialDetailPage() {
  const { sku } = useParams()
  const navigate = useNavigate()
  const isNew = sku === 'new'
  const [material, setMaterial] = useState<any | null>(null)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')
  const [reorderLevel, setReorderLevel] = useState<number | string>('')
  const [currentStock, setCurrentStock] = useState<number | string>('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sku || isNew) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchMaterial(sku)
      .then((data) => {
        if (!isMounted) return
        setMaterial(data)
        setName(data.name || '')
        setUnit(data.unit || '')
        setCategory(data.category || '')
        setReorderLevel(data.reorder_level ?? '')
        setCurrentStock(data.current_stock ?? '')
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load material')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [sku, isNew])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name,
        unit,
        category,
        reorder_level: reorderLevel === '' ? null : Number(reorderLevel),
      }
      if (isNew) {
        const created = await createMaterial(payload)
        navigate(`/inventory/materials/${created.id}`)
      } else {
        await updateMaterial(sku!, payload)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save material')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (isNew || !sku) return
    if (!window.confirm('Delete this material? This cannot be undone.')) return
    setSaving(true)
    setError(null)
    try {
      await deleteMaterial(sku)
      navigate('/inventory/materials')
    } catch (err: any) {
      setError(err.message || 'Failed to delete material')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {(() => {
        const user = getAuthUser()
        const isOwner = user?.role_id === 1
        if (isOwner) return <OwnerTopNav />
        return <InventoryTopNav />
      })()}

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <OwnerSideNav />

          <main className="flex-1 space-y-6 max-w-4xl mx-auto">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Material</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
            {isNew ? 'New material' : loading ? 'Loading...' : material?.name || 'Material'}
          </h1>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder level</label>
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {!isNew && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current stock</label>
                <input
                  type="number"
                  value={currentStock}
                  readOnly
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isNew ? 'Create material' : 'Save changes'}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Delete material
              </button>
            )}
          </div>
        </form>
      </div>
          </main>
        </div>
      </div>
    </div>
  )
}
