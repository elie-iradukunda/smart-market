import React from 'react';

export default function PosSalesHistoryPage() {
  const sales = [
    { id: 'POS-2001', customer: 'Walk-in', total: 80, paymentMethod: 'Cash', date: '2025-11-18' },
    { id: 'POS-2002', customer: 'Walk-in', total: 45, paymentMethod: 'Mobile Money', date: '2025-11-18' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">POS</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Sales history</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Recent counter transactions for reconciliation and daily closing. Filter by payment method and date.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <p className="text-sm font-medium text-gray-900">Transactions</p>
          <div className="flex flex-wrap gap-2">
            <select className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>All payment methods</option>
              <option>Cash</option>
              <option>Mobile Money</option>
              <option>Card</option>
            </select>
            <input
              type="date"
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Receipt</th>
                <th className="px-3 py-2 font-medium text-gray-700">Customer</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                <th className="px-3 py-2 font-medium text-gray-700">Payment</th>
                <th className="px-3 py-2 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{sale.id}</td>
                  <td className="px-3 py-2 text-gray-800">{sale.customer}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${sale.total}</td>
                  <td className="px-3 py-2 text-gray-800">{sale.paymentMethod}</td>
                  <td className="px-3 py-2 text-gray-800">{sale.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

