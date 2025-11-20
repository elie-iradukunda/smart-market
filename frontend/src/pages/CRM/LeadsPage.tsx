// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchDemoLeads } from '../../api/apiClient'

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchDemoLeads()
      .then((data) => {
        if (!isMounted) return
        setLeads(data || [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load leads')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hot':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Qualified':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Main Header Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
        
        {/* Leads Inbox Header Card - Using the new, cleaner card style */}
        <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">Customer Relationship Management</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Leads Inbox</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 max-w-xl">
              Capture and qualify walk-in, digital, and communication leads in a single unified view.
            </p>
          </div>
          
          {/* Action/Filter Buttons - Enhanced for a cleaner look */}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <button className="rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 font-medium text-blue-800 shadow-sm hover:bg-blue-100 transition duration-150">
              All channels (120)
            </button>
            <button className="rounded-full border border-gray-200 bg-gray-50/70 px-4 py-1.5 font-medium text-gray-700 hover:bg-gray-100 transition duration-150">
              Hot leads (15)
            </button>
            <button className="rounded-full border border-gray-200 bg-gray-50/70 px-4 py-1.5 font-medium text-gray-700 hover:bg-gray-100 transition duration-150">
              Needs follow-up (3)
            </button>
            <button className="rounded-full border border-gray-200 bg-gray-50/70 px-4 py-1.5 font-medium text-gray-700 hover:bg-gray-100 transition duration-150">
              Add New Lead
            </button>
          </div>
        </div>
        
        {/* Image Card - Retaining dark, high-contrast style but matching new rounded corners */}
        <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
          <img
            src="https://images.pexels.com/photos/1181555/pexels-photo-1181555.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Customer communications on laptop and phone"
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <p className="text-sm font-medium uppercase tracking-wider text-purple-300">Live Communications</p>
            <p className="mt-2 text-base text-gray-100 max-w-xs">
              See every enquiry with its latest status so no opportunity is forgotten.
            </p>
          </div>
        </div>
      </div>

      {/* Leads Table Card - Applying the clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-lg font-semibold text-gray-900">Recent Leads</p>
          {/* Search Input - Cleaned up and uses primary focus color */}
          <input
            type="text"
            placeholder="Search by name, company, or channel"
            // Professional input styling
            className="w-full sm:max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                       focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition duration-150"
          />
        </div>
        
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading leads...</p>
        ) : (
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                {/* Table Headers - Increased padding and clearer typography */}
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Name / Company</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-blue-50/50 transition duration-150 cursor-pointer">
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{lead.id}</td>
                  <td className="px-6 py-3 text-gray-800 font-medium">{lead.name}</td>
                  <td className="px-6 py-3 text-gray-600">
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-0.5 text-xs font-medium">
                      {lead.channel}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {/* Status Tag - Dynamically colored tag */}
                    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{lead.owner}</td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}