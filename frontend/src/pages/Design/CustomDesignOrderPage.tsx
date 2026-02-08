import React, { useState, useMemo, useEffect } from 'react'
import {
    Palette,
    Ruler,
    Type,
    Layout as LayoutIcon,
    Upload,
    Info,
    CheckCircle2,
    Phone,
    User,
    Mail,
    LocateFixed,
    Monitor,
    Zap
} from 'lucide-react'
import { useSearchParams, Link } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EcommerceLayout from '@/components/layout/EcommerceLayout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { fetchCustomDesignSettings } from '@/api/apiClient'
import { toast } from 'react-toastify'

// Fallback icon mapping
const ICON_MAP: Record<string, any> = {
    'signboard': LayoutIcon,
    'banner': Monitor,
    'shirt': Palette,
    'stickers': Type,
    'other': Info
}

// Mapping for external service IDs to internal IDs
const SERVICE_ID_MAP: Record<string, string> = {
    'signage': 'signboard',
    'banner-printing': 'banner',
    'vinyl-printing': 'stickers',
    'large-format': 'banner',
    'garment-branding': 'shirt'
}

// Mock Font Styles
const FONT_STYLES = [
    { id: 'modern', name: 'Modern Sans', value: 'font-sans' },
    { id: 'serif', name: 'Elegant Serif', value: 'font-serif' },
    { id: 'mono', name: 'Tech Mono', value: 'font-mono' },
]

export default function CustomDesignOrderPage() {
    const { user } = useAuth()
    const isStaff = user && (user.role_id === 1 || user.role_id === 2 || user.role_id === 3)

    const [searchParams] = useSearchParams()
    const productParam = searchParams.get('product')


    const [productTypes, setProductTypes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [formData, setFormData] = useState({
        productType: 'signboard',
        width: '',
        height: '',
        bgColor: '#2563eb', // Default blue
        textColor: '#ffffff', // Default white
        fontStyle: 'font-sans',
        fontSize: '32',
        textContent: 'YOUR BUSINESS NAME',
        designDescription: '', // NEW: Detailed description for production team
        usageDescription: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerLocation: '',
        selectedCustomerId: '' // For staff/admin to select existing customer
    })

    // Fetch dynamic product types from backend
    useEffect(() => {
        const fallback = [
            { id: 'signboard', name: 'Signboard', icon: LayoutIcon, pricePerSqm: 45000, description: 'Durable outdoor & indoor signboards' },
            { id: 'banner', name: 'Banner', icon: Monitor, pricePerSqm: 15000, description: 'High-quality vinyl PVC banners' },
            { id: 'shirt', name: 'T-shirt printing', icon: Palette, pricePerSqm: 8500, description: 'Custom garment & apparel branding' },
            { id: 'other', name: 'Others', icon: Zap, pricePerSqm: 20000, description: 'Custom visual design products' },
        ];

        fetchCustomDesignSettings()
            .then(data => {
                if (data && data.length > 0) {
                    const mapped = data.map((item: any) => ({
                        id: item.product_key,
                        name: item.name,
                        icon: ICON_MAP[item.product_key] || Info,
                        pricePerSqm: Number(item.price_per_sqm),
                        description: item.description
                    }))
                    setProductTypes(mapped)

                    // Update initial product type if it exists in settings
                    if (productParam && SERVICE_ID_MAP[productParam]) {
                        setFormData(prev => ({ ...prev, productType: SERVICE_ID_MAP[productParam] }))
                    } else {
                        setFormData(prev => ({ ...prev, productType: mapped[0].id }))
                    }
                } else {
                    setProductTypes(fallback);
                }
            })
            .catch(err => {
                console.error('Failed to load design settings:', err)
                toast.error('Failed to load latest pricing. Using defaults.')
                setProductTypes(fallback)
            })

            .finally(() => setLoading(false))
    }, [productParam])

    // Pre-fill user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                customerName: user.fullName || prev.customerName,
                customerEmail: user.email || prev.customerEmail,
                customerPhone: user.phoneNumber || prev.customerPhone
            }))
        }
    }, [user])




    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Calculations
    const selectedProduct = useMemo(() =>
        productTypes.find(p => p.id === formData.productType) || productTypes[0] || { pricePerSqm: 0, name: 'Select Product' },
        [formData.productType, productTypes])

    const totalArea = useMemo(() => {
        const w = parseFloat(formData.width) || 0
        const h = parseFloat(formData.height) || 0
        return (w * h).toFixed(2)
    }, [formData.width, formData.height])

    const estimatedPrice = useMemo(() => {
        return parseFloat(totalArea) * (selectedProduct?.pricePerSqm || 0)
    }, [totalArea, selectedProduct])

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
            toast.error('Please fill in all customer information fields')
            return
        }

        if (!formData.width || !formData.height) {
            toast.error('Please specify dimensions')
            return
        }

        setIsSubmitting(true)

        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('http://localhost:3000/api/custom-design/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    productType: formData.productType,
                    width: formData.width,
                    height: formData.height,
                    totalArea: totalArea,
                    bgColor: formData.bgColor,
                    textColor: formData.textColor,
                    fontStyle: formData.fontStyle,
                    fontSize: formData.fontSize,
                    textContent: formData.textContent,
                    designDescription: formData.designDescription,
                    usageDescription: formData.usageDescription,
                    customerName: formData.customerName,
                    customerPhone: formData.customerPhone,
                    customerEmail: formData.customerEmail,
                    customerLocation: formData.customerLocation,
                    estimatedPrice: estimatedPrice
                }),
            })

            if (response.ok) {
                await response.json()
                toast.success('Order submitted successfully! Check your email for confirmation.')
                setIsSubmitted(true)
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to submit order')
            }
        } catch (error) {
            console.error('Order submission error:', error)
            toast.error('An error occurred while submitting your order')
        } finally {
            setIsSubmitting(false)
        }
    }


    // Determine which layout to use
    const PageWrapper = isStaff ? DashboardLayout : EcommerceLayout

    if (loading) {
        return (
            <PageWrapper>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-black text-indigo-950 uppercase tracking-widest italic">Loading Pricing Engine...</p>
                    </div>
                </div>
            </PageWrapper>
        )
    }

    if (isSubmitted) {

        return (
            <PageWrapper>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-8 text-center animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Received!</h1>
                        <p className="text-gray-600 mb-8">
                            Thank you, <span className="font-semibold">{formData.customerName || 'Value Customer'}</span>.
                            Our designers are reviewing your order for a {selectedProduct?.name}.
                            {formData.customerPhone && ` We'll contact you at ${formData.customerPhone} shortly.`}
                        </p>
                        <div className="space-y-4">
                            <Button className="w-full" onClick={() => setIsSubmitted(false)}>
                                Place Another Order
                            </Button>
                            <Link to={isStaff ? "/dashboard/admin" : "/"} className="block text-primary-600 font-medium hover:underline text-sm">
                                Return to {isStaff ? "Dashboard" : "Home"}
                            </Link>
                        </div>
                    </Card>
                </div>
            </PageWrapper>
        )
    }


    return (
        <PageWrapper>

            <div className="min-h-screen bg-slate-50 flex flex-col">


                {/* PREMIUM HERO SECTION */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-indigo-950">
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] animate-blob" />
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex items-center justify-center shadow-2xl">
                                <Palette className="w-10 h-10 text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                                    Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Studio</span>
                                </h1>
                                <p className="text-blue-100/60 font-black uppercase tracking-[0.3em] text-[10px] italic">Rwanda's Premier Custom Branting Studio</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-24 w-full">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Left Column: Configuration */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Product Type Selection */}
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100 group animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <LayoutIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-indigo-950 tracking-tighter uppercase italic">1. Select Product</h2>
                                        <p className="text-xs text-slate-500 font-medium">Choose what you want to create</p>
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    {productTypes.map((product) => (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, productType: product.id }))}
                                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-500 group relative overflow-hidden ${formData.productType === product.id
                                                ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100 -translate-y-1'
                                                : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-indigo-100'
                                                }`}
                                        >
                                            <product.icon className={`w-8 h-8 mb-4 transition-all duration-500 ${formData.productType === product.id ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:text-indigo-400'
                                                }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${formData.productType === product.id ? 'text-indigo-900' : 'text-slate-500 group-hover:text-indigo-600'
                                                }`}>{product.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dimensions */}
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100 animate-fade-in-up animation-delay-200">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                                        <Ruler className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-indigo-950 tracking-tighter uppercase italic">2. Dimensions</h2>
                                        <p className="text-xs text-slate-500 font-medium">Input exact measurements in meters</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Width (m)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="width"
                                            value={formData.width}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 2.40"
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition-all font-bold text-indigo-950 placeholder:text-slate-300"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Height (m)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 1.20"
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition-all font-bold text-indigo-950 placeholder:text-slate-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 p-6 bg-indigo-950 rounded-[2rem] flex items-center justify-between border border-white/10 shadow-xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Total Computed Area</span>
                                            <span className="text-2xl font-black text-white">{totalArea} m²</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Design Customization & Preview */}
                            <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100 animate-fade-in-up animation-delay-400">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100">
                                        <Palette className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-indigo-950 tracking-tighter uppercase italic">3. Customization</h2>
                                        <p className="text-xs text-slate-500 font-medium">Style your design concept</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                    {/* Controls */}
                                    <div className="space-y-8">
                                        {/* Color Palette */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Background</label>
                                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                                    <input type="color" name="bgColor" value={formData.bgColor} onChange={handleInputChange} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none appearance-none" />
                                                    <span className="text-xs font-black text-indigo-950 uppercase">{formData.bgColor}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Text Color</label>
                                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                                                    <input type="color" name="textColor" value={formData.textColor} onChange={handleInputChange} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none appearance-none" />
                                                    <span className="text-xs font-black text-indigo-950 uppercase">{formData.textColor}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Typography Grid */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Typography Style</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-indigo-600 uppercase italic">Font Size:</span>
                                                    <span className="text-xs font-black text-indigo-950">{formData.fontSize}px</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {FONT_STYLES.map(font => (
                                                    <button
                                                        key={font.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, fontStyle: font.value }))}
                                                        className={`flex-1 py-4 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${formData.fontStyle === font.value
                                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                                            : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                                                            } ${font.value}`}
                                                    >
                                                        {font.name.split(' ')[1]}
                                                    </button>
                                                ))}
                                            </div>

                                            <input
                                                type="range"
                                                name="fontSize"
                                                min="12"
                                                max="80"
                                                value={formData.fontSize}
                                                onChange={handleInputChange}
                                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                                            />
                                        </div>

                                        {/* Text Input Content */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Design Copy</label>
                                            <textarea
                                                name="textContent"
                                                value={formData.textContent}
                                                onChange={handleInputChange}
                                                placeholder="Your business name or catchphrase..."
                                                rows={3}
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition-all font-bold text-indigo-950 placeholder:text-slate-300 italic"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Premium Preview Box */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                <Monitor className="w-4 h-4" /> Conceptual Preview
                                            </label>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                            </div>
                                        </div>

                                        <div className="relative aspect-video rounded-[2.5rem] shadow-premium overflow-hidden flex items-center justify-center p-12 border border-slate-100 transition-all duration-700 bg-white group/preview">
                                            <div className="absolute inset-0 transition-colors duration-700 opacity-90 group-hover/preview:opacity-100" style={{ backgroundColor: formData.bgColor }} />

                                            {/* Subtle Background Pattern */}
                                            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                                                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />

                                            {/* Actual Text Branding */}
                                            <div className={`relative z-10 text-center transition-all duration-300 drop-shadow-sm select-none break-words w-full ${formData.fontStyle}`}
                                                style={{ color: formData.textColor, fontSize: `${formData.fontSize}px`, fontWeight: '900', lineHeight: '1.1' }}>
                                                {formData.textContent || 'Your Brand Idea'}
                                            </div>

                                            {/* Overlay Dimensions */}
                                            <div className="absolute bottom-4 inset-x-0 flex justify-center scale-90">
                                                <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black text-white/80 uppercase tracking-widest border border-white/10">
                                                    {formData.width || '2.5'}m Width
                                                </span>
                                            </div>
                                            <div className="absolute left-4 inset-y-0 flex items-center -rotate-90 scale-90">
                                                <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black text-white/80 uppercase tracking-widest border border-white/10">
                                                    {formData.height || '1.2'}m Height
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest italic opacity-60">
                                            * Studio Concept Only. Pro-layout rendered after order validation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Extras & Files */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up animation-delay-700">
                                <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100 space-y-4">
                                    <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter italic flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                        Usage Context
                                    </h3>
                                    <textarea
                                        name="usageDescription"
                                        value={formData.usageDescription}
                                        onChange={handleInputChange}
                                        placeholder="Tell us where this stays (e.g. Shop front, Outdoor billboard, Reception wall...)"
                                        rows={3}
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition-all font-bold text-indigo-950 placeholder:text-slate-300 text-sm"
                                    />
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100 space-y-4">
                                    <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter italic flex items-center gap-3">
                                        <Upload className="w-5 h-5 text-indigo-600" />
                                        Visual Assets
                                    </h3>
                                    <div className="relative group cursor-pointer">
                                        <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" accept="image/*,.pdf,.ai" />
                                        <div className={`p-8 border-2 border-dashed rounded-[2rem] text-center transition-all ${selectedFile ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-slate-100 bg-slate-50 group-hover:border-indigo-200 group-hover:bg-white'
                                            }`}>
                                            {selectedFile ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="w-8 h-8 text-indigo-600" />
                                                    <span className="text-[10px] font-black text-indigo-950 uppercase truncate max-w-[150px]">{selectedFile.name}</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Reference</p>
                                                    <p className="text-[8px] text-slate-400 font-bold">PDF, AI, PNG, JPG (MAX 10MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Design Description - Full Width */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-[2.5rem] p-10 shadow-premium border border-purple-100 space-y-4 animate-fade-in-up animation-delay-800">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 flex-shrink-0">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter italic mb-2">
                                            Design Description
                                        </h3>
                                        <p className="text-xs text-slate-600 font-medium mb-4">
                                            Provide detailed instructions for our production team. Include specific requirements, colors, logos, images, or any special requests.
                                        </p>
                                        <textarea
                                            name="designDescription"
                                            value={formData.designDescription}
                                            onChange={handleInputChange}
                                            placeholder="Example: Please include our company logo on the left side, use our brand colors (blue #2563eb and white), add our tagline 'Quality You Can Trust' below the company name, and include contact information at the bottom..."
                                            rows={5}
                                            className="w-full px-6 py-5 bg-white border-2 border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all font-medium text-indigo-950 placeholder:text-slate-400 text-sm"
                                        />
                                        <p className="text-[9px] text-purple-600 font-bold mt-2 uppercase tracking-widest italic">
                                            💡 The more details you provide, the better we can match your vision!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Right Column: Checkout Sidebar */}
                        <div className="lg:col-span-4 space-y-8 sticky top-32 animate-fade-in-up animation-delay-1000">
                            <aside className="bg-indigo-950 rounded-[3rem] shadow-premium overflow-hidden border border-white/5 relative">
                                {/* Shiny Overlay */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent border-t border-white/10 rounded-[3rem]" />

                                <div className="p-8 pb-0 flex items-center justify-between relative z-10">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter shrink-0">Order Summary</h3>
                                    <div className="px-3 py-1 bg-indigo-600 rounded-full text-[8px] font-black text-white uppercase tracking-widest animate-pulse">Live Quote</div>
                                </div>

                                <div className="p-8 space-y-8 relative z-10">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline py-3 border-b border-white/10">
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Product Item</span>
                                            <span className="text-sm font-black text-white italic">{selectedProduct.name}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline py-3 border-b border-white/10">
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Dimensions</span>
                                            <span className="text-sm font-black text-white italic">{formData.width || '0'}m × {formData.height || '0'}m</span>
                                        </div>
                                        <div className="flex justify-between items-baseline py-3">
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Scale Pricing</span>
                                            <span className="text-sm font-black text-white italic">RF {selectedProduct.pricePerSqm.toLocaleString()} <span className="text-[8px] opacity-40 uppercase tracking-[0.1em]">/ m²</span></span>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center space-y-2 group/price shadow-2xl">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic block">Estimated Investment</span>
                                        <div className="text-5xl font-black text-white tracking-tighter leading-none group-hover/price:scale-105 transition-transform duration-500">
                                            <span className="text-xl opacity-40 italic mr-1">RWF</span>
                                            {estimatedPrice.toLocaleString()}
                                        </div>
                                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest pt-4 leading-relaxed">Final price validated after studio file review.</p>
                                    </div>

                                    {/* Customer Inputs */}
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <User className="absolute left-5 top-5 w-5 h-5 text-white/20" />
                                            <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="Your Full Name" className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:ring-2 focus:ring-indigo-600 placeholder:text-white/20 transition-all" required />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-5 w-5 h-5 text-white/20" />
                                            <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} placeholder="Contact Number" className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:ring-2 focus:ring-indigo-600 placeholder:text-white/20 transition-all" required />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-5 w-5 h-5 text-white/20" />
                                            <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} placeholder="Email Address" className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:ring-2 focus:ring-indigo-600 placeholder:text-white/20 transition-all" required />
                                        </div>
                                        <div className="relative">
                                            <LocateFixed className="absolute left-5 top-5 w-5 h-5 text-white/20" />
                                            <input type="text" name="customerLocation" value={formData.customerLocation} onChange={handleInputChange} placeholder="Project Location" className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:ring-2 focus:ring-indigo-600 placeholder:text-white/20 transition-all" required />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-6 bg-white text-indigo-950 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Initiating Studio...' : 'Finalize Request'}
                                    </button>

                                    <div className="flex items-center justify-center gap-3 py-2 opacity-40">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Secure Production Pipeline</span>
                                    </div>
                                </div>
                            </aside>

                            {/* Support Micro-card */}
                            <div className="p-6 bg-white rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm group hover:border-indigo-200 transition-colors">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-indigo-600 group-hover:animate-bounce" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-indigo-950 uppercase italic tracking-tighter leading-none">Studio Hotlink</h4>
                                    <p className="text-[10px] font-bold text-indigo-600">+250 788 123 456</p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </PageWrapper>
    )
}

