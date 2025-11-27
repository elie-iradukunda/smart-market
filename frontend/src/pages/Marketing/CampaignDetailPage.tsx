// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCampaign } from '@/api/apiClient'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import { getAuthUser } from '@/utils/apiClient'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = getAuthUser()
  const isOwner = user?.role_id === 1

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchCampaign(id)
      .then((data) => {
        if (!isMounted) return
        setCampaign(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load campaign')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 px-0 pb-10">
        {isOwner ? <OwnerTopNav /> : <MarketingTopNav />}
        <div className="px-4 py-6 sm:px-6 lg:px-8"><p className="text-sm text-gray-600">Loading campaign...</p></div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 px-0 pb-10">
        {isOwner ? <OwnerTopNav /> : <MarketingTopNav />}
        <div className="px-4 py-6 sm:px-6 lg:px-8"><p className="text-sm text-red-600">{error || 'Campaign not found'}</p></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 px-0 pb-10">
      {isOwner ? <OwnerTopNav /> : <MarketingTopNav />}
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Campaign</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{campaign.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{campaign.channel} • {campaign.id}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{campaign.status}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Daily budget</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${campaign.dailyBudget}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Objective</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{campaign.objective}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
        <h2 className="text-base font-semibold text-gray-900">Audience</h2>
        <p className="text-gray-700">{campaign.audience}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-gray-700">
          <li>Focus on local schools and parent audiences.</li>
          <li>Optimise creatives for mobile placements.</li>
          <li>Use lead forms or WhatsApp click-to-chat for quick follow-up.</li>
        </ul>
      </section>
    </div>
    </div>
  )
}
