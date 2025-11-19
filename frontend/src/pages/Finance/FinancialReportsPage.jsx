import React from 'react';
import ReportFilters from '../../modules/finance/components/ReportFilters';

export default function FinancialReportsPage() {
  const kpis = [
    { label: 'Monthly Revenue', value: '$12,500' },
    { label: 'Gross Margin', value: '58%' },
    { label: 'Outstanding AR', value: '$3,200' },
    { label: 'Cash at Bank', value: '$7,800' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          High-level financial KPIs for the management team. Use the filters to switch periods and report types.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <ReportFilters />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map(kpi => (
            <div
              key={kpi.label}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{kpi.label}</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

