import React from 'react';

export default function RevenueOverview() {
  const metrics = [
    { label: 'Today Revenue', value: '$1,250', trend: '+8.4%' },
    { label: 'This Month', value: '$12,500', trend: '+14.2%' },
    { label: 'Unpaid Invoices', value: '$3,200', trend: '-3.1%' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Revenue Overview</h2>
        <span className="text-[11px] text-gray-500">Last 30 days</span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {metrics.map(m => (
          <div key={m.label} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{m.label}</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{m.value}</p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600">{m.trend} vs. last period</p>
          </div>
        ))}
      </div>
    </div>
  );
}

