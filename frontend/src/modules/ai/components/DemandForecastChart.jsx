import React from 'react';

export default function DemandForecastChart({ data }) {
  const rows = data || [];

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Demand Forecast by Category</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Category</th>
              <th className="px-3 py-2 font-medium text-gray-700">Month</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Expected Jobs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={`${row.category}-${row.month}`} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{row.category}</td>
                <td className="px-3 py-2 text-gray-800">{row.month}</td>
                <td className="px-3 py-2 text-right text-gray-800">{row.expectedJobs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

