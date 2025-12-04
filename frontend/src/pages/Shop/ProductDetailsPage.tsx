import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { fetchProduct } from '@/api/apiClient'
import { Product } from '@/contexts/CartContext'
import { 
    ArrowLeft, 
    ShoppingCart, 
    Package, 
    CheckCircle2, 
    Star,
    Loader2,
    Plus,
    Minus
} from 'lucide-react'
import { toast } from 'react-toastify'

// Helper to get full image URL
const getImageUrl = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `http://localhost:3000${path}`
}

// Category color mapping
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

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        if (id) {
            loadProduct()
        }
    }, [id])

    const loadProduct = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await fetchProduct(id!)
            // Transform the data to match Product type
            const productData: Product = {
                id: data.id.toString(),
                name: data.name,
                description: data.description || '',
                price: Number(data.price),
                image: data.image,
                category: data.category || 'Uncategorized',
                stock_quantity: data.stock_quantity || 0
            }
            setProduct(productData)
        } catch (err: any) {
            setError(err.message || 'Failed to load product')
            console.error('Error loading product:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = () => {
        if (!product) return

        // Add the product multiple times based on quantity
        for (let i = 0; i < quantity; i++) {
            addToCart(product)
        }

        toast.success(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart!`, {
            position: 'bottom-right',
            autoClose: 2000,
        })
    }

    const increaseQuantity = () => {
        if (product && quantity < (product.stock_quantity || 999)) {
            setQuantity(quantity + 1)
        }
    }

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const categoryColors = getCategoryColor(product.category || 'Other')
    const hasImage = product.image && !imageError
    const imageUrl = getImageUrl(product.image || '')
    const inStock = (product.stock_quantity || 0) > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Products
                </Link>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-8 p-8">
                        {/* Product Image */}
                        <div className="relative">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                {hasImage && imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                                            <div className="relative bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-lg">
                                                <Package className="w-24 h-24 text-gray-400" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col justify-between">
                            <div>
                                {/* Category Badge */}
                                <div className="mb-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border text-sm font-semibold rounded-full`}>
                                        <div className={`w-2 h-2 rounded-full ${categoryColors.text.replace('text-', 'bg-')}`} />
                                        {product.category || 'Uncategorized'}
                                    </span>
                                </div>

                                {/* Product Name */}
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-5xl font-bold text-gray-900">
                                        {product.price.toLocaleString('en-RW')} RF
                                    </span>
                                </div>

                                {/* Stock Status */}
                                <div className="mb-6">
                                    {inStock ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium">
                                                In Stock ({product.stock_quantity} available)
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                            <Package className="w-5 h-5" />
                                            <span className="font-medium">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {product.description || 'No description available for this product.'}
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Features</h2>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span>High Quality Materials</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span>Professional Design</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span>Fast Delivery</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <span>Customer Support</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Add to Cart Section */}
                            <div className="border-t pt-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={decreaseQuantity}
                                            disabled={quantity <= 1}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-16 text-center text-lg font-semibold">{quantity}</span>
                                        <button
                                            onClick={increaseQuantity}
                                            disabled={!inStock || quantity >= (product.stock_quantity || 999)}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!inStock}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>

                                {!inStock && (
                                    <p className="text-sm text-gray-500 text-center mt-3">
                                        This product is currently out of stock. Please check back later.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

