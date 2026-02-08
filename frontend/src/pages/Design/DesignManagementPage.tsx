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
    ShoppingCart,
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
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/inventory/products`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors shadow-sm"
                        >
                            <ShoppingCart size={18} />
                            Product Catalog
                        </button>
                        <button
                            onClick={() => setShowProductModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Package size={18} />
                            Add Product
                        </button>
                        <button
                            onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio`)}
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
                <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
                    {designs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                        view === 'grid' ? (
                            <div
                                key={item.id}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                {/* Image Workspace */}
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden group">
                                    {item.preview_url ? (
                                        <img
                                            src={getImageUrl(item.preview_url)}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                            <Layers size={40} strokeWidth={1.5} className="opacity-20" />
                                            <span className="text-xs font-medium">No Preview Available</span>
                                        </div>
                                    )}

                                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${getStatusStyle(item.status)}`}>
                                        {item.status?.replace('_', ' ')}
                                    </div>

                                    {/* Hover Overlay Actions */}
                                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => { setSelectedDesign(item); setPreviewOpen(true); }}
                                            className="p-2.5 bg-white text-indigo-600 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                            title="Preview"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${item.id}`)}
                                            className="p-2.5 bg-white text-gray-700 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                            title="Edit"
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 truncate pr-2" title={item.title}>{item.title}</h3>
                                        <span className="text-xs font-mono text-gray-400">#{item.id}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{item.category}</span>
                                        {item.material && (
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase truncate max-w-[100px]" title={item.material}>
                                                {item.material}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Price</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {Number(item.price) > 0 ? formatCurrency(item.price) : '---'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {isAdmin && item.status !== 'published' && (
                                                <button
                                                    onClick={() => handleApprove(item.id, item.price)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group/btn"
                                                    title="Approve & List Product"
                                                >
                                                    <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
                                    {isAdmin && item.status !== 'published' && (
                                        <button
                                            onClick={() => handleApprove(item.id, item.price)}
                                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Approve & List Product"
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                    )}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedDesign.title}</h2>
                                <p className="text-sm text-gray-500 font-medium">{selectedDesign.category} • {selectedDesign.width}x{selectedDesign.height}{selectedDesign.unit}</p>
                            </div>
                            <button
                                onClick={() => setPreviewOpen(false)}
                                className="p-2.5 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8 flex items-center justify-center">
                            {selectedDesign.preview_url ? (
                                <img
                                    src={getImageUrl(selectedDesign.preview_url)}
                                    className="max-h-[65vh] w-auto object-contain shadow-2xl rounded-xl border-4 border-white"
                                    alt="Full Preview"
                                />
                            ) : (
                                <div className="text-center space-y-4 py-20">
                                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-gray-200">
                                        <Layers size={48} />
                                    </div>
                                    <p className="text-gray-500 font-medium">Detailed image preview not available</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Specifications</span>
                                    <span className="text-sm font-bold text-gray-700">{selectedDesign.colors} • {selectedDesign.material || 'Standard'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price Quote</span>
                                    <span className="text-sm font-black text-indigo-600">{Number(selectedDesign.price) > 0 ? formatCurrency(selectedDesign.price) : 'Pending Approval'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setPreviewOpen(false)}
                                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-colors border border-gray-200"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setPreviewOpen(false);
                                        navigate(`${location.pathname.includes('admin') ? '/dashboard/admin' : '/dashboard/staff'}/design/studio/${selectedDesign.id}`);
                                    }}
                                    className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit3 size={18} />
                                    Edit Design
                                </button>
                            </div>
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