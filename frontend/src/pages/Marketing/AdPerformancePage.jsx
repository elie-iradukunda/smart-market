import React from 'react';
import AdPerformanceChart from '../../modules/marketing/components/AdPerformanceChart';

export default function AdPerformancePage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Marketing</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Ad performance</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          High-level KPIs from Meta, X, and other paid channels. Use this to see which campaigns generate
          profitable jobs.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <AdPerformanceChart />
      </div>
    </div>
  );
}

