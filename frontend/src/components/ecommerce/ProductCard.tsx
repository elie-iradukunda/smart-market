import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Product } from '@/contexts/CartContext'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Package, Eye } from 'lucide-react'
import { toast } from 'react-toastify'

interface ProductCardProps {
    product: Product
}

// Helper to get full image URL
const getImageUrl = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `http://localhost:3000${cleanPath}`
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

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart()
    const navigate = useNavigate()
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    const categoryColors = getCategoryColor(product.category || 'Other')
    const hasImage = product.image && !imageError
    const imageUrl = getImageUrl(product.image || '')

    const handleAddToCart = () => {
        addToCart(product)
        toast.success(`${product.name} added to cart!`, {
            position: 'bottom-right',
            autoClose: 2000,
        })
    }

    const handleViewDetails = () => {
        navigate(`/products/${product.id}`)
    }

    const handleImageError = () => {
        setImageError(true)
        setImageLoading(false)
    }

    const handleImageLoad = () => {
        setImageLoading(false)
    }

    return (
        <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {hasImage && imageUrl ? (
                    <>
                        {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                            loading="lazy"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
                                <Package className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Badge - Enhanced Design */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border text-xs font-semibold rounded-full shadow-md backdrop-blur-sm`}>
                        <div className={`w-2 h-2 rounded-full ${categoryColors.text.replace('text-', 'bg-')}`} />
                        {product.category || 'Uncategorized'}
                    </span>
                </div>

                {/* View Details Button - Eye Icon */}
                <button
                    onClick={handleViewDetails}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 group/eye"
                    aria-label="View product details"
                >
                    <Eye className="w-5 h-5 text-gray-700 group-hover/eye:text-blue-600 transition-colors" />
                </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                    {product.description}
                </p>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-900">
                            {product.price.toLocaleString('en-RW')} RF
                        </span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">Add to Cart</span>
                    </button>
                </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 border-2 border-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    )
}
