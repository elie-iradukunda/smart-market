import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchProducts, createProduct, updateProduct, uploadProductImage } from '@/api/apiClient'
import { Plus, Edit, Package, Upload, X, Image as ImageIcon } from 'lucide-react'

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
}

const ProductRow: React.FC<ProductRowProps> = ({ product, onEdit }) => {
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
                <button onClick={() => onEdit(product)} className="text-blue-600 hover:text-blue-900 ml-4">
                    <Edit size={18} />
                </button>
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

    const [imagePreview, setImagePreview] = useState<string>('')

    // New product form state
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        image: ''
    })

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

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            try {
                // Create preview
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                }
                reader.readAsDataURL(file)

                // Upload to server
                const response = await uploadProductImage(file)
                // Store the server URL
                setNewProduct({ ...newProduct, image: response.imageUrl })
            } catch (error: any) {
                alert('Failed to upload image: ' + error.message)
            }
        }
    }

    const removeImage = () => {
        setImagePreview('')
        setNewProduct({ ...newProduct, image: '' })
    }

    const handleEdit = (product: any) => {
        setSelectedProductId(product.id)
        setNewProduct({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category || '',
            stock_quantity: product.stock_quantity,
            image: product.image || ''
        })
        if (product.image) {
            setImagePreview(getImageUrl(product.image))
        } else {
            setImagePreview('')
        }
        setShowAddModal(true)
    }

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const productData = {
                ...newProduct,
                price: Number(newProduct.price),
                stock_quantity: Number(newProduct.stock_quantity)
            }

            if (selectedProductId) {
                await updateProduct(selectedProductId, productData)
            } else {
                await createProduct(productData)
            }

            setShowAddModal(false)
            setNewProduct({ name: '', description: '', price: '', category: '', stock_quantity: '', image: '' })
            setImagePreview('')
            setSelectedProductId(null)
            loadProducts()
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleCloseModal = () => {
        setShowAddModal(false)
        setNewProduct({ name: '', description: '', price: '', category: '', stock_quantity: '', image: '' })
        setImagePreview('')
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
                            setNewProduct({ name: '', description: '', price: '', category: '', stock_quantity: '', image: '' })
                            setImagePreview('')
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
                                    <ProductRow key={product.id} product={product} onEdit={handleEdit} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add/Edit Product Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedProductId ? 'Edit Product' : 'Add New Product'}</h2>
                            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.name}
                                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Price</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={newProduct.stock_quantity}
                                            onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <input
                                        type="text"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>

                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                    <p className="text-sm text-gray-500">Click to upload image</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            <div className="text-center text-sm text-gray-500">or</div>
                                            <input
                                                type="text"
                                                value={newProduct.image}
                                                onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                                placeholder="Paste image URL"
                                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                    >
                                        {selectedProductId ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
