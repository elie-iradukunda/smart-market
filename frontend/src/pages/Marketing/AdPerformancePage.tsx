// @ts-nocheck
import React, { useEffect, useState } from 'react'
import AdPerformanceChart from '../../modules/marketing/components/AdPerformanceChart'
import { fetchCampaigns, recordAdPerformance } from '../../api/apiClient'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import { getAuthUser } from '@/utils/apiClient'

export default function AdPerformancePage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [impressions, setImpressions] = useState('')
  const [clicks, setClicks] = useState('')
  const [conversions, setConversions] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))

  const user = getAuthUser()
  const isOwner = user?.role_id === 1

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

  const handleRecord = async (e) => {
    e.preventDefault()
    if (!selectedId || saving) return
    setSaving(true)
    setError(null)

    try {
      await recordAdPerformance({
        campaign_id: selectedId,
        impressions: Number(impressions) || 0,
        clicks: Number(clicks) || 0,
        conversions: Number(conversions) || 0,
        cost_spent: Number(cost) || 0,
        date,
      })
      // bump key so chart refetches
      setReloadKey(k => k + 1)
      setImpressions('')
      setClicks('')
      setConversions('')
      setCost('')
    } catch (err: any) {
      setError(err.message || 'Failed to record performance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 px-0 pb-10">
      {isOwner ? <OwnerTopNav /> : <MarketingTopNav />}

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-6">
        <div className="flex gap-6">
          <OwnerSideNav />

          <main className="flex-1 space-y-6 max-w-7xl mx-auto">

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
        {/* Simple inline form to record daily performance for the selected campaign */}
        {selectedId && (
          <form onSubmit={handleRecord} className="mt-3 grid gap-2 text-xs sm:grid-cols-5">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Impressions"
              value={impressions}
              onChange={e => setImpressions(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Clicks"
              value={clicks}
              onChange={e => setClicks(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Conversions"
              value={conversions}
              onChange={e => setConversions(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Cost"
                value={cost}
                onChange={e => setCost(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Record'}
              </button>
            </div>
          </form>
        )}

        <AdPerformanceChart campaignId={selectedId} reloadKey={reloadKey} />
      </div>
          </main>
        </div>
      </div>
    </div>
  )
}
