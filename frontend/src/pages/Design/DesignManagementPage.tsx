// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
    const location = useLocation()
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

        if (!currentPrice || Number(currentPrice) === 0) {
            const input = window.prompt('Design has no price. Set professional price (RF):', '8000')
            if (input === null) return 
            finalPrice = Number(input)
        }

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
            case 'published': return 'bg-green-50 text-green-700 border-green-200'
            case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200'
            case 'pending_review': return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200'
            default: return 'bg-blue-50 text-blue-700 border-blue-200'
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Design Management</h1>
                        <p className="text-gray-500 text-sm">Manage assets and client orders.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowProductModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Package size={18} />
                            Add Product
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/admin/design/studio')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            <Plus size={18} />
                            Create New Design
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Pending', val: '12', color: 'orange', icon: Clock },
                        { label: 'Published', val: '48', color: 'green', icon: CheckCircle },
                        { label: 'Orders', val: '08', color: 'blue', icon: ShoppingBag },
                        { label: 'Print Jobs', val: '05', color: 'purple', icon: Printer },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search designs..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200">
                            <Filter size={18} />
                        </button>
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white border border-gray-200 text-indigo-600' : 'text-gray-500'}`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white border border-gray-200 text-indigo-600' : 'text-gray-500'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
                    {designs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        view === 'grid' ? (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-colors hover:border-gray-300">
                                <div className="aspect-video bg-gray-50 relative border-b border-gray-100">
                                    <img src={getImageUrl(item.preview_url)} alt={item.title} className="w-full h-full object-cover" />
                                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusStyle(item.status)}`}>
                                        {item.status?.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{item.category}</p>
                                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">RF {Number(item.price).toLocaleString()}</p>
                                    
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                        <p className="text-[10px] text-gray-500 font-medium">{item.width}x{item.height}{item.unit}</p>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => { setSelectedDesign(item); setPreviewOpen(true); }}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${item.id}`)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            {isAdmin && item.status === 'pending_review' && (
                                                <button 
                                                    onClick={() => handleApprove(item.id, item.price)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={item.id} className="bg-white flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                                <img
                                    src={getImageUrl(item.preview_url)}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                    alt=""
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                                    <p className="text-[11px] text-gray-500">{item.category} • {item.width}x{item.height}{item.unit}</p>
                                </div>
                                <div className="hidden md:block">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusStyle(item.status)}`}>
                                        {item.status?.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-right px-2">
                                    <p className="text-sm font-bold text-gray-900">RF {Number(item.price).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                                    <button onClick={() => { setSelectedDesign(item); setPreviewOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600">
                                        <Eye size={16} />
                                    </button>
                                    <button onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${item.id}`)} className="p-2 text-gray-400 hover:text-indigo-600">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {/* Empty State */}
                {designs.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                        <Layers className="text-gray-300 w-12 h-12 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-900">No designs available</h3>
                        <p className="text-xs text-gray-500 mt-1">Start by creating your first professional asset.</p>
                    </div>
                )}
            </div>

            {/* Simple Modal Backdrop */}
            {previewOpen && selectedDesign && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">{selectedDesign.title}</h2>
                            <button onClick={() => setPreviewOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50 flex justify-center">
                            <img
                                src={getImageUrl(selectedDesign.preview_url)}
                                className="max-h-[60vh] object-contain border border-gray-200 rounded-lg"
                                alt="Preview"
                            />
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                            <button 
                                onClick={() => setPreviewOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${selectedDesign.id}`)}
                                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Edit Design
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ProductFormModal
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                onSubmit={async (data) => {
                    await createProduct(data)
                    toast.success('Product created successfully!')
                    setShowProductModal(false)
                }}
                title="Create Store Product"
                subtitle="Add a ready-made product to your shop catalog."
            />
        </DashboardLayout>
    )
}