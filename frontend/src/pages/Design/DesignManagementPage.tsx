// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit3,
    Trash2,
    Grid,
    List,
    Layers,
    Clock,
    CheckCircle,
    ShoppingBag,
    Printer,
    ArrowUpRight,
    X,
    Maximize2,
    Package
} from 'lucide-react'
import ProductFormModal from '@/components/ecommerce/ProductFormModal'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/utils/formatters'
import { fetchDesigns, approveDesign, deleteDesign, getImageUrl, createProduct } from '@/api/apiClient'
import { getAuthUser } from '@/utils/apiClient'
import { toast } from 'react-toastify'

export default function DesignManagementPage() {
    const navigate = useNavigate()
    const [view, setView] = useState('grid')
    const [searchQuery, setSearchQuery] = useState('')

    const [designs, setDesigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDesign, setSelectedDesign] = useState(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [showProductModal, setShowProductModal] = useState(false)
    const user = getAuthUser()
    const isAdmin = user?.role_id === 1

    const loadDesigns = () => {
        setLoading(true)
        fetchDesigns()
            .then(data => setDesigns(data || []))
            .catch(err => toast.error('Failed to load designs'))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadDesigns()
    }, [])

    const handleApprove = async (id, currentPrice) => {
        let finalPrice = currentPrice

        // If price is 0, prompt the admin to set it
        if (!currentPrice || Number(currentPrice) === 0) {
            const input = window.prompt('Design has no price. Set professional price (RF):', '8000')
            if (input === null) return // user cancelled
            finalPrice = Number(input)
        }

        // Ask if they want to publish as product
        const publishAsProduct = window.confirm(
            'Do you want to publish this design as a purchasable product in the e-commerce store?\n\n' +
            'Click OK to make it available for clients to buy, or Cancel to only approve the design.'
        )

        try {
            await approveDesign(id, finalPrice, publishAsProduct)
            toast.success(
                publishAsProduct
                    ? 'Design approved and published as product!'
                    : 'Design approved!'
            )
            loadDesigns()
        } catch (err) {
            toast.error(err.message || 'Failed to approve design')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this design?')) return
        try {
            await deleteDesign(id)
            toast.success('Design deleted')
            loadDesigns()
        } catch (err) {
            toast.error('Failed to delete design')
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'published': return 'bg-green-50 text-green-700 border-green-100'
            case 'draft': return 'bg-gray-50 text-gray-700 border-gray-100'
            case 'pending_review': return 'bg-amber-50 text-amber-700 border-amber-100'
            case 'rejected': return 'bg-red-50 text-red-700 border-red-100'
            default: return 'bg-blue-50 text-blue-700 border-blue-100'
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-10">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Design & Creative Hub</h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage professional designs, client orders, and ready-to-print assets.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowProductModal(true)}
                            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-sm"
                        >
                            <Package size={20} />
                            Add Product
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/admin/design/studio')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            <Plus size={20} />
                            Create New Design
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pending Designs', val: '12', color: 'orange', icon: Clock },
                        { label: 'Published Assets', val: '48', color: 'green', icon: CheckCircle },
                        { label: 'Active Orders', val: '08', color: 'blue', icon: ShoppingBag },
                        { label: 'Print Jobs', val: '05', color: 'purple', icon: Printer },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search designs, categories, or designers..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors border border-gray-50">
                            <Filter size={20} />
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2" />
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"}>
                    {designs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        view === 'grid' ? (
                            <div key={item.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                <div className="aspect-[4/3] bg-gray-100 relative group overflow-hidden">
                                    <img src={getImageUrl(item.preview_url)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <div className="flex flex-col gap-2 w-full">
                                            {isAdmin && item.status === 'pending_review' && (
                                                <button
                                                    onClick={() => handleApprove(item.id, item.price)}
                                                    className="w-full bg-green-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors shadow-lg"
                                                >
                                                    Approve & Publish
                                                </button>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setSelectedDesign(item); setPreviewOpen(true); }}
                                                    className="flex-1 bg-white/20 backdrop-blur-md text-white py-2 rounded-xl text-xs font-bold hover:bg-white hover:text-black transition-colors"
                                                >
                                                    Preview
                                                </button>
                                                <button onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${item.id}`)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                                                    <Edit3 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase border backdrop-blur-md ${getStatusStyle(item.status)}`}>
                                        {item.status?.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{item.category}</p>
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-green-600 font-bold mt-1">RF {Number(item.price).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-bold text-gray-400 font-mono">{item.width}x{item.height}{item.unit === 'meters' ? 'm' : item.unit}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400">{item.designer_name || 'Designer'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={item.id} className="bg-white flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                                <img
                                    src={getImageUrl(item.preview_url)}
                                    className="w-16 h-16 rounded-xl object-cover cursor-pointer"
                                    onClick={() => { setSelectedDesign(item); setPreviewOpen(true); }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                                    <p className="text-xs text-gray-500">{item.category} • {item.width}x{item.height}{item.unit === 'meters' ? 'm' : item.unit}</p>
                                </div>
                                <div className="text-right px-4">
                                    <p className="text-sm font-bold text-green-600">RF {Number(item.price).toLocaleString()}</p>
                                </div>
                                <div className="hidden md:block px-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(item.status)}`}>
                                        {item.status?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-right px-4 hidden sm:block">
                                    <p className="text-xs font-bold text-gray-900">{item.designer_name || 'Designer'}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {isAdmin && item.status === 'pending_review' && (
                                        <button onClick={() => handleApprove(item.id, item.price)} className="p-2 hover:bg-green-50 text-green-600 rounded-xl transition-colors" title="Approve">
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    <button onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${item.id}`)} className="p-2 hover:bg-gray-100 text-indigo-600 rounded-xl transition-colors">
                                        <Edit3 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-xl transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {/* Preview Modal */}
                {previewOpen && selectedDesign && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                        <button
                            onClick={() => setPreviewOpen(false)}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="max-w-5xl w-full flex flex-col items-center gap-6">
                            <div className="relative group overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl">
                                <img
                                    src={getImageUrl(selectedDesign.preview_url)}
                                    className="max-h-[70vh] object-contain"
                                    alt="Full Preview"
                                />
                            </div>

                            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedDesign.title}</h2>
                                    <p className="text-gray-500 font-medium">{selectedDesign.category} • {selectedDesign.width}x{selectedDesign.height}{selectedDesign.unit}</p>
                                    <p className="text-indigo-600 font-bold mt-1">{selectedDesign.material}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isAdmin && selectedDesign.status === 'pending_review' && (
                                        <button
                                            onClick={() => { handleApprove(selectedDesign.id, selectedDesign.price); setPreviewOpen(false); }}
                                            className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
                                        >
                                            <CheckCircle size={20} />
                                            Approve Now
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${selectedDesign.id}`)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                                    >
                                        <Edit3 size={20} />
                                        Edit Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {designs.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="text-gray-300 w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No designs found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mt-2">Start by creating your first professional design asset or checking pending orders.</p>
                        <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 mx-auto">
                            <Plus size={20} />
                            Create New Design
                        </button>
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
            <ProductFormModal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                onSubmit={async (data) => {
                    await createProduct(data)
                    toast.success('Product created successfully and added to store!')
                    setShowProductModal(false)
                }}
                title="Create Store Product"
                subtitle="Add a ready-made product to your shop catalog directly."
            />

        </DashboardLayout>
    )
}
