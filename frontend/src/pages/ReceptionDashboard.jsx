import React from 'react';
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview';
import RevenueOverview from '../modules/dashboards/components/RevenueOverview';

export default function ReceptionDashboard() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Front desk</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Today at a glance</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          See all incoming leads, open jobs, and expected payments so you can greet customers with confidence.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">New leads today</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">6</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Jobs due today</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">5</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Payments expected</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">$920</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <JobPipelineOverview />
        <RevenueOverview />
      </div>
    </div>
  );
}

