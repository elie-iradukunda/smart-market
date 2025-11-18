import React from 'react';
import { fetchDemoLeads } from '../../api/apiClient';

export default function LeadsPage() {
  const leads = fetchDemoLeads();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Hero + filters */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">CRM</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Leads inbox</h1>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">
              Capture and qualify walk-in, WhatsApp, Instagram, Facebook, and website leads in one place.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <button className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
              All channels
            </button>
            <button className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
              Hot leads
            </button>
            <button className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
              Needs follow-up
            </button>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 shadow-sm relative">
          <img
            src="https://images.pexels.com/photos/1181555/pexels-photo-1181555.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Customer communications on laptop and phone"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-300">Conversations</p>
            <p className="mt-1 text-sm text-gray-100 max-w-xs">
              See every enquiry with its latest status so no opportunity is forgotten.
            </p>
          </div>
        </div>
      </div>

      {/* Leads table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">All leads</p>
          <input
            type="text"
            placeholder="Search by name, company, or channel"
            className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">ID</th>
                <th className="px-3 py-2 font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 font-medium text-gray-700">Channel</th>
                <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                <th className="px-3 py-2 font-medium text-gray-700">Owner</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{lead.id}</td>
                  <td className="px-3 py-2 text-gray-800">{lead.name}</td>
                  <td className="px-3 py-2 text-gray-800">{lead.channel}</td>
                  <td className="px-3 py-2 text-gray-800">{lead.status}</td>
                  <td className="px-3 py-2 text-gray-800">{lead.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

