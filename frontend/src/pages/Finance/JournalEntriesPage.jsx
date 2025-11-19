import React from 'react';

export default function JournalEntriesPage() {
  const journals = [
    { id: 'JE-3001', date: '2025-11-18', description: 'Invoice INV-2025-001', status: 'Posted' },
    { id: 'JE-3002', date: '2025-11-18', description: 'Payment PMT-5001', status: 'Posted' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Journal entries</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Double-entry postings behind invoices, payments, and adjustments. This view is mainly for accountants and
          auditors.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Entries</p>
          <input
            type="text"
            placeholder="Search by entry or description"
            className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Entry</th>
                <th className="px-3 py-2 font-medium text-gray-700">Date</th>
                <th className="px-3 py-2 font-medium text-gray-700">Description</th>
                <th className="px-3 py-2 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {journals.map(j => (
                <tr key={j.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{j.id}</td>
                  <td className="px-3 py-2 text-gray-800">{j.date}</td>
                  <td className="px-3 py-2 text-gray-800">{j.description}</td>
                  <td className="px-3 py-2 text-gray-800">{j.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

