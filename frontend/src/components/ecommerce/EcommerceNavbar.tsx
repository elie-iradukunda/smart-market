import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Package } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function EcommerceNavbar() {
    const { getCartCount } = useCart()
    const { user, logout, isAuthenticated } = useAuth()
    const location = useLocation()
    const cartCount = getCartCount()

    const isActive = (path: string) => location.pathname === path

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            TOP Design
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`font-medium transition-colors ${isActive('/')
                                    ? 'text-blue-600'
                                    : 'text-gray-700 hover:text-blue-600'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className={`font-medium transition-colors ${isActive('/products')
                                    ? 'text-blue-600'
                                    : 'text-gray-700 hover:text-blue-600'
                                }`}
                        >
                            Products
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/orders"
                                    className="hidden sm:flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    <Package className="w-4 h-4" />
                                    <span className="font-medium">My Orders</span>
                                </Link>
                                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                                    <User className="w-4 h-4 text-gray-700" />
                                    <span className="font-medium text-gray-700 hidden sm:inline">
                                        {user?.fullName.split(' ')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/shop/login"
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/shop/register"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
