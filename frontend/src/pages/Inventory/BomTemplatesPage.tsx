// @ts-nocheck
import React from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'

export default function BomTemplatesPage() {
  const boms = [
    { id: 'BOM-BANNER-3M', name: 'PVC Banner 3m x 1m', materials: 'Vinyl, Ink, Eyelets', version: 'v1' },
    { id: 'BOM-TSHIRT-VINYL', name: 'T-Shirt Vinyl Print', materials: 'T-Shirt, Vinyl, Ink', version: 'v2' },
  ]

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
                <th className="px-3 py-2 font-semibold text-indigo-700 uppercase tracking-wider">Materials</th>
                <th className="px-3 py-2 font-semibold text-indigo-700 uppercase tracking-wider">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {boms.map(bom => (
                <tr key={bom.id} className="bg-white hover:bg-blue-50/50">
                  <td className="px-3 py-2 text-slate-800 font-mono">{bom.id}</td>
                  <td className="px-3 py-2 text-slate-900 font-medium">{bom.name}</td>
                  <td className="px-3 py-2 text-slate-700">{bom.materials}</td>
                  <td className="px-3 py-2 text-slate-700">{bom.version}</td>
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
