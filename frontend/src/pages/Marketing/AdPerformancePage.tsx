// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchCampaigns, recordAdPerformance, fetchCampaignPerformance } from '../../api/apiClient'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import MarketingSidebar from '@/components/layout/MarketingSidebar'
import { getAuthUser } from '@/utils/apiClient'
import {
  BarChart3,
  TrendingUp,
  MousePointer,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Plus
} from 'lucide-react'

export default function AdPerformancePage() {
  const [campaigns, setCampaigns] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Form state
  const [impressions, setImpressions] = useState('')
  const [clicks, setClicks] = useState('')
  const [conversions, setConversions] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))

  const user = getAuthUser()
  const isOwner = user?.role_id === 1

  // Fetch campaigns on mount
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

  // Fetch performance data when selectedId changes
  useEffect(() => {
    if (!selectedId) return
    let isMounted = true
    setLoading(true)

    fetchCampaignPerformance(selectedId)
      .then((data) => {
        if (!isMounted) return
        setPerformanceData(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Failed to load performance:', err)
        // Don't block UI, just show empty
        setPerformanceData([])
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedId])

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

      // Refresh data
      const data = await fetchCampaignPerformance(selectedId)
      setPerformanceData(Array.isArray(data) ? data : [])

      // Clear form
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

  // Calculate summary stats
  const totalImpressions = performanceData.reduce((sum, r) => sum + (r.impressions || 0), 0)
  const totalClicks = performanceData.reduce((sum, r) => sum + (r.clicks || 0), 0)
  const totalConversions = performanceData.reduce((sum, r) => sum + (r.conversions || 0), 0)
  const totalCost = performanceData.reduce((sum, r) => sum + (Number(r.cost_spent) || 0), 0)

  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0
  const avgCpa = totalConversions > 0 ? totalCost / totalConversions : 0

  return (
    <div className="min-h-screen bg-gray-50/50">
      {isOwner ? <OwnerTopNav /> : <MarketingTopNav onMenuClick={() => setSidebarOpen(true)} />}

      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 fixed h-full z-10">
          {isOwner ? <OwnerSideNav /> : <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
        </div>

        {/* Mobile Sidebar */}
        {!isOwner && (
          <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        )}

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Ad Performance
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and analyze your campaign metrics across all channels.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors min-w-[200px]"
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Impressions */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.5%
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Impressions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {totalImpressions.toLocaleString()}
              </h3>
            </div>

            {/* Clicks & CTR */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <MousePointer className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  CTR: <span className="text-gray-900 font-bold">{avgCtr.toFixed(2)}%</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Clicks</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {totalClicks.toLocaleString()}
              </h3>
            </div>

            {/* Conversions & CPA */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  CPA: <span className="text-gray-900 font-bold">${avgCpa.toFixed(2)}</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Conversions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {totalConversions.toLocaleString()}
              </h3>
            </div>

            {/* Cost & CPC */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  CPC: <span className="text-gray-900 font-bold">${avgCpc.toFixed(2)}</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Total Spend</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${totalCost.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column: Chart/Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Performance History</h2>
                  <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                    View Full Report
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">Impressions</th>
                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">Clicks</th>
                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">CTR</th>
                        <th className="px-6 py-4 font-semibold text-gray-900 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Loading data...
                          </td>
                        </tr>
                      ) : performanceData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No performance data available for this campaign.
                          </td>
                        </tr>
                      ) : (
                        performanceData.map((row: any, idx) => {
                          const ctr = row.impressions ? ((row.clicks || 0) / row.impressions * 100).toFixed(1) : '0.0'
                          return (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                {new Date(row.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600">
                                {row.impressions?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-600">
                                {row.clicks?.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${Number(ctr) > 1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {ctr}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-gray-900 font-medium">
                                ${Number(row.cost_spent).toFixed(2)}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Record Data Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Plus className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Record Metrics</h2>
                    <p className="text-xs text-gray-500">Add daily performance data</p>
                  </div>
                </div>

                <form onSubmit={handleRecord} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Impressions
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={impressions}
                        onChange={e => setImpressions(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Clicks
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={clicks}
                        onChange={e => setClicks(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Conversions
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={conversions}
                        onChange={e => setConversions(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={cost}
                        onChange={e => setCost(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !selectedId}
                    className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Record Data'
                    )}
                  </button>

                  {!selectedId && (
                    <p className="text-xs text-center text-amber-600 bg-amber-50 py-2 rounded-lg">
                      Please select a campaign first
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
