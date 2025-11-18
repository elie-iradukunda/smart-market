import React from 'react';

export default function PurchaseOrderDetailPage() {
  const po = {
    id: 'PO-1001',
    supplier: 'PrintSupplies Ltd',
    status: 'Awaiting Approval',
    eta: '2025-11-28',
  };

  const lines = [
    { id: 1, sku: 'VINYL-3M-GLOSS', description: '3m Glossy Vinyl', qty: 100, uom: 'm', unitCost: 4.5 },
    { id: 2, sku: 'INK-CMYK-1L', description: 'Solvent Ink CMYK 1L Set', qty: 5, uom: 'set', unitCost: 60 },
  ];

  const total = lines.reduce((sum, l) => sum + l.qty * l.unitCost, 0);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Purchase order</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{po.id}</h1>
          <p className="mt-2 text-sm text-gray-600">{po.supplier}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{po.status}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">ETA</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{po.eta}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Total value</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${total}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-sm space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Lines</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">SKU</th>
                <th className="px-3 py-2 font-medium text-gray-700">Description</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Qty</th>
                <th className="px-3 py-2 font-medium text-gray-700">UoM</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Unit cost</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Line total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <tr key={line.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{line.sku}</td>
                  <td className="px-3 py-2 text-gray-800">{line.description}</td>
                  <td className="px-3 py-2 text-right text-gray-800">{line.qty}</td>
                  <td className="px-3 py-2 text-gray-800">{line.uom}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${line.unitCost}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${line.qty * line.unitCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-right text-sm font-medium text-gray-900">Total: ${total}</p>
      </section>
    </div>
  );
}

