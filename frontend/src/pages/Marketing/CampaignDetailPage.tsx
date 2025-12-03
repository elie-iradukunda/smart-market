// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchCampaign } from '@/api/apiClient'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import MarketingSidebar from '@/components/layout/MarketingSidebar'
import { getAuthUser } from '@/utils/apiClient'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Globe,
  BarChart3,
  Edit,
  Trash2,
  Play,
  Pause,
  Share2
} from 'lucide-react'
import { toast } from 'react-toastify'

export default function CampaignDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        // Map backend fields to expected format
        const mappedData = {
          id: data.id,
          name: data.title || data.name || `Campaign #${data.id}`,
          channel: data.platform || data.channel || 'email',
          budget: data.budget || 0,
          status: data.status || 'active',
          sent_count: data.sent_count || 0,
          failed_count: data.failed_count || 0,
          created_at: data.created_at,
          subject: data.subject || '',
          message: data.message || ''
        }
        setCampaign(mappedData)
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

  const handleStatusToggle = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    setCampaign({ ...campaign, status: newStatus })
    toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      toast.success('Campaign deleted')
      navigate('/marketing/campaigns')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'paused':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ended':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        {isOwner ? <OwnerTopNav /> : <MarketingTopNav onMenuClick={() => setSidebarOpen(true)} />}
        <div className="flex pt-16">
          <div className="hidden lg:block w-64 fixed h-full z-10">
            {isOwner ? <OwnerSideNav /> : <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
          </div>
          {!isOwner && <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
          <main className="flex-1 lg:ml-64 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading campaign...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        {isOwner ? <OwnerTopNav /> : <MarketingTopNav onMenuClick={() => setSidebarOpen(true)} />}
        <div className="flex pt-16">
          <div className="hidden lg:block w-64 fixed h-full z-10">
            {isOwner ? <OwnerSideNav /> : <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
          </div>
          {!isOwner && <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
          <main className="flex-1 lg:ml-64 p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-semibold">{error || 'Campaign not found'}</p>
              <button
                onClick={() => navigate('/marketing/campaigns')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Campaigns
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const successRate = campaign.sent_count > 0
    ? ((campaign.sent_count / (campaign.sent_count + campaign.failed_count)) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50/50">
      {isOwner ? <OwnerTopNav /> : <MarketingTopNav onMenuClick={() => setSidebarOpen(true)} />}

      <div className="flex pt-16">
        <div className="hidden lg:block w-64 fixed h-full z-10">
          {isOwner ? <OwnerSideNav /> : <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
        </div>

        {!isOwner && <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

          {/* Back Button */}
          <button
            onClick={() => navigate('/marketing/campaigns')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Campaigns</span>
          </button>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{campaign.name}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{campaign.channel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStatusToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {campaign.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Budget</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${Number(campaign.budget).toLocaleString()}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Sent</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {campaign.sent_count.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Failed</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {campaign.failed_count.toLocaleString()}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Success Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {successRate}%
              </h3>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Message Content */}
            {campaign.subject && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Message Content
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Subject</p>
                    <p className="text-gray-900">{campaign.subject}</p>
                  </div>
                  {campaign.message && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Message</p>
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                        {campaign.message}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Campaign Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Campaign Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Campaign ID</span>
                  <span className="text-sm font-medium text-gray-900">#{campaign.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Platform</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{campaign.channel}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`text-sm font-medium capitalize ${campaign.status === 'active' ? 'text-green-600' :
                      campaign.status === 'paused' ? 'text-amber-600' :
                        'text-gray-600'
                    }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(campaign.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Total Reach</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(campaign.sent_count + campaign.failed_count).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Over Time</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Performance chart coming soon</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
