import React from 'react';
import { fetchDemoCampaigns } from '../../api/apiClient';

export default function CampaignsPage() {
  const campaigns = fetchDemoCampaigns();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Marketing</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Campaigns</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Paid and organic campaigns across Meta, X, and WhatsApp. See which campaigns are live and how much they
          are spending.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <p className="text-sm font-medium text-gray-900">Campaign list</p>
          <div className="flex flex-wrap gap-2">
            <select className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option>All statuses</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
            <input
              type="text"
              placeholder="Search by name or channel"
              className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Code</th>
                <th className="px-3 py-2 font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 font-medium text-gray-700">Channel</th>
                <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Budget</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(cmp => (
                <tr key={cmp.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{cmp.id}</td>
                  <td className="px-3 py-2 text-gray-800">{cmp.name}</td>
                  <td className="px-3 py-2 text-gray-800">{cmp.channel}</td>
                  <td className="px-3 py-2 text-gray-800">{cmp.status}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${cmp.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

