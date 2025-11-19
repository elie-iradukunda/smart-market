import React from 'react';

export default function ReorderSuggestionList() {
  const suggestions = [
    { sku: 'VINYL-3M-GLOSS', name: '3m Glossy Vinyl', reason: 'Forecasted spike for school opening', recommendedQty: 80 },
    { sku: 'TSHIRT-M-BLACK', name: 'T-Shirt Black M', reason: 'Low stock vs. historical demand', recommendedQty: 40 },
  ];

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Reorder Suggestions</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">SKU</th>
              <th className="px-3 py-2 font-medium text-gray-700">Name</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Recommended Qty</th>
              <th className="px-3 py-2 font-medium text-gray-700">Reason</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map(s => (
              <tr key={s.sku} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{s.sku}</td>
                <td className="px-3 py-2 text-gray-800">{s.name}</td>
                <td className="px-3 py-2 text-right text-gray-800">{s.recommendedQty}</td>
                <td className="px-3 py-2 text-gray-800">{s.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

