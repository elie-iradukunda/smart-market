import React from 'react';

export default function PaymentsPage() {
  const payments = [
    { id: 'PMT-5001', invoiceId: 'INV-2025-001', method: 'Mobile Money', amount: 225, date: '2025-11-18' },
    { id: 'PMT-5002', invoiceId: 'INV-2025-002', method: 'Cash', amount: 320, date: '2025-11-17' },
  ];

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Payments</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Recorded payments from cash, mobile money, and bank. Use this view to reconcile invoices with money
          received.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Transactions</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{payments.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Total received</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">${totalReceived}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Payment methods</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">3</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <p className="text-sm font-medium text-gray-900">Payment list</p>
          <div className="flex flex-wrap gap-2">
            <select className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>All methods</option>
              <option>Cash</option>
              <option>Mobile Money</option>
              <option>Bank</option>
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
                <th className="px-3 py-2 font-medium text-gray-700">Payment</th>
                <th className="px-3 py-2 font-medium text-gray-700">Invoice</th>
                <th className="px-3 py-2 font-medium text-gray-700">Method</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Amount</th>
                <th className="px-3 py-2 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(pmt => (
                <tr key={pmt.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{pmt.id}</td>
                  <td className="px-3 py-2 text-gray-800">{pmt.invoiceId}</td>
                  <td className="px-3 py-2 text-gray-800">{pmt.method}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${pmt.amount}</td>
                  <td className="px-3 py-2 text-gray-800">{pmt.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

