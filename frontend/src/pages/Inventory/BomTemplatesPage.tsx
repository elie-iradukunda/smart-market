// @ts-nocheck
import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchBomTemplates } from '@/api/apiClient'
import { FileText, Search, Layers, PenTool } from 'lucide-react'

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
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBomTemplates()
      .then((data) => {
        setBoms(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filtered = boms.filter(bom =>
    (bom.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (bom.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 mb-2">
                Production
              </div>
              <h1 className="text-3xl font-bold text-gray-900">BOM Templates</h1>
              <p className="mt-2 text-gray-500 max-w-xl">
                Standard recipes for common TOP Design products. Use these templates to generate consistent job costing
                and material requirements.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-blue-500 w-full md:w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-500">Loading templates...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Code</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Description</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Materials</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(bom => (
                    <tr key={bom.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4 text-gray-900 font-mono text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <Layers size={14} className="text-gray-400" />
                          {bom.code}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{bom.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={bom.description}>
                        {bom.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={bom.materials}>
                        {bom.materials || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 ml-auto">
                          <PenTool size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-sm font-medium">No BOM templates found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
