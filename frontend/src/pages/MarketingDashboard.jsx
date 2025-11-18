import React from 'react';
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget';
import RevenueOverview from '../modules/dashboards/components/RevenueOverview';

export default function MarketingDashboard() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,1.4fr] items-stretch">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">Marketing performance</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Grow repeat orders</h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Track campaigns, channels, and revenue impact so you can double down on what actually brings jobs
              into the shop.
            </p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <p className="text-gray-500">Active campaigns</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">4</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <p className="text-gray-500">Avg. ROAS</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">3.6x</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <p className="text-gray-500">New leads this week</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">27</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-sm relative">
          <img
            src="https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Marketing dashboard screens"
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-pink-300">Campaign insights</p>
            <p className="mt-1 text-sm text-gray-100 max-w-xs">
              See which audiences and creatives generate the most profitable print jobs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <CampaignPerformanceWidget />
        <RevenueOverview />
      </div>
    </div>
  );
}

