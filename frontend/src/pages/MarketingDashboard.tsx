// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentUserHasPermission } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import { fetchCampaigns, fetchLeads, fetchFinancialOverview } from '@/api/apiClient'

export default function MarketingDashboard() {
  const [activeCampaigns, setActiveCampaigns] = useState<number | null>(null)
  const [leadsThisMonth, setLeadsThisMonth] = useState<number | null>(null)
  const [roas, setRoas] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadMetrics() {
      try {
        const [campaigns, leads, financial] = await Promise.all([
          fetchCampaigns().catch(() => []),
          fetchLeads().catch(() => []),
          fetchFinancialOverview().catch(() => null),
        ])

        if (!isMounted) return

        const campaignList = Array.isArray(campaigns) ? campaigns : []
        const leadsList = Array.isArray(leads) ? leads : []

        // Active campaigns: if a status field exists, count only non-completed ones, otherwise total
        const active = campaignList.filter(c => {
          const status = (c.status || c.state || '').toString().toLowerCase()
          if (!status) return true
          return !['completed', 'inactive', 'ended', 'paused'].includes(status)
        }).length

        setActiveCampaigns(active)

        // Leads this month: if created_at is present, filter last 30 days; otherwise use total count
        const now = new Date()
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const leadsCount = leadsList.filter(l => {
          if (!l.created_at) return true
          const d = new Date(l.created_at)
          if (Number.isNaN(d.getTime())) return true
          return d >= thirtyDaysAgo && d <= now
        }).length

        setLeadsThisMonth(leadsCount)

        // ROAS: total revenue (last 30 days) / total campaign budget
        const totalRevenue = financial ? Number(financial.total_revenue) || 0 : 0
        const totalBudget = campaignList.reduce((sum, c) => sum + (Number(c.budget) || 0), 0)

        if (totalRevenue > 0 && totalBudget > 0) {
          const ratio = totalRevenue / totalBudget
          setRoas(`${ratio.toFixed(1)}x`)
        } else {
          setRoas(null)
        }
      } catch {
        if (!isMounted) return
        setActiveCampaigns(null)
        setLeadsThisMonth(null)
        setRoas(null)
      }
    }

    loadMetrics()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header section */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-fuchsia-700">Marketing performance</p>
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  Turn campaigns into
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-600"> revenue for TOP Design</span>
                </h1>
                <p className="mt-4 text-base text-gray-600 max-w-2xl">
                  Track campaign performance, cost per lead, and revenue impact so marketing can double down on
                  the channels that work.
                </p>
              </div>

              <dl className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
                <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                  <dt className="text-xs font-medium text-gray-500">Active campaigns</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">
                    {activeCampaigns === null ? '--' : activeCampaigns}
                  </dd>
                </div>
                <div className="rounded-xl bg-white/80 px-4 py-3 border border-gray-100 shadow-lg">
                  <dt className="text-xs font-medium text-gray-500">Leads this month</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">
                    {leadsThisMonth === null ? '--' : leadsThisMonth}
                  </dd>
                </div>
                <div className="rounded-xl bg-fuchsia-50/90 px-4 py-3 border border-fuchsia-200 shadow-lg ring-1 ring-fuchsia-500/10">
                  <dt className="text-xs font-medium text-fuchsia-700">ROAS</dt>
                  <dd className="mt-1 text-2xl font-bold text-fuchsia-800">
                    {roas || '--'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Side card with marketing context */}
            <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
              <img
                src="https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Marketing team reviewing campaign performance"
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <p className="text-sm font-medium uppercase tracking-wider text-fuchsia-200">Campaign snapshot</p>
                <p className="mt-2 text-base text-gray-100 max-w-sm">
                  Quickly see which campaigns are bringing in leads and revenue so you can adjust budgets in real
                  time.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <Link
                  to="/marketing/campaigns"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Campaigns
                </Link>
                <Link
                  to="/marketing/ad-performance"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Ad performance
                </Link>
                <Link
                  to="/marketing/ads"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Ads Management
                </Link>
                <Link
                  to="/ai/overview"
                  className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-800 border border-purple-100 hover:bg-purple-100"
                >
                  <span className="mr-1.5 text-xs">✨</span> AI insights
                </Link>
              </div>
            </div>
          </div>

          {/* Main widgets area */}
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-6">
              {currentUserHasPermission('campaign.view') && (
                <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                  <CampaignPerformanceWidget />
                </div>
              )}
            </div>
            <div className="space-y-6">
              {currentUserHasPermission('report.view') && (
                <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                  <RevenueOverview />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
