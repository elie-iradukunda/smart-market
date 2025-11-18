import React from 'react';
import { fetchDemoMaterials } from '../../api/apiClient';

export default function MaterialsPage() {
  const materials = fetchDemoMaterials();

  const lowStockCount = materials.filter(m => m.stockQty < 60).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Materials</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Raw materials, consumables, and garments used in TOP Design jobs. Keep an eye on low stock before it
          blocks production.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Active SKUs</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{materials.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Low stock alerts</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">{lowStockCount}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Key categories</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">3</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Material list</p>
          <input
            type="text"
            placeholder="Search by SKU or name"
            className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">SKU</th>
                <th className="px-3 py-2 font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 font-medium text-gray-700">Category</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Stock</th>
                <th className="px-3 py-2 font-medium text-gray-700">UoM</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(mat => (
                <tr key={mat.sku} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{mat.sku}</td>
                  <td className="px-3 py-2 text-gray-800">{mat.name}</td>
                  <td className="px-3 py-2 text-gray-800">{mat.category}</td>
                  <td className="px-3 py-2 text-right text-gray-800">{mat.stockQty}</td>
                  <td className="px-3 py-2 text-gray-800">{mat.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

