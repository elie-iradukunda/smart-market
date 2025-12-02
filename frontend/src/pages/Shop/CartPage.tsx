import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'

// Helper to get full image URL
const getImageUrl = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `http://localhost:3000${path}`
}

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/shop/login?redirect=/checkout')
        } else {
            navigate('/checkout')
        }
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">{getCartCount()} items in your cart</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-sm p-6 flex gap-6 hover:shadow-md transition-shadow"
                            >
                                {/* Product Image */}
                                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-semibold">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {(item.price * item.quantity).toLocaleString('en-RW')} RF
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {item.price.toLocaleString('en-RW')} RF each
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({getCartCount()} items)</span>
                                    <span className="font-semibold">{getCartTotal().toLocaleString('en-RW')} RF</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>{getCartTotal().toLocaleString('en-RW')} RF</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Proceed to Checkout
                            </button>

                            <p className="text-sm text-gray-500 text-center mt-4">
                                {!isAuthenticated && 'You will be asked to login before checkout'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
