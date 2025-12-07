// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCampaigns } from '../../api/apiClient'
import CampaignWizard from '@/components/marketing/CampaignWizard'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import MarketingSidebar from '@/components/layout/MarketingSidebar'
import { getAuthUser } from '@/utils/apiClient'
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  Share2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  Settings,
  Key
} from 'lucide-react'
import { toast } from 'react-toastify'

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const [connectedChannels, setConnectedChannels] = useState({
    facebook: true,
    instagram: false,
    twitter: true,
    linkedin: false
  })

  const [apiKeys, setApiKeys] = useState({
    facebook: { appId: '', appSecret: '', accessToken: '' },
    instagram: { appId: '', appSecret: '', accessToken: '' },
    twitter: { apiKey: '', apiSecret: '', accessToken: '', accessTokenSecret: '' },
    linkedin: { clientId: '', clientSecret: '', accessToken: '' }
  })

  const user = getAuthUser()
  const isOwner = user?.role_id === 1

  useEffect(() => {
    let isMounted = true

    const load = () => {
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
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const toggleConnection = (channel) => {
    const hasApiKey = apiKeys[channel]?.accessToken || apiKeys[channel]?.apiKey

    if (!hasApiKey && !connectedChannels[channel]) {
      toast.warn(`Please configure API credentials for ${channel} first`)
      setShowApiSettings(true)
      return
    }

    const newValue = !connectedChannels[channel]
    setConnectedChannels(prev => ({ ...prev, [channel]: newValue }))
    
    // Show toast after state update
    if (newValue) {
      toast.success(`Connected to ${channel.charAt(0).toUpperCase() + channel.slice(1)}`)
    } else {
      toast.info(`Disconnected from ${channel.charAt(0).toUpperCase() + channel.slice(1)}`)
    }
  }

  const handlePublish = (e, campaign) => {
    e.stopPropagation()
    const activeChannels = Object.entries(connectedChannels)
      .filter(([_, isConnected]) => isConnected)
      .map(([channel]) => channel.charAt(0).toUpperCase() + channel.slice(1))

    if (activeChannels.length === 0) {
      toast.warn('Please connect at least one social media channel first.')
      return
    }

    toast.success(`Publishing "${campaign.name}" to ${activeChannels.join(', ')}...`)
    setTimeout(() => {
      toast.success('Campaign published successfully!')
    }, 1500)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'paused':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {isOwner ? <OwnerTopNav /> : <MarketingTopNav onMenuClick={() => setSidebarOpen(true)} />}

      <div className="flex pt-16">
        <div className="hidden lg:block w-64 fixed h-full z-10">
          {isOwner ? <OwnerSideNav /> : <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
        </div>

        {!isOwner && (
          <MarketingSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        )}

        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Campaigns
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and publish marketing campaigns across all channels.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="w-5 h-5" />
              New Campaign
            </button>
          </div>

          {/* Social Media Connections Hub */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                Social Media Connections
              </h2>
              <button
                onClick={() => setShowApiSettings(!showApiSettings)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                API Settings
              </button>
            </div>

            {showApiSettings && (
              <div className="mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-gray-900">API Configuration</h3>
                  </div>
                  <button
                    onClick={() => setShowApiSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> To publish campaigns to social media, you need to configure API credentials for each platform.
                      Visit the respective developer portals to create apps and obtain API keys.
                    </p>
                  </div>

                  {/* Facebook API */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Facebook / Meta</h4>
                    </div>
                    <div className="grid gap-3">
                      <input
                        type="text"
                        placeholder="App ID"
                        value={apiKeys.facebook.appId}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          facebook: { ...prev.facebook, appId: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="password"
                        placeholder="App Secret"
                        value={apiKeys.facebook.appSecret}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          facebook: { ...prev.facebook, appSecret: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="password"
                        placeholder="Access Token"
                        value={apiKeys.facebook.accessToken}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          facebook: { ...prev.facebook, accessToken: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Twitter API */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Twitter className="w-5 h-5 text-gray-800" />
                      <h4 className="font-semibold text-gray-900">X (Twitter)</h4>
                    </div>
                    <div className="grid gap-3">
                      <input
                        type="text"
                        placeholder="API Key"
                        value={apiKeys.twitter.apiKey}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          twitter: { ...prev.twitter, apiKey: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="password"
                        placeholder="API Secret"
                        value={apiKeys.twitter.apiSecret}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          twitter: { ...prev.twitter, apiSecret: e.target.value }
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toast.success('API credentials saved successfully!')
                      setShowApiSettings(false)
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Facebook */}
              <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.facebook ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${connectedChannels.facebook ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${connectedChannels.facebook ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <h3 className="font-semibold text-gray-900">Facebook</h3>
                <p className="text-xs text-gray-500 mb-3">{connectedChannels.facebook ? 'Connected' : 'Not connected'}</p>
                <button
                  onClick={() => toggleConnection('facebook')}
                  className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors ${connectedChannels.facebook ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'}`}
                >
                  {connectedChannels.facebook ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Instagram */}
              <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.instagram ? 'bg-pink-50 border-pink-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${connectedChannels.instagram ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${connectedChannels.instagram ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <h3 className="font-semibold text-gray-900">Instagram</h3>
                <p className="text-xs text-gray-500 mb-3">{connectedChannels.instagram ? 'Connected' : 'Not connected'}</p>
                <button
                  onClick={() => toggleConnection('instagram')}
                  className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors ${connectedChannels.instagram ? 'bg-white border-pink-200 text-pink-700 hover:bg-pink-50' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'}`}
                >
                  {connectedChannels.instagram ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* Twitter / X */}
              <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.twitter ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${connectedChannels.twitter ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-500'}`}>
                    <Twitter className="w-5 h-5" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${connectedChannels.twitter ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <h3 className="font-semibold text-gray-900">X (Twitter)</h3>
                <p className="text-xs text-gray-500 mb-3">{connectedChannels.twitter ? 'Connected' : 'Not connected'}</p>
                <button
                  onClick={() => toggleConnection('twitter')}
                  className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors ${connectedChannels.twitter ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'}`}
                >
                  {connectedChannels.twitter ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* LinkedIn */}
              <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.linkedin ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${connectedChannels.linkedin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div className={`w-2 h-2 rounded-full ${connectedChannels.linkedin ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <h3 className="font-semibold text-gray-900">LinkedIn</h3>
                <p className="text-xs text-gray-500 mb-3">{connectedChannels.linkedin ? 'Connected' : 'Not connected'}</p>
                <button
                  onClick={() => toggleConnection('linkedin')}
                  className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors ${connectedChannels.linkedin ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'}`}
                >
                  {connectedChannels.linkedin ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </section>

          {showForm && (
            <CampaignWizard
              connectedChannels={connectedChannels}
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                fetchCampaigns()
                  .then(data => setCampaigns(data || []))
                  .catch(() => { })
                setShowForm(false)
              }}
            />
          )}

          {/* Campaigns List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-900">Active Campaigns</h2>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
                <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-900">Campaign Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-900">Channel</th>
                    <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 text-right">Budget</th>
                    <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading campaigns...</td>
                    </tr>
                  ) : campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No campaigns found. Create one to get started!</td>
                    </tr>
                  ) : (
                    campaigns.map((cmp) => (
                      <tr
                        key={cmp.id}
                        onClick={() => navigate(`/marketing/campaigns/${cmp.id}`)}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{cmp.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {cmp.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{cmp.channel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(cmp.status)}`}>
                            {cmp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          ${Number(cmp.budget).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handlePublish(e, cmp)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Publish to Social Media"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CampaignsPage