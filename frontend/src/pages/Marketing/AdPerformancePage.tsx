// @ts-nocheck
import React, { useEffect, useState } from 'react'
import AdPerformanceChart from '../../modules/marketing/components/AdPerformanceChart'
import { fetchCampaigns } from '../../api/apiClient'

export default function AdPerformancePage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    fetchCampaigns()
      .then((data) => {
        if (!isMounted) return
        const list = Array.isArray(data) ? data : []
        setCampaigns(list)
        if (list.length > 0) setSelectedId(String(list[0].id))
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load campaigns')
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Marketing</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Ad performance</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          High-level KPIs from Meta, X, and other paid channels. Use this to see which campaigns generate
          profitable jobs.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="text-gray-700 font-medium">Campaign:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select a campaign</option>
            {campaigns.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <AdPerformanceChart campaignId={selectedId} />
      </div>
    </div>
  )
}
