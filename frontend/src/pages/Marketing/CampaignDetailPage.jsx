import React from 'react';

export default function CampaignDetailPage() {
  const campaign = {
    id: 'CMP-BACK2SCHOOL',
    name: 'Back to School Banners',
    channel: 'Facebook/Instagram',
    status: 'Active',
    dailyBudget: 25,
    objective: 'Lead Generation',
    audience: 'Parents, teachers, schools within 15km',
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Campaign</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{campaign.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{campaign.channel} • {campaign.id}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{campaign.status}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Objective</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{campaign.objective}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Daily budget</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${campaign.dailyBudget}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
        <h2 className="text-base font-semibold text-gray-900">Audience</h2>
        <p className="text-gray-700">{campaign.audience}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-gray-700">
          <li>Focus on local schools and parent audiences.</li>
          <li>Optimise creatives for mobile placements.</li>
          <li>Use lead forms or WhatsApp click-to-chat for quick follow-up.</li>
        </ul>
      </section>
    </div>
  );
}

