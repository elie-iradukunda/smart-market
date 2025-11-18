import React from 'react';
import RevenueOverview from '../modules/dashboards/components/RevenueOverview';
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview';
import StockAlerts from '../modules/dashboards/components/StockAlerts';
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget';

export default function AdminDashboard() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Hero header */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-stretch">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Admin overview</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">
              Good afternoon, TOP Design
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Monitor revenue, production load, stock risk, and marketing performance in a single control center.
            </p>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <dt className="text-gray-500">Open work orders</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">13</dd>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <dt className="text-gray-500">Invoices unpaid</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">$3,200</dd>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <dt className="text-gray-500">Materials at risk</dt>
              <dd className="mt-1 text-lg font-semibold text-amber-700">2</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-sm relative">
          <img
            src="https://images.pexels.com/photos/6476584/pexels-photo-6476584.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Large format printing workshop"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-300">Live operations snapshot</p>
            <p className="mt-1 text-sm text-gray-100 max-w-xs">
              Get instant visibility on your print shop status and act before bottlenecks appear.
            </p>
          </div>
        </div>
      </div>

      {/* Main widgets layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <RevenueOverview />
          <JobPipelineOverview />
        </div>
        <div className="space-y-6">
          <StockAlerts />
          <CampaignPerformanceWidget />
        </div>
      </div>
    </div>
  );
}

