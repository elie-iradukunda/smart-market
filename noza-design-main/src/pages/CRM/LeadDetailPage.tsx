// @ts-nocheck
import React from 'react'

export default function LeadDetailPage() {
  const lead = {
    id: 'L-1001',
    name: 'Acme School Banner',
    channel: 'WhatsApp',
    status: 'New',
    owner: 'Reception - Mary',
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Lead</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{lead.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{lead.channel} • {lead.id}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Owner</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{lead.owner}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{lead.status}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
