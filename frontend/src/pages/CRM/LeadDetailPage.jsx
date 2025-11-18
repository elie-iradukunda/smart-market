import React from 'react';

export default function LeadDetailPage() {
  const lead = {
    id: 'L-1002',
    name: 'Corporate Polo Shirts',
    company: 'Top Merch Ltd',
    channel: 'Instagram',
    status: 'Contacted',
    owner: 'Reception - John',
    estimatedValue: 1200,
    nextStep: 'Send artwork proof and confirm sizes',
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Lead detail</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{lead.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{lead.company} • {lead.channel}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{lead.status}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Owner</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{lead.owner}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Estimated value</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${lead.estimatedValue}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Lead ID</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{lead.id}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-start">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
          <h2 className="text-base font-semibold text-gray-900">Next step</h2>
          <p className="text-gray-700">{lead.nextStep}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">Send quote</span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">Request artwork</span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">Schedule follow-up</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-sm">
          <h2 className="text-base font-semibold text-gray-900">Contact details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Company</dt>
              <dd className="text-gray-900">{lead.company}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Channel</dt>
              <dd className="text-gray-900">{lead.channel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Owner</dt>
              <dd className="text-gray-900">{lead.owner}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

