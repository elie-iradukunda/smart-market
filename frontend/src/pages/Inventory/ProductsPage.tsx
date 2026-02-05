import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchProducts, createProduct, updateProduct } from '@/api/apiClient'
import { Plus, Edit, Package, Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ProductFormModal from '@/components/ecommerce/ProductFormModal'

// Helper to get full image URL
const getImageUrl = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `http://localhost:3000${path}`
}

// Category color mapping for better visual distinction
const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        'Banners': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
        'Printing': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
        'Design': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
        'Garments': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
        'Signage': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
        'Promotional': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    }
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }
}

// Product Row Component
interface ProductRowProps {
    product: any
    onEdit: (product: any) => void
    onPromote: (product: any) => void
}

const ProductRow: React.FC<ProductRowProps> = ({ product, onEdit, onPromote }) => {
    const [imageError, setImageError] = useState(false)
    const categoryColors = getCategoryColor(product.category || 'Other')
    const hasImage = product.image && !imageError
    const imageUrl = getImageUrl(product.image || '')

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {hasImage && imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
                                <Package className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                            </div>
                        )}
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {product.category ? (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border text-xs font-semibold rounded-full`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${categoryColors.text.replace('text-', 'bg-')}`} />
                        {product.category}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400 italic">Uncategorized</span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">RF {Number(product.price).toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock_quantity}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => onPromote(product)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Promote Product"
                    >
                        <Megaphone size={16} />
                        <span className="text-xs">Promote</span>
                    </button>
                    <button onClick={() => onEdit(product)} className="text-blue-600 hover:text-blue-900 border p-2 rounded-lg hover:bg-gray-50 border-gray-100">
                        <Edit size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            setLoading(true)
            const data = await fetchProducts()
            setProducts(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (product: any) => {
        setSelectedProductId(product.id)
        setShowAddModal(true)
    }

    const handleCreateOrUpdate = async (productData: any) => {
        try {
            if (selectedProductId) {
                await updateProduct(selectedProductId, productData)
            } else {
                await createProduct(productData)
            }
            setShowAddModal(false)
            setSelectedProductId(null)
            loadProducts()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handlePromote = (product: any) => {
        // Find the correct marketing route based on current path
        const currentPath = window.location.pathname;
        let marketingPath = '/dashboard/admin/marketing/campaigns';

        if (currentPath.includes('/dashboard/sales')) {
            marketingPath = '/dashboard/sales/marketing/campaigns';
        }

        navigate(`${marketingPath}?productId=${product.id}&template=launch`);
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        setSelectedProductId(null)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-sm text-gray-500">Manage your e-commerce product catalog</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedProductId(null)
                            setShowAddModal(true)
                        }}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>

                {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Product List */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No products found</td></tr>
                            ) : (
                                products.map((product) => (
                                    <ProductRow key={product.id} product={product} onEdit={handleEdit} onPromote={handlePromote} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Product Form Modal */}
                <ProductFormModal
                    isOpen={showAddModal}
                    onClose={handleCloseModal}
                    onSubmit={handleCreateOrUpdate}
                    initialData={selectedProductId ? products.find(p => p.id === selectedProductId) : undefined}
                    title={selectedProductId ? 'Edit Product' : 'Create New Product'}
                    subtitle={selectedProductId ? 'Update existing product details' : 'Add a new item to your catalog'}
                />
            </div>
        </DashboardLayout>
    )
}
