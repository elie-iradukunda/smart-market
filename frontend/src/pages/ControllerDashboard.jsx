import React from 'react';
import StockAlerts from '../modules/dashboards/components/StockAlerts';
import RevenueOverview from '../modules/dashboards/components/RevenueOverview';

export default function ControllerDashboard() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">Operations control</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Inventory & margin</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Keep an eye on low-stock materials and the revenue they support so you can plan purchasing with
          confidence.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Materials at risk</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">2</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Open POs</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">5</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Stock value</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">$24,300</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <StockAlerts />
        <RevenueOverview />
      </div>
    </div>
  );
}

