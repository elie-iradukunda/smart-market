import React from 'react';

export default function PriceRecommendationWidget({ data }) {
  const rows = data || [];

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Price Recommendations</h2>
      <div className="mt-3 space-y-2">
        {rows.map(row => (
          <div key={row.item} className="rounded border border-gray-100 bg-gray-50 p-2">
            <p className="text-gray-800">{row.item}</p>
            <p className="text-xs text-gray-600">
              Current: ${row.currentPrice} · Suggested: ${row.suggestedPrice}
            </p>
            <p className="text-xs text-gray-500 mt-1">{row.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

