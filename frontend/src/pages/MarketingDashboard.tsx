// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentUserHasPermission } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import { fetchCampaigns, fetchLeads, fetchFinancialOverview } from '@/api/apiClient'
import { ArrowRight } from 'lucide-react'

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
        const leadsList = Array.isArray(leads) ? leads : (leads?.leads || [])

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr] items-stretch">
              {/* Main Welcome Card */}
              <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-100/80 border border-fuchsia-200/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-700">Marketing Performance</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                    Turn campaigns into{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600">
                      revenue for TOP Design
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                    Track campaign performance, cost per lead, and revenue impact so marketing can double down on the channels that work.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    to="/marketing/campaigns"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-fuchsia-50 hover:bg-fuchsia-100 px-4 py-2 text-xs sm:text-sm font-medium text-fuchsia-700 border border-fuchsia-200/50 hover:border-fuchsia-300 transition-all duration-200 hover:shadow-md"
                  >
                    Campaigns
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/marketing/ad-performance"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-pink-50 hover:bg-pink-100 px-4 py-2 text-xs sm:text-sm font-medium text-pink-700 border border-pink-200/50 hover:border-pink-300 transition-all duration-200 hover:shadow-md"
                  >
                    Ad Performance
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/marketing/ads"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-purple-50 hover:bg-purple-100 px-4 py-2 text-xs sm:text-sm font-medium text-purple-700 border border-purple-200/50 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                  >
                    Ads Management
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/ai/overview"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 border border-indigo-200/50 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
                  >
                    <span className="text-xs">✨</span> AI Insights
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>

                {/* Key Metrics */}
                <dl className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-3 text-sm">
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Active Campaigns</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
                      {activeCampaigns === null ? '--' : activeCampaigns}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Leads This Month</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
                      {leadsThisMonth === null ? '--' : leadsThisMonth}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-fuchsia-50/90 px-3 sm:px-4 py-3 border border-fuchsia-200/80 shadow-md hover:shadow-lg transition-shadow ring-1 ring-fuchsia-500/10">
                    <dt className="text-xs font-medium text-fuchsia-700">ROAS</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-fuchsia-800">
                      {roas || '--'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Image Card - Hidden on mobile */}
              <div className="hidden md:block rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-fuchsia-900 to-pink-900 shadow-2xl relative group">
                <img
                  src="https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Marketing team reviewing campaign performance"
                  className="h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 w-fit">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Campaign Snapshot</p>
                  </div>
                  <p className="text-sm lg:text-base font-medium text-white/95 max-w-sm leading-relaxed">
                    Quickly see which campaigns are bringing in leads and revenue so you can adjust budgets in real time.
                  </p>
                </div>
              </div>
            </div>

            {/* Main widgets area - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2">
                {currentUserHasPermission('campaign.view') && (
                  <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <CampaignPerformanceWidget />
                  </div>
                )}
              </div>
              <div>
                {currentUserHasPermission('report.view') && (
                  <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <RevenueOverview />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
