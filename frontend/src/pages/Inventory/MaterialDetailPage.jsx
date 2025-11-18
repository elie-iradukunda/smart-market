import React from 'react';

export default function MaterialDetailPage() {
  const material = {
    sku: 'VINYL-3M-GLOSS',
    name: '3m Glossy Vinyl',
    category: 'Vinyl',
    stockQty: 120,
    uom: 'm',
    reorderPoint: 60,
    supplier: 'PrintSupplies Ltd',
  };

  const isLow = material.stockQty <= material.reorderPoint;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Material</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{material.name}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {material.category} • SKU {material.sku}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">On hand</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {material.stockQty} {material.uom}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Reorder point</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {material.reorderPoint} {material.uom}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-start">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
          <h2 className="text-base font-semibold text-gray-900">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">SKU</dt>
              <dd className="text-gray-900">{material.sku}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Category</dt>
              <dd className="text-gray-900">{material.category}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Unit of measure</dt>
              <dd className="text-gray-900">{material.uom}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Supplier</dt>
              <dd className="text-gray-900">{material.supplier}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
          <h2 className="text-base font-semibold text-gray-900">Stock summary</h2>
          <p className="text-gray-700">
            This panel helps the controller decide when to raise a purchase order so production never runs out of key
            materials.
          </p>
          <p className={`mt-1 text-sm font-semibold ${isLow ? 'text-amber-700' : 'text-emerald-700'}`}>
            {isLow ? 'Stock is at or below the reorder point.' : 'Stock is comfortably above the reorder point.'}
          </p>
        </section>
      </div>
    </div>
  );
}

