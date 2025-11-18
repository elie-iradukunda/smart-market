import React from 'react';
import RevenueOverview from '../modules/dashboards/components/RevenueOverview';

export default function AccountantDashboard() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Cash & Profitability</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Monitor revenue, open receivables, payables, and cash at bank so you always know the health of the
          business.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Outstanding AR</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">$3,200</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Outstanding AP</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">$1,450</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Cash at Bank</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">$7,800</p>
          </div>
        </div>
      </div>

      <RevenueOverview />
    </div>
  );
}

