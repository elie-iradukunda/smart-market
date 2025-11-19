import React from 'react';

export default function ReportFilters() {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Filters</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <label className="text-xs">
          <span className="block text-gray-700">From</span>
          <input
            type="date"
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
          />
        </label>
        <label className="text-xs">
          <span className="block text-gray-700">To</span>
          <input
            type="date"
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
          />
        </label>
        <label className="text-xs">
          <span className="block text-gray-700">Report</span>
          <select className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none">
            <option>P&amp;L</option>
            <option>Balance Sheet</option>
            <option>Cash Flow</option>
            <option>AR Aging</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            className="w-full rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

