import { useState, useEffect } from 'react'
import {
    Plus,
    Search,
    Filter,
    Edit,
    Edit3,
    Trash2,
    Package,
    Grid,
    List,
    Layers,
    ShoppingCart,
    CheckCircle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getImageUrl,
    approveProduct
} from '@/api/apiClient'
import ProductFormModal from '@/components/ecommerce/ProductFormModal'
import { formatCurrency } from '@/utils/formatters'
import { toast } from 'react-toastify'

export default function ProductsPage() {
    const [view, setView] = useState('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showFormModal, setShowFormModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)

    const loadProducts = async () => {
        try {
            setLoading(true)
            const data = await fetchProducts()
            setProducts(data || [])
        } catch (err: any) {
            toast.error(err.message || 'Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [])

    const handleCreateOrUpdate = async (productData: any) => {
        try {
            if (selectedProduct) {
                await updateProduct(selectedProduct.id, productData)
                toast.success('Product updated successfully')
            } else {
                await createProduct(productData)
                toast.success('Product created successfully')
            }
            setShowFormModal(false)
            setSelectedProduct(null)
            loadProducts()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save product')
        }
    }

    const handleDelete = async (id: number | string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return
        try {
            await deleteProduct(id)
            toast.success('Product deleted')
            loadProducts()
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete product')
        }
    }

    const handleApprove = async (id: number | string) => {
        try {
            await approveProduct(id)
            toast.success('Product approved and live!')
            loadProducts()
        } catch (err: any) {
            toast.error(err.message || 'Failed to approve product')
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-500 text-sm">Manage your e-commerce catalog and store items.</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedProduct(null)
                            setShowFormModal(true)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                    >
                        <Plus size={18} />
                        Add New Product
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Products', val: products.length, color: 'blue', icon: Package },
                        { label: 'Out of Stock', val: products.filter(p => p.stock_quantity <= 0).length, color: 'red', icon: Layers },
                        { label: 'Total Value', val: formatCurrency(products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0)), color: 'green', icon: ShoppingCart },
                        { label: 'Top Categories', val: new Set(products.map(p => p.category)).size, color: 'purple', icon: Grid },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg bg-${stat.color === 'blue' ? 'blue' : stat.color === 'red' ? 'red' : stat.color === 'green' ? 'emerald' : 'purple'}-50 flex items-center justify-center text-${stat.color === 'blue' ? 'blue' : stat.color === 'red' ? 'red' : stat.color === 'green' ? 'emerald' : 'purple'}-600`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-lg font-bold text-gray-900">{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products by name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50">
                            <Filter size={18} />
                        </button>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setView('grid')}
                                className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Grid/List */}
                {loading ? (
                    <div className="py-20 text-center text-gray-500">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No products found for "{searchQuery}"</p>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 overflow-hidden flex flex-col"
                            >
                                {/* Product Image */}
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                            <Package size={40} strokeWidth={1} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                        </div>
                                    )}

                                    {/* Category Tag */}
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-gray-700 border border-white shadow-sm uppercase tracking-wider">
                                        {product.category || 'General'}
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                        {product.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(product.id)}
                                                className="p-2.5 bg-emerald-600 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                                                title="Approve & List"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setSelectedProduct(product); setShowFormModal(true); }}
                                            className="p-2.5 bg-white text-emerald-600 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                            title="Edit Product"
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2.5 bg-white text-red-500 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                            title="Delete Product"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate flex-1" title={product.name}>
                                                {product.name}
                                            </h3>
                                            {product.status === 'pending' && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded">Pending</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1">{product.description || 'No description provided.'}</p>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Price</span>
                                            <span className="text-base font-black text-gray-900 tracking-tight">{formatCurrency(product.price)}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Stock</span>
                                            <span className={`text-xs font-bold ${product.stock_quantity > 0 ? 'text-gray-700' : 'text-red-500'}`}>
                                                {product.stock_quantity} units
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View for List */
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {p.image ? (
                                                        <img src={getImageUrl(p.image)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={16} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{p.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                                                {p.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm text-gray-700">{p.stock_quantity}</td>
                                        <td className="px-6 py-4 font-bold text-sm text-emerald-600">{formatCurrency(p.price)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {p.status === 'pending' && (
                                                    <button onClick={() => handleApprove(p.id)} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg" title="Approve"><CheckCircle size={16} /></button>
                                                )}
                                                <button onClick={() => { setSelectedProduct(p); setShowFormModal(true); }} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Product Form Modal */}
            <ProductFormModal
                isOpen={showFormModal}
                onClose={() => { setShowFormModal(false); setSelectedProduct(null); }}
                onSubmit={handleCreateOrUpdate}
                initialData={selectedProduct || undefined}
                title={selectedProduct ? 'Edit Product' : 'Create New Product'}
                subtitle={selectedProduct ? 'Update existing product details' : 'Add a new item to your catalog'}
            />
        </DashboardLayout>
    )
}
