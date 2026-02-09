// @ts-nocheck
import React, { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Facebook, Instagram, Twitter, Linkedin, Plus, Share2, Search, Package, Image as ImageIcon } from 'lucide-react'
import { createCampaign, fetchProducts } from '@/api/apiClient'
import { toast } from 'react-toastify'
import { useEffect } from 'react'

interface CampaignWizardProps {
    onClose: () => void
    onSuccess: () => void
    connectedChannels: {
        facebook: boolean
        instagram: boolean
        twitter: boolean
        linkedin: boolean
    },
    initialTemplate?: string | null
    initialProductId?: string | null
}

export default function CampaignWizard({ onClose, onSuccess, connectedChannels, initialTemplate, initialProductId }: CampaignWizardProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Campaign data
    const [formData, setFormData] = useState({
        name: '',
        channel: 'Meta',
        budget: '',
        description: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        objective: 'awareness',
        targetAudience: '',
        publishToSocial: false,
        selectedPlatforms: {
            facebook: false,
            instagram: false,
            twitter: false,
            linkedin: false
        },
        socialContent: {
            message: '',
            hashtags: '',
            imageUrl: ''
        },
        template: initialTemplate || null,
        productId: initialProductId || null
    })

    const [products, setProducts] = useState([])
    const [searchingProducts, setSearchingProducts] = useState(false)
    const [productSearch, setProductSearch] = useState('')

    useEffect(() => {
        if (formData.template === 'launch' || initialTemplate === 'launch') {
            setSearchingProducts(true)
            fetchProducts()
                .then(data => {
                    setProducts(data)
                    if (initialProductId) {
                        const product = data.find(p => String(p.id) === String(initialProductId))
                        if (product) selectProduct(product)
                    }
                })
                .catch(() => toast.error('Failed to load products'))
                .finally(() => setSearchingProducts(false))
        }
    }, [formData.template, initialTemplate, initialProductId])

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(productSearch.toLowerCase())
    )

    const selectProduct = (product: any) => {
        setFormData(prev => ({
            ...prev,
            name: `Launch: ${product.name}`,
            description: `Official launch campaign for ${product.name}. SKU: ${product.sku}. ${product.description || ''}`,
            productId: product.id,
            socialContent: {
                ...prev.socialContent,
                message: `Exciting news! Our new ${product.name} is now available. Get yours today!`,
                imageUrl: product.image_url || ''
            }
        }))
    }

    const templates = [
        {
            id: 'launch',
            name: 'Product Launch',
            objective: 'awareness',
            description: 'Introduction of a new product or service to the market.',
            channel: 'Meta',
            budget: '500000',
            message: 'We are thrilled to announce the launch of our newest collection! Check it out now.',
            hashtags: '#NewLaunch #Innovation #TopDesign'
        },
        {
            id: 'sale',
            name: 'Flash Sale',
            objective: 'sales',
            description: 'Limited-time discount to drive immediate revenue.',
            channel: 'Meta',
            budget: '200000',
            message: 'FLASH SALE! Get up to 50% off on all items for the next 48 hours only!',
            hashtags: '#FlashSale #Discount #LimitedTime'
        },
        {
            id: 'holiday',
            name: 'Holiday Promo',
            objective: 'engagement',
            description: 'Themed campaign for upcoming holidays or special events.',
            channel: 'Meta',
            budget: '350000',
            message: 'Happy Holidays! Celebrate with us and enjoy special festive offers across our store.',
            hashtags: '#Holidays #Festive #Gifts'
        }
    ]

    const applyTemplate = (tpl: any) => {
        setFormData(prev => ({
            ...prev,
            name: tpl.name,
            objective: tpl.objective,
            description: tpl.description,
            channel: tpl.channel,
            budget: tpl.budget,
            socialContent: {
                ...prev.socialContent,
                message: tpl.message,
                hashtags: tpl.hashtags
            },
            template: tpl.id
        }))
        setStep(1) // Go to basic info with prefilled data
    }

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await createCampaign({
                name: formData.name,
                channel: formData.channel,
                budget: Number(formData.budget),
                message: formData.publishToSocial ? formData.socialContent.message : formData.description
            })

            toast.success('Campaign created successfully!')

            if (formData.publishToSocial) {
                const platforms = Object.entries(formData.selectedPlatforms)
                    .filter(([_, selected]) => selected)
                    .map(([platform]) => platform)

                if (platforms.length > 0) {
                    toast.info(`Publishing to ${platforms.join(', ')}...`)
                    // Simulate API call
                    setTimeout(() => {
                        toast.success('Campaign published to social media!')
                    }, 1500)
                }
            }

            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Failed to create campaign')
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { number: 1, title: 'Basic Info', description: 'Campaign details' },
        { number: 2, title: 'Targeting', description: 'Audience & budget' },
        { number: 3, title: 'Social Media', description: 'Publish options' },
        { number: 4, title: 'Review', description: 'Confirm & launch' }
    ]

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
                        <p className="text-sm text-gray-500 mt-1">Step {step} of {steps.length}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.number}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step > s.number ? 'bg-green-500 text-white' :
                                        step === s.number ? 'bg-indigo-600 text-white' :
                                            'bg-gray-200 text-gray-500'
                                        }`}>
                                        {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                                        <p className="text-xs text-gray-500">{s.description}</p>
                                    </div>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 rounded-full ${step > s.number ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">

                    {/* Step -1 (Optional): Select Template */}
                    {step === 1 && !formData.name && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-semibold text-gray-900">How would you like to start?</h3>
                                <p className="text-sm text-gray-500">Pick a template to save time or start from scratch</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {templates.map(tpl => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => applyTemplate(tpl)}
                                        className="p-5 border-2 border-gray-100 rounded-2xl text-left hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {tpl.id === 'launch' ? <Plus className="w-6 h-6" /> :
                                                tpl.id === 'sale' ? <Check className="w-6 h-6" /> :
                                                    <Share2 className="w-6 h-6" />}
                                        </div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-700">{tpl.name}</h4>
                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tpl.description}</p>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setStep(1)}
                                    className="p-5 border-2 border-dashed border-gray-300 rounded-2xl text-center flex flex-col items-center justify-center hover:border-gray-900 hover:bg-gray-50 transition-all"
                                >
                                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="font-bold text-gray-900">Start Blank</p>
                                    <p className="text-xs text-gray-500 mt-1">Full control over every step</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {(step === 1 && (formData.name || step > 1)) && (
                        <div className="space-y-6">
                            {formData.template === 'launch' && (
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">Select Product to Promote</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search products by name or SKU..."
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {searchingProducts ? (
                                            <p className="text-xs text-center text-gray-500 py-4">Loading products...</p>
                                        ) : filteredProducts.length === 0 ? (
                                            <p className="text-xs text-center text-gray-500 py-4">No products found</p>
                                        ) : (
                                            filteredProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => selectProduct(p)}
                                                    className={`w-full p-3 flex items-center gap-3 rounded-lg border transition-all ${formData.productId === p.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                                                >
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package className={`w-5 h-5 ${formData.productId === p.id ? 'text-indigo-200' : 'text-gray-400'}`} />}
                                                    </div>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-semibold text-sm truncate">{p.name}</p>
                                                        <p className={`text-xs truncate ${formData.productId === p.id ? 'text-indigo-100' : 'text-gray-500'}`}>{p.sku}</p>
                                                    </div>
                                                    {formData.productId === p.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="e.g., Summer Sale 2024"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                                {formData.template && (
                                    <p className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Template applied. You can still modify these details.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Objective *</label>
                                <select
                                    value={formData.objective}
                                    onChange={(e) => updateField('objective', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="awareness">Brand Awareness</option>
                                    <option value="traffic">Website Traffic</option>
                                    <option value="engagement">Engagement</option>
                                    <option value="leads">Lead Generation</option>
                                    <option value="sales">Sales</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Describe your campaign goals and strategy..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => updateField('startDate', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => updateField('endDate', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Targeting & Budget */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Channel *</label>
                                <select
                                    value={formData.channel}
                                    onChange={(e) => updateField('channel', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="Meta">Meta (Facebook/Instagram)</option>
                                    <option value="Google">Google Ads</option>
                                    <option value="X">X (Twitter)</option>
                                    <option value="LinkedIn">LinkedIn</option>
                                    <option value="TikTok">TikTok</option>
                                    <option value="Email">Email Marketing</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Budget (RWF) *</label>
                                <input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => updateField('budget', e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                                <textarea
                                    value={formData.targetAudience}
                                    onChange={(e) => updateField('targetAudience', e.target.value)}
                                    placeholder="e.g., Age 25-45, interested in technology, located in urban areas..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Social Media Publishing */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                                <div>
                                    <p className="font-semibold text-gray-900">Publish to Social Media</p>
                                    <p className="text-sm text-gray-600">Automatically share this campaign on your connected platforms</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.publishToSocial}
                                        onChange={(e) => updateField('publishToSocial', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {formData.publishToSocial && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Platforms</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue' },
                                                { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
                                                { key: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'gray' },
                                                { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue' }
                                            ].map(platform => (
                                                <button
                                                    key={platform.key}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!connectedChannels[platform.key]) {
                                                            toast.warn(`Please connect your ${platform.label} account first`)
                                                            return
                                                        }
                                                        updateField('selectedPlatforms', {
                                                            ...formData.selectedPlatforms,
                                                            [platform.key]: !formData.selectedPlatforms[platform.key]
                                                        })
                                                    }}
                                                    disabled={!connectedChannels[platform.key]}
                                                    className={`p-4 border-2 rounded-xl flex items-center gap-3 transition-all ${formData.selectedPlatforms[platform.key]
                                                        ? `border-${platform.color}-500 bg-${platform.color}-50`
                                                        : connectedChannels[platform.key]
                                                            ? 'border-gray-200 hover:border-gray-300'
                                                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <platform.icon className={`w-5 h-5 ${formData.selectedPlatforms[platform.key] ? `text-${platform.color}-600` : 'text-gray-400'}`} />
                                                    <div className="flex-1 text-left">
                                                        <p className="font-medium text-gray-900">{platform.label}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {connectedChannels[platform.key] ? 'Connected' : 'Not connected'}
                                                        </p>
                                                    </div>
                                                    {formData.selectedPlatforms[platform.key] && (
                                                        <Check className="w-5 h-5 text-green-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Post Message</label>
                                        <textarea
                                            value={formData.socialContent.message}
                                            onChange={(e) => updateField('socialContent', { ...formData.socialContent, message: e.target.value })}
                                            placeholder="Write your social media post..."
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hashtags</label>
                                        <input
                                            type="text"
                                            value={formData.socialContent.hashtags}
                                            onChange={(e) => updateField('socialContent', { ...formData.socialContent, hashtags: e.target.value })}
                                            placeholder="#marketing #sale #promo"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <h3 className="font-bold text-lg text-gray-900">Campaign Summary</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Campaign Name</p>
                                        <p className="font-semibold text-gray-900">{formData.name || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Objective</p>
                                        <p className="font-semibold text-gray-900 capitalize">{formData.objective}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Channel</p>
                                        <p className="font-semibold text-gray-900">{formData.channel}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Budget</p>
                                        <p className="font-semibold text-gray-900">${formData.budget || '0.00'}</p>
                                    </div>
                                </div>

                                {formData.publishToSocial && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 mb-2">Publishing to</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(formData.selectedPlatforms)
                                                .filter(([_, selected]) => selected)
                                                .map(([platform]) => (
                                                    <span key={platform} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                                                        {platform}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>

                        {step < steps.length ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 1 && !formData.name}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.name || !formData.budget}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? 'Creating...' : 'Create Campaign'}
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
