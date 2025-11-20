// @ts-nocheck
import React from 'react'

export default function BomTemplatesPage() {
  const boms = [
    { id: 'BOM-BANNER-3M', name: 'PVC Banner 3m x 1m', materials: 'Vinyl, Ink, Eyelets', version: 'v1' },
    { id: 'BOM-TSHIRT-VINYL', name: 'T-Shirt Vinyl Print', materials: 'T-Shirt, Vinyl, Ink', version: 'v2' },
  ]

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">BOM templates</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Standard recipes for common TOP Design products. Use these templates to generate consistent job costing
          and material requirements.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Code</th>
                <th className="px-3 py-2 font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 font-medium text-gray-700">Materials</th>
                <th className="px-3 py-2 font-medium text-gray-700">Version</th>
              </tr>
            </thead>
            <tbody>
              {boms.map(bom => (
                <tr key={bom.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{bom.id}</td>
                  <td className="px-3 py-2 text-gray-800">{bom.name}</td>
                  <td className="px-3 py-2 text-gray-800">{bom.materials}</td>
                  <td className="px-3 py-2 text-gray-800">{bom.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
