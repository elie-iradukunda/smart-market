// @ts-nocheck
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { fetchAds, createAd, updateAd, deleteAd, toggleAdStatus, Ad } from '@/api/adsApi'
import { uploadProductImage } from '@/api/apiClient'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import { getAuthUser } from '@/utils/apiClient'

export default function AdsManagementPage() {
    const [ads, setAds] = useState<Ad[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingAd, setEditingAd] = useState<Ad | null>(null)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        button_text: 'Learn More',
        background_color: '#4F46E5',
        text_color: '#FFFFFF',
        start_date: '',
        end_date: '',
        is_active: true,
        display_order: 0,
    })

    const user = getAuthUser()
    const isOwner = user?.role_id === 1

    useEffect(() => {
        loadAds()
    }, [])

    const loadAds = async () => {
        try {
            setIsLoading(true)
            const data = await fetchAds()
            setAds(data)
            setError(null)
        } catch (err: any) {
            setError(err.message || 'Failed to load ads')
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const result = await uploadProductImage(file)
            setFormData({ ...formData, image_url: result.imageUrl })
        } catch (err: any) {
            setError(err.message || 'Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            if (editingAd) {
                await updateAd(editingAd.id, formData)
            } else {
                await createAd(formData)
            }

            await loadAds()
            resetForm()
        } catch (err: any) {
            setError(err.message || 'Failed to save ad')
        }
    }

    const handleEdit = (ad: Ad) => {
        setEditingAd(ad)
        setFormData({
            title: ad.title,
            description: ad.description || '',
            image_url: ad.image_url || '',
            link_url: ad.link_url || '',
            button_text: ad.button_text || 'Learn More',
            background_color: ad.background_color || '#4F46E5',
            text_color: ad.text_color || '#FFFFFF',
            start_date: ad.start_date || '',
            end_date: ad.end_date || '',
            is_active: ad.is_active,
            display_order: ad.display_order,
        })
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ad?')) return

        try {
            await deleteAd(id)
            await loadAds()
        } catch (err: any) {
            setError(err.message || 'Failed to delete ad')
        }
    }

    const handleToggleStatus = async (id: number) => {
        try {
            await toggleAdStatus(id)
            await loadAds()
        } catch (err: any) {
            setError(err.message || 'Failed to toggle ad status')
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image_url: '',
            link_url: '',
            button_text: 'Learn More',
            background_color: '#4F46E5',
            text_color: '#FFFFFF',
            start_date: '',
            end_date: '',
            is_active: true,
            display_order: 0,
        })
        setEditingAd(null)
        setShowForm(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 px-0 pb-10">
            {isOwner ? <OwnerTopNav /> : <MarketingTopNav />}

            <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-6">
                <div className="flex gap-6">
                    <OwnerSideNav />

                    <main className="flex-1 space-y-6 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Marketing</p>
                                    <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Ads Management</h1>
                                    <p className="mt-2 text-sm text-gray-600 max-w-xl">
                                        Create and manage advertisements that will be displayed on the home page with animated sliding effects.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Ad
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        {showForm && (
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder="Enter ad title"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Button Text
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.button_text}
                                                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder="Learn More"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Enter ad description"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Link URL
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.link_url}
                                                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder="https://example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Image Upload
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                            {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                                            {formData.image_url && (
                                                <p className="text-xs text-green-600 mt-1">✓ Image uploaded</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Background Color
                                            </label>
                                            <input
                                                type="color"
                                                value={formData.background_color}
                                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Text Color
                                            </label>
                                            <input
                                                type="color"
                                                value={formData.text_color}
                                                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                                                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Display Order
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.display_order}
                                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                            Active (display on home page)
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                        >
                                            {editingAd ? 'Update Ad' : 'Create Ad'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Ads List */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Advertisements</h2>

                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading ads...</div>
                            ) : ads.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No ads yet. Create your first ad to get started!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ads.map((ad) => (
                                        <div
                                            key={ad.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium rounded-full ${ad.is_active
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                                }`}
                                                        >
                                                            {ad.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>

                                                    {ad.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                                                    )}

                                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className="w-4 h-4" />
                                                            <span>{ad.impressions} impressions</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span>{ad.clicks} clicks</span>
                                                        </div>
                                                        {ad.clicks > 0 && ad.impressions > 0 && (
                                                            <div>
                                                                CTR: {((ad.clicks / ad.impressions) * 100).toFixed(2)}%
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(ad.id)}
                                                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title={ad.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {ad.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(ad)}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ad.id)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
