// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
    Layout,
    Maximize2,
    Upload,
    Save,
    CheckCircle,
    ArrowLeft,
    FileText,
    Layers,
    Ruler,
    Palette,
    Info,
    Eye,
    Download,
    Cloud,
    AlertCircle,
    X,
    PlusCircle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { toast } from 'react-toastify'
import { createDesign, fetchDesign, updateDesign, uploadProductImage, fetchMaterials } from '@/api/apiClient'
import { getAuthUser } from '@/utils/apiClient'

export default function DesignStudioPage() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const orderId = searchParams.get('orderId')

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [materials, setMaterials] = useState([])
    const user = getAuthUser()
    const isAdmin = user?.role_id === 1

    // Design state
    const [design, setDesign] = useState({
        title: '',
        category: 'Signboard',
        width: '1',
        height: '1',
        unit: 'meters',
        selectedMaterials: ['Flex Banner'],
        colors: 'Full Color',
        notes: '',
        previewUrl: null,
        fileUrl: null,
        price: 0,
        status: 'draft'
    })

    useEffect(() => {
        // Fetch materials to get real prices
        fetchMaterials()
            .then(data => setMaterials(data || []))
            .catch(err => console.error('Failed to load materials'))

        if (id) {
            setLoading(true)
            fetchDesign(id)
                .then(data => {
                    setDesign({
                        ...data,
                        notes: data.description || ''
                    })
                })
                .catch(err => toast.error('Failed to load design data'))
                .finally(() => setLoading(false))
        }
    }, [id])

    // Removed hardcoded price calculation logic
    // Admission logic now handles price during review

    const categories = ['Banner', 'Signboard (Icyapa)', 'T-Shirt', 'Business Card', 'Flyer', 'Sticker', 'Custom']
    const materialsList = materials.length > 0 ? materials.map(m => m.name) : ['Flex Banner', 'Vinyl Sticker', 'PVC Board', 'Metal Sheet', 'Other']

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            try {
                const uploadRes = await uploadProductImage(file)
                setDesign(prev => ({
                    ...prev,
                    previewUrl: uploadRes.url,
                    preview_url: uploadRes.url
                }))
                toast.success('Design file uploaded and saved')
            } catch (err) {
                toast.error('Failed to upload file')
            }
        }
    }

    const handleSave = async (published = false) => {
        if (!design.title) {
            toast.error('Please enter a design title')
            return
        }

        setSaving(true)
        try {
            const payload = {
                ...design,
                description: design.notes,
                material: (design.selectedMaterials || []).join(', '), // Send as string for DB
                status: published ? 'pending_review' : 'draft'
            }

            if (id) {
                await updateDesign(id, payload)
            } else {
                await createDesign(payload)
            }

            toast.success(published ? 'Design submitted for Admin approval!' : 'Draft saved successfully!')
            if (published) navigate(-1)
        } catch (err) {
            toast.error(err.message || 'Failed to save design')
        } finally {
            setSaving(true)
            setSaving(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Design Studio</h1>
                            <p className="text-sm text-gray-500">
                                {orderId ? `Creating design for Order #${orderId}` : 'Create a professional product design'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Finalize & Publish
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Panel: Workspace */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preview Canvas</span>
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-mono text-gray-500">
                                        <Ruler className="w-3 h-3" />
                                        {design.width}m x {design.height}m
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-400"><Maximize2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9fa] relative group">
                                {design.previewUrl ? (
                                    <div className="relative shadow-2xl rounded-lg overflow-hidden border-4 border-white max-w-full">
                                        <img src={design.previewUrl || design.preview_url} alt="Design Preview" className="max-h-[400px] object-contain" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <button className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg"><Eye className="w-5 h-5" /></button>
                                            <label className="p-3 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform shadow-lg cursor-pointer">
                                                <Upload className="w-5 h-5" />
                                                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center max-w-xs space-y-4">
                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-indigo-600">
                                            <Cloud className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">No Design Uploaded</p>
                                            <p className="text-sm text-gray-500">Upload your work from Photoshop, Illustrator or Canva to preview and publish</p>
                                        </div>
                                        <label className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                            Select Design File
                                            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description & Notes */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-gray-900">Design Description & Notes</h3>
                            </div>
                            <textarea
                                value={design.notes}
                                onChange={(e) => setDesign({ ...design, notes: e.target.value })}
                                placeholder="Describe the design style, fonts used, or any specific instructions followed..."
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Panel: Specifications */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-2">
                                <Layout className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-gray-900">Product Specifications</h3>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Design Title *</label>
                                <input
                                    type="text"
                                    value={design.title}
                                    onChange={(e) => setDesign({ ...design, title: e.target.value })}
                                    placeholder="e.g., MTN Promo Signboard High-Res"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* Category & Material */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Category</label>
                                    <select
                                        value={design.category}
                                        onChange={(e) => setDesign({ ...design, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Materials Used</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {(design.selectedMaterials || []).map(mat => (
                                            <span key={mat} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                                                {mat}
                                                <button onClick={() => setDesign(prev => ({ ...prev, selectedMaterials: (prev.selectedMaterials || []).filter(m => m !== mat) }))}>
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <select
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value && !(design.selectedMaterials || []).includes(e.target.value)) {
                                                    setDesign(prev => ({ ...prev, selectedMaterials: [...(prev.selectedMaterials || []), e.target.value] }))
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>+ Add another material...</option>
                                            {materialsList.map(m => (
                                                <option key={m} value={m} disabled={(design.selectedMaterials || []).includes(m)}>{m}</option>
                                            ))}
                                        </select>
                                        <PlusCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Dimensions */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-gray-700 font-mono flex items-center gap-1">
                                        <Ruler className="w-3 h-3 text-gray-400" />
                                        Physical Dimensions
                                    </label>
                                    <select
                                        value={design.unit}
                                        onChange={(e) => setDesign({ ...design, unit: e.target.value })}
                                        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded"
                                    >
                                        <option value="meters">Meters</option>
                                        <option value="inches">Inches</option>
                                        <option value="cm">CM</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">W</span>
                                        <input
                                            type="number"
                                            value={design.width}
                                            onChange={(e) => setDesign({ ...design, width: e.target.value })}
                                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">H</span>
                                        <input
                                            type="number"
                                            value={design.height}
                                            onChange={(e) => setDesign({ ...design, height: e.target.value })}
                                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <Palette className="w-4 h-4 text-pink-500" />
                                    Color Profile
                                </label>
                                <input
                                    type="text"
                                    value={design.colors}
                                    onChange={(e) => setDesign({ ...design, colors: e.target.value })}
                                    placeholder="CMYK, Full Color, B&W..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            {/* Admin Price Input */}
                            {isAdmin && (
                                <div className="space-y-2 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <label className="text-sm font-bold text-indigo-900 flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        Set Professional Price (RF)
                                    </label>
                                    <input
                                        type="number"
                                        value={design.price}
                                        onChange={(e) => setDesign({ ...design, price: e.target.value })}
                                        placeholder="Enter final price for client..."
                                        className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700"
                                    />
                                    <p className="text-[10px] text-indigo-500 font-medium">As Admin, you set the final price before publishing.</p>
                                </div>
                            )}
                        </div>

                        {/* Design Info Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 space-y-4">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 opacity-80" />
                                <h4 className="font-bold">Designer Tip</h4>
                            </div>
                            <p className="text-sm opacity-90 leading-relaxed font-medium">
                                Professional designs for signboards (ibyapa) should always be saved in high resolution (300 DPI) to maintain clarity when scaled to large sizes like {design.width}x{design.height} meters.
                            </p>
                        </div>

                        {/* Quick Summary View */}
                        <div className="p-5 border border-dashed border-gray-200 rounded-3xl space-y-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
                                <span>Summary</span>
                                <Layers className="w-3 h-3" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Surface Area:</span>
                                    <span className="font-bold text-gray-900">{(Number(design.width) * Number(design.height)).toFixed(2)} sq/{design.unit === 'meters' ? 'm' : design.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Official Price:</span>
                                    <span className="font-bold text-green-600">{Number(design.price) > 0 ? `RF ${Number(design.price).toLocaleString()}` : 'Price Pending Approval'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Target Material:</span>
                                    <span className="font-bold text-indigo-600 truncate ml-4">{(design.selectedMaterials || []).join(' + ') || 'None'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
