import React from 'react';

export default function QuotesPage() {
  const quotes = [
    {
      id: 'Q-9001',
      customer: 'Acme School',
      job: 'Opening Ceremony Banners',
      total: 450,
      status: 'Awaiting Approval',
    },
    { id: 'Q-9002', customer: 'Hope Church', job: 'Christmas Backdrop', total: 320, status: 'Approved' },
    {
      id: 'Q-9003',
      customer: 'Top Merch Ltd',
      job: 'Corporate Polo Branding',
      total: 1200,
      status: 'Converted to Order',
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">CRM</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Quotes</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Manage itemised estimates, deposits, SLAs, and artwork approvals before converting to live orders.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Open quotes</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">2</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Converted this month</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">1</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Total value open</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">$770</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Recent quotes</p>
          <select className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option>All statuses</option>
            <option>Awaiting approval</option>
            <option>Approved</option>
            <option>Converted</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Quote</th>
                <th className="px-3 py-2 font-medium text-gray-700">Customer</th>
                <th className="px-3 py-2 font-medium text-gray-700">Job</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                <th className="px-3 py-2 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{q.id}</td>
                  <td className="px-3 py-2 text-gray-800">{q.customer}</td>
                  <td className="px-3 py-2 text-gray-800">{q.job}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${q.total}</td>
                  <td className="px-3 py-2 text-gray-800">{q.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

