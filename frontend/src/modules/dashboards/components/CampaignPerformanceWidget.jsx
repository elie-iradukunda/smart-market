import React from 'react';

export default function CampaignPerformanceWidget() {
  const campaigns = [
    { name: 'Back to School', channel: 'Facebook / Instagram', roas: '4.2x' },
    { name: 'Christmas Promo', channel: 'WhatsApp Broadcast', roas: '3.1x' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Campaign Performance</h2>
        <span className="text-[11px] text-gray-500">Active campaigns</span>
      </div>
      <div className="mt-4 space-y-3">
        {campaigns.map(cmp => (
          <div
            key={cmp.name}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{cmp.name}</p>
              <p className="text-[11px] text-gray-600">{cmp.channel}</p>
            </div>
            <p className="text-xs font-semibold text-emerald-700">ROAS {cmp.roas}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

