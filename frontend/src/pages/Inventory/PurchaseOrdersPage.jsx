import React from 'react';

export default function PurchaseOrdersPage() {
  const purchaseOrders = [
    { id: 'PO-1001', supplier: 'PrintSupplies Ltd', total: 900, status: 'Awaiting Approval', eta: '2025-11-28' },
    { id: 'PO-1002', supplier: 'InkWorld', total: 450, status: 'Sent to Supplier', eta: '2025-11-30' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Purchase orders</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Stock replenishment for vinyl, ink, and garments. Use this view to track what is on the way and its
          financial impact.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Open POs</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{purchaseOrders.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Awaiting approval</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">1</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Sent to suppliers</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">1</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Purchase orders</p>
          <select className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option>All statuses</option>
            <option>Awaiting Approval</option>
            <option>Sent to Supplier</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">PO</th>
                <th className="px-3 py-2 font-medium text-gray-700">Supplier</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                <th className="px-3 py-2 font-medium text-gray-700">ETA</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map(po => (
                <tr key={po.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{po.id}</td>
                  <td className="px-3 py-2 text-gray-800">{po.supplier}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${po.total}</td>
                  <td className="px-3 py-2 text-gray-800">{po.status}</td>
                  <td className="px-3 py-2 text-gray-800">{po.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

