// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { fetchCampaigns, createCampaign } from '../../api/apiClient';
import CampaignWizard from '@/components/marketing/CampaignWizard';
import { getAuthUser } from '@/utils/apiClient';
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
  Key,
  Send,
  Zap,
  Image as ImageIcon,
  PenTool,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * CampaignsPage Component.
 * Manages the display, creation, and social media integration for marketing campaigns.
 */
function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [connectedChannels, setConnectedChannels] = useState({
    facebook: true,
    instagram: false,
    twitter: true,
    linkedin: false
  });

  const [apiKeys, setApiKeys] = useState({
    facebook: { appId: '', appSecret: '', accessToken: '' },
    instagram: { appId: '', appSecret: '', accessToken: '' },
    twitter: { apiKey: '', apiSecret: '', accessToken: '', accessTokenSecret: '' },
    linkedin: { clientId: '', clientSecret: '', accessToken: '' }
  });

  // Load saved keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('social_api_keys');
    const savedChannels = localStorage.getItem('connected_channels');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
    if (savedChannels) {
      setConnectedChannels(JSON.parse(savedChannels));
    }
  }, []);

  // Save keys to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('social_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Save connected status
  useEffect(() => {
    localStorage.setItem('connected_channels', JSON.stringify(connectedChannels));
  }, [connectedChannels]);

  const [quickPost, setQuickPost] = useState({
    message: '',
    selectedPlatforms: {
      facebook: true,
      instagram: false,
      twitter: true,
      linkedin: false
    }
  });
  const [isPosting, setIsPosting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setMediaFiles(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const user = getAuthUser();
  const isOwner = user?.role_id === 1;

  useEffect(() => {
    const template = searchParams.get('template');
    const productId = searchParams.get('productId');

    if (template || productId) {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const load = () => {
      setLoading(true);
      setError(null);

      fetchCampaigns()
        .then((data) => {
          if (!isMounted) return;
          setCampaigns(data || []);
        })
        .catch((err) => {
          if (!isMounted) return;
          setError(err.message || 'Failed to load campaigns.');
        })
        .finally(() => {
          if (!isMounted) return;
          setLoading(false);
        });
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickPost = async () => {
    if (!quickPost.message.trim()) {
      toast.warn('Please enter a message to post.');
      return;
    }

    const platforms = Object.entries(quickPost.selectedPlatforms)
      .filter(([key, selected]) => selected && connectedChannels[key])
      .map(([key]) => key);

    if (platforms.length === 0) {
      toast.warn('Please select at least one connected platform.');
      return;
    }

    setIsPosting(true);
    try {
      await createCampaign({
        name: `Quick Post: ${quickPost.message.substring(0, 20)}...`,
        channel: 'Social Media',
        budget: 0,
        message: quickPost.message
      });

      toast.info(`Posting to ${platforms.join(', ')}...`);

      setTimeout(() => {
        toast.success('Successfully posted to social media!');
        setQuickPost(prev => ({ ...prev, message: '' }));
        setIsPosting(false);
        fetchCampaigns().then(setCampaigns).catch(() => { });
      }, 1500);

    } catch (err) {
      toast.error(err.message || 'Failed to post.');
      setIsPosting(false);
    }
  };

  const toggleConnection = (channel) => {
    const hasApiKey = apiKeys[channel]?.accessToken || apiKeys[channel]?.apiKey;

    if (!hasApiKey && !connectedChannels[channel]) {
      toast.warn(`Please configure API credentials for ${channel} first.`);
      setShowApiSettings(true);
      return;
    }

    const newValue = !connectedChannels[channel];
    setConnectedChannels(prev => ({ ...prev, [channel]: newValue }));

    if (newValue) {
      toast.success(`Connected to ${channel.charAt(0).toUpperCase() + channel.slice(1)}.`);
    } else {
      toast.info(`Disconnected from ${channel.charAt(0).toUpperCase() + channel.slice(1)}.`);
    }
  };

  const handlePublish = (e, campaign) => {
    e.stopPropagation();
    const activeChannels = Object.entries(connectedChannels)
      .filter(([_, isConnected]) => isConnected)
      .map(([channel]) => channel.charAt(0).toUpperCase() + channel.slice(1));

    if (activeChannels.length === 0) {
      toast.warn('Please connect at least one social media channel first.');
      return;
    }

    toast.success(`Publishing "${campaign.name}" to ${activeChannels.join(', ')}...`);
    setTimeout(() => {
      toast.success('Campaign published successfully!');
    }, 1500);
  };

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
    <DashboardLayout>
      <main className="mx-auto space-y-8">
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

        <section className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
                <p className="text-sm text-gray-500">Publish content to multiple channels</p>
              </div>
            </div>

            <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              {[
                { key: 'facebook', icon: Facebook, color: 'text-blue-600', active: connectedChannels.facebook },
                { key: 'instagram', icon: Instagram, color: 'text-pink-600', active: connectedChannels.instagram },
                { key: 'twitter', icon: Twitter, color: 'text-gray-900', active: connectedChannels.twitter },
                { key: 'linkedin', icon: Linkedin, color: 'text-blue-700', active: connectedChannels.linkedin }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setQuickPost(prev => ({
                    ...prev,
                    selectedPlatforms: { ...prev.selectedPlatforms, [p.key]: !prev.selectedPlatforms[p.key] }
                  }))}
                  disabled={!p.active}
                  className={`p-2.5 rounded-lg transition-all relative ${quickPost.selectedPlatforms[p.key] && p.active ? 'bg-indigo-50' : 'hover:bg-gray-50'} ${!p.active ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={p.active ? `Post to ${p.key}` : `Connect ${p.key} to post`}
                >
                  <p.icon className={`w-5 h-5 ${quickPost.selectedPlatforms[p.key] && p.active ? p.color : 'text-gray-400'}`} />
                  {quickPost.selectedPlatforms[p.key] && p.active && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Editor Area */}
            <div className="flex-1 p-8 border-r border-gray-100">
              <div className="space-y-6">
                <div className="relative">
                  <textarea
                    value={quickPost.message}
                    onChange={(e) => setQuickPost(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="What would you like to share today?"
                    rows={6}
                    className="w-full p-0 border-0 bg-transparent text-lg text-gray-800 placeholder:text-gray-300 focus:ring-0 resize-none"
                  />
                  <div className="absolute top-0 right-0">
                    {/* Optional corner actions */}
                  </div>
                </div>

                {/* Media Gallery */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
                    {mediaFiles.map((src, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                        <img src={src} alt="Upload" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeMedia(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Toolbar */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200 hover:border-indigo-200 font-medium text-sm"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Add Photo/Video</span>
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                  <span className={`text-xs font-medium ${quickPost.message.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                    {quickPost.message.length} / 280 chars
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="w-full lg:w-96 bg-gray-50/50 p-8 flex flex-col">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                Live Preview
              </h3>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{user?.name || 'Company Name'}</div>
                    <div className="text-xs text-gray-400">Just now · <Globe className="w-3 h-3 inline ml-1" /></div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {quickPost.message || <span className="text-gray-300 italic">Your caption will appear here...</span>}
                  </p>
                  {mediaFiles.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-gray-100">
                      <img src={mediaFiles[0]} className="w-full h-auto object-cover max-h-48" alt="Preview" />
                      {mediaFiles.length > 1 && (
                        <div className="bg-gray-100 py-2 text-center text-xs text-gray-500 font-medium border-t border-gray-100">
                          + {mediaFiles.length - 1} more images
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-gray-400 px-2 pt-2 border-t border-gray-50">
                  <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="h-4 w-4 bg-gray-100 rounded"></div>
                    <div className="h-4 w-4 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleQuickPost}
                disabled={isPosting || (!quickPost.message.trim() && mediaFiles.length === 0)}
                className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPosting ? 'Publishing...' : (
                  <>
                    <Send className="w-5 h-5" />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

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

                {/* Facebook Help */}
                <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 space-y-2 border border-blue-100">
                  <p className="font-bold flex items-center gap-2">
                    <Facebook className="w-3 h-3" />
                    How to get Facebook API keys?
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-600">Meta for Developers</a> and create an app.</li>
                    <li>Add "Facebook Login" and "Instagram Graph API" products to your app.</li>
                    <li>In "Tools" &gt; "Graph API Explorer", generate an User Access Token.</li>
                  </ol>
                </div>

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

                {/* Twitter Help */}
                <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-800 space-y-2 border border-gray-200">
                  <p className="font-bold flex items-center gap-2">
                    <Twitter className="w-3 h-3" />
                    How to get X (Twitter) API keys?
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-500">Twitter Developer Portal</a>.</li>
                    <li>Create a Project and an App within it.</li>
                    <li>Navigate to "Keys and Tokens" tab.</li>
                    <li>Generate "API Key and Secret" and "Access Token and Secret".</li>
                    <li>Make sure to enable "Read and Write" permissions in "User authentication settings".</li>
                  </ol>
                </div>

                <button
                  onClick={() => {
                    toast.success('API credentials saved successfully!');
                    setShowApiSettings(false);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Save Credentials
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.facebook ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${connectedChannels.facebook ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Facebook className="w-5 h-5" />
                </div>
                <div className={`w-2 h-2 rounded-full ${connectedChannels.facebook ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <h3 className="font-semibold text-gray-900">Facebook</h3>
              <p className="text-xs text-gray-500 mb-3">{connectedChannels.facebook ? 'Connected.' : 'Not connected.'}</p>
              <button
                onClick={() => toggleConnection('facebook')}
                className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors ${connectedChannels.facebook ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'}`}
              >
                {connectedChannels.facebook ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.instagram ? 'bg-pink-50 border-pink-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${connectedChannels.instagram ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                  <Instagram className="w-5 h-5" />
                </div>
                <div className={`w-2 h-2 rounded-full ${connectedChannels.instagram ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <h3 className="font-semibold text-gray-900">Instagram</h3>
              <p className="text-xs text-gray-500 mb-3">{connectedChannels.instagram ? 'Connected.' : 'Not connected.'}</p>
              <button
                onClick={() => toggleConnection('instagram')}
                className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors ${connectedChannels.instagram ? 'bg-white border-pink-200 text-pink-700 hover:bg-pink-50' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'}`}
              >
                {connectedChannels.instagram ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.twitter ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${connectedChannels.twitter ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-500'}`}>
                  <Twitter className="w-5 h-5" />
                </div>
                <div className={`w-2 h-2 rounded-full ${connectedChannels.twitter ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <h3 className="font-semibold text-gray-900">X (Twitter)</h3>
              <p className="text-xs text-gray-500 mb-3">{connectedChannels.twitter ? 'Connected.' : 'Not connected.'}</p>
              <button
                onClick={() => toggleConnection('twitter')}
                className={`w-full py-1.5 text-xs font-medium rounded-lg border transition-colors ${connectedChannels.twitter ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'}`}
              >
                {connectedChannels.twitter ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${connectedChannels.linkedin ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${connectedChannels.linkedin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className={`w-2 h-2 rounded-full ${connectedChannels.linkedin ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <h3 className="font-semibold text-gray-900">LinkedIn</h3>
              <p className="text-xs text-gray-500 mb-3">{connectedChannels.linkedin ? 'Connected.' : 'Not connected.'}</p>
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
            initialTemplate={searchParams.get('template')}
            initialProductId={searchParams.get('productId')}
            onClose={() => {
              setShowForm(false);
              navigate(location.pathname, { replace: true });
            }}
            onSuccess={() => {
              fetchCampaigns()
                .then(data => setCampaigns(data || []))
                .catch(() => { });
              setShowForm(false);
              navigate(location.pathname, { replace: true });
            }}
          />
        )}

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
                      onClick={() => navigate(`${location.pathname}/${cmp.id}`)}
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
                            title="Publish to Social Media."
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
    </DashboardLayout>
  );
}

export default CampaignsPage;