// @ts-nocheck
import React, { useState, useEffect } from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import { fetchBomTemplates } from '@/api/apiClient'

interface BomTemplate {
  id: number
  code: string
  name: string
  description: string
  materials: string
  created_at: string
}

export default function BomTemplatesPage() {
  const [boms, setBoms] = useState<BomTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBomTemplates()
      .then((data) => {
        setBoms(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InventoryTopNav />
        <OwnerTopNav />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Loading BOM templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InventoryTopNav />
        <OwnerTopNav />
        <div className="flex items-center justify-center py-20">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryTopNav />
      <OwnerTopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Inventory</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">BOM templates</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Standard recipes for common TOP Design products. Use these templates to generate consistent job costing
          and material requirements.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Templates</p>
          <input
            type="text"
            placeholder="Search by code or name"
            className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-indigo-50/80 border-b border-indigo-200">
              <tr>
                <th className="px-3 py-2 font-semibold text-indigo-700 uppercase tracking-wider">Code</th>
                <th className="px-3 py-2 font-semibold text-indigo-700 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 font-semibold text-indigo-700 uppercase tracking-wider">Description</th>
                <th className="px-3 py-2 font-semibold text-indigo-700 uppercase tracking-wider">Materials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {boms.map(bom => (
                <tr key={bom.id} className="bg-white hover:bg-blue-50/50">
                  <td className="px-3 py-2 text-slate-800 font-mono">{bom.code}</td>
                  <td className="px-3 py-2 text-slate-900 font-medium">{bom.name}</td>
                  <td className="px-3 py-2 text-slate-700">{bom.description || '-'}</td>
                  <td className="px-3 py-2 text-slate-700">{bom.materials || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}
