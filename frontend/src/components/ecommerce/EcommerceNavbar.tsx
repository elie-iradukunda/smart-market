import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function EcommerceNavbar() {
    const { getCartCount, clearCart } = useCart()
    const { user, logout, isAuthenticated } = useAuth()
    const location = useLocation()
    const cartCount = getCartCount()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isActive = (path: string) => location.pathname === path

    const handleLogout = () => {
        clearCart()
        logout()
    }

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
                        <Link
                            to="/about"
                            className={`font-medium transition-colors ${isActive('/about')
                                ? 'text-blue-600'
                                : 'text-gray-700 hover:text-blue-600'
                                }`}
                        >
                            About Us
                        </Link>
                        <Link
                            to="/contact"
                            className={`font-medium transition-colors ${isActive('/contact')
                                ? 'text-blue-600'
                                : 'text-gray-700 hover:text-blue-600'
                                }`}
                        >
                            Contact Us
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-4">
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
                                    to="/shop/orders"
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
                                    onClick={handleLogout}
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

                    {/* Mobile Cart */}
                    <div className="md:hidden">
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
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-1">
                            <Link
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 font-medium transition-colors ${isActive('/')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                Home
                            </Link>
                            <Link
                                to="/products"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 font-medium transition-colors ${isActive('/products')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                Products
                            </Link>
                            <Link
                                to="/about"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 font-medium transition-colors ${isActive('/about')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                About Us
                            </Link>
                            <Link
                                to="/contact"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2 font-medium transition-colors ${isActive('/contact')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                Contact Us
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/shop/orders"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                    >
                                        My Orders
                                    </Link>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="px-4 py-2 text-sm text-gray-600">
                                        {user?.fullName}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="block w-full text-left px-4 py-2 font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <Link
                                        to="/shop/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/shop/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mx-4 text-center"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
