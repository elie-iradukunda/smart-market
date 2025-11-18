import React from 'react';

export default function AccountsPage() {
  const accounts = [
    { code: '1000', name: 'Cash at Hand', type: 'Asset' },
    { code: '1100', name: 'Bank Account', type: 'Asset' },
    { code: '1200', name: 'Accounts Receivable', type: 'Asset' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability' },
    { code: '4000', name: 'Sales Revenue', type: 'Income' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Chart of accounts</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Base accounts used for postings and reports. This structure underpins all financial statements.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Accounts</p>
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
                <th className="px-3 py-2 font-medium text-gray-700">Type</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.code} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{acc.code}</td>
                  <td className="px-3 py-2 text-gray-800">{acc.name}</td>
                  <td className="px-3 py-2 text-gray-800">{acc.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

