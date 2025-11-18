import React from 'react';

export default function JournalEntryDetailPage() {
  const journal = {
    id: 'JE-3001',
    date: '2025-11-18',
    description: 'Invoice INV-2025-001',
  };

  const lines = [
    { id: 1, account: 'Accounts Receivable', debit: 450, credit: 0 },
    { id: 2, account: 'Sales Revenue', debit: 0, credit: 381.36 },
    { id: 3, account: 'VAT Payable', debit: 0, credit: 68.64 },
  ];

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Journal entry</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{journal.id}</h1>
          <p className="mt-2 text-sm text-gray-600">{journal.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{journal.date}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Total debit / credit</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {totalDebit} / {totalCredit}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-sm space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Lines</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Account</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Debit</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Credit</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <tr key={line.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{line.account}</td>
                  <td className="px-3 py-2 text-right text-gray-800">{line.debit || ''}</td>
                  <td className="px-3 py-2 text-right text-gray-800">{line.credit || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 space-y-1 text-right text-sm">
          <p className="text-gray-700">Total Debit: {totalDebit}</p>
          <p className="text-gray-700">Total Credit: {totalCredit}</p>
        </div>
      </section>
    </div>
  );
}

