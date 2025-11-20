// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCampaigns } from '../../api/apiClient'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchCampaigns()
      .then((data) => {
        if (!isMounted) return
        setCampaigns(data || [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load campaigns')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper function to dynamically color status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Paused':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">Marketing & Outreach</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Campaigns</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          Paid and organic campaigns across Meta, X, and WhatsApp. See which campaigns are live and how much they are spending.
        </p>
      </div>

      {/* Campaigns Table Card - Applying the clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-lg font-semibold text-gray-900">Campaign List</p>
          
          {/* Filters and Search - Enhanced for clarity and style */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <select className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition duration-150">
              <option>All statuses</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Completed</option>
            </select>
            <input
              type="text"
              placeholder="Search by name or channel"
              className="w-full sm:max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
            />
            <button className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700 transition duration-150">
              New Campaign
            </button>
          </div>
        </div>
        
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading campaigns...</p>
        ) : (
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                {/* Table Headers - Increased padding and clearer typography */}
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map(cmp => (
                <tr
                  key={cmp.id}
                  onClick={() => navigate(`/marketing/campaigns/${cmp.id}`)}
                  className="hover:bg-blue-50/50 transition duration-150 cursor-pointer"
                >
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{cmp.id}</td>
                  <td className="px-6 py-3 text-gray-800 font-medium">{cmp.name}</td>
                  <td className="px-6 py-3 text-gray-600">
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-0.5 text-xs font-medium">
                      {cmp.channel}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {/* Status Tag - Dynamically colored tag */}
                    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium border ${getStatusColor(cmp.status)}`}>
                      {cmp.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-800 font-semibold">${cmp.budget}</td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-sm font-medium text-purple-600 hover:text-purple-800">
                      Details →
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