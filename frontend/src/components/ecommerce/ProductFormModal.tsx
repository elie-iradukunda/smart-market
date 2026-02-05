import React, { useState, useEffect } from 'react'
import { Package, Upload, X, Megaphone } from 'lucide-react'
import { uploadProductImage } from '@/api/apiClient'

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (productData: any) => Promise<void>
    initialData?: any
    title?: string
    subtitle?: string
}

export default function ProductFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title = 'Create New Product',
    subtitle = 'Add a new item to your catalog'
}: ProductFormModalProps) {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        image: ''
    })
    const [imagePreview, setImagePreview] = useState<string>('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialData) {
            setProduct({
                name: initialData.name || '',
                description: initialData.description || '',
                price: initialData.price || '',
                category: initialData.category || '',
                stock_quantity: initialData.stock_quantity || '',
                image: initialData.image || ''
            })
            if (initialData.image) {
                // Determine if it's a full URL or relative path
                const imgUrl = initialData.image.startsWith('http')
                    ? initialData.image
                    : `http://localhost:3000${initialData.image.startsWith('/') ? '' : '/'}${initialData.image}`;
                setImagePreview(imgUrl)
            } else {
                setImagePreview('')
            }
        } else {
            // Reset form
            setProduct({
                name: '',
                description: '',
                price: '',
                category: '',
                stock_quantity: '',
                image: ''
            })
            setImagePreview('')
        }
    }, [initialData, isOpen])

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
                setProduct(prev => ({ ...prev, image: response.imageUrl }))
            } catch (error: any) {
                alert('Failed to upload image: ' + error.message)
            }
        }
    }

    const removeImage = () => {
        setImagePreview('')
        setProduct(prev => ({ ...prev, image: '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit({
                ...product,
                price: Number(product.price),
                stock_quantity: Number(product.stock_quantity)
            })
            onClose()
        } catch (error) {
            console.error(error)
            // Error handling should be done by parent or we can alert here
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {subtitle}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Basic Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            Basic Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Premium Business Cards"
                                    value={product.name}
                                    onChange={e => setProduct({ ...product, name: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    value={product.description}
                                    onChange={e => setProduct({ ...product, description: e.target.value })}
                                    placeholder="Describe the product features and benefits..."
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[100px]"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Stationery"
                                    value={product.category}
                                    onChange={e => setProduct({ ...product, category: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Inventory Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Megaphone className="w-5 h-5 text-emerald-600" />
                            Pricing & Inventory
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (RF)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">RF</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={product.price}
                                        onChange={e => setProduct({ ...product, price: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 pl-12 pr-4 py-3 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={product.stock_quantity}
                                    onChange={e => setProduct({ ...product, stock_quantity: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Upload className="w-5 h-5 text-purple-600" />
                            Product Imagery
                        </h3>

                        <div>
                            {imagePreview ? (
                                <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="px-4 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors shadow-lg transform hover:scale-105"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-12 h-12 mb-3 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform text-blue-600">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <p className="mb-2 text-sm text-gray-500 group-hover:text-blue-700 font-medium">Click to upload image</p>
                                            <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Or</span>
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm">URL</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={product.image}
                                            onChange={e => setProduct({ ...product, image: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                            className="block w-full rounded-xl border border-gray-200 pl-12 pr-4 py-3 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t border-gray-100 flex justify-end gap-3 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
