// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchCampaignPerformance } from '../../../api/apiClient'

export default function AdPerformanceChart({ campaignId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!campaignId) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchCampaignPerformance(campaignId)
      .then((data) => {
        if (!isMounted) return
        setRows(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load performance')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [campaignId])

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Campaign Performance</h2>
      {!campaignId && (
        <p className="mt-2 text-xs text-gray-500">Select a campaign to view performance.</p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-2 text-xs text-gray-500">Loading performance...</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Date</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Impressions</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Clicks</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Conversions</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">CTR</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => {
                const ctr = row.impressions ? `${((row.clicks || 0) / row.impressions * 100).toFixed(1)}%` : '0.0%'
                return (
                  <tr key={row.id || row.date} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{row.date}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{row.impressions}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{row.clicks}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{row.conversions}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{ctr}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{row.cost_spent}</td>
                  </tr>
                )
              })}
              {rows.length === 0 && campaignId && !loading && !error && (
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-center text-xs text-gray-500">No performance data yet for this campaign.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
