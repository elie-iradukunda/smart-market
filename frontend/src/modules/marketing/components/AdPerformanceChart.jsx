import React from 'react';

export default function AdPerformanceChart() {
  const rows = [
    { channel: 'Facebook/Instagram', impressions: 12000, clicks: 620, ctr: '5.2%' },
    { channel: 'WhatsApp Broadcast', impressions: 800, clicks: 140, ctr: '17.5%' },
    { channel: 'X (Twitter)', impressions: 3000, clicks: 90, ctr: '3.0%' },
  ];

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Channel Performance</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Channel</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Impressions</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Clicks</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">CTR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.channel} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{row.channel}</td>
                <td className="px-3 py-2 text-right text-gray-800">{row.impressions}</td>
                <td className="px-3 py-2 text-right text-gray-800">{row.clicks}</td>
                <td className="px-3 py-2 text-right text-gray-800">{row.ctr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

