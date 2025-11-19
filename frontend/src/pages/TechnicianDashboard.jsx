import React from 'react';
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview';
import StockAlerts from '../modules/dashboards/components/StockAlerts';

export default function TechnicianDashboard() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Production floor</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Todays work</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          See which jobs are in each stage and which materials might slow you down so you can keep the presses
          running.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Jobs in production</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">7</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Due in next 4h</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">3</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Materials at risk</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">2</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <JobPipelineOverview />
        <StockAlerts />
      </div>
    </div>
  );
}

