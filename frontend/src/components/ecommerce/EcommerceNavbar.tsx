import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, LogOut, Menu, X, LayoutDashboard, Box } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

export default function EcommerceNavbar() {
    const { getCartCount, clearCart } = useCart()
    const { logout, isAuthenticated } = useAuth()
    const location = useLocation()
    const cartCount = getCartCount()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isActive = (path: string) => {
        if (path === '/products?view=designs') return location.search.includes('view=designs')
        if (path === '/products') return location.pathname === '/products' && !location.search.includes('view=designs')
        return location.pathname === path
    }

    const handleLogout = () => {
        clearCart()
        logout()
    }

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Custom Order', path: '/custom-design' },
        { name: 'Designs', path: '/products?view=designs' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
    ]

    const isHomePage = location.pathname === '/'

    return (
        <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled || !isHomePage
            ? 'bg-white/80 backdrop-blur-2xl border-b border-blue-100/20 py-3 shadow-premium'
            : 'bg-transparent py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="group flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-lg shadow-blue-500/20">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className={`text-xl font-black tracking-tighter shrink-0 transition-colors ${scrolled || !isHomePage ? 'text-blue-950' : 'text-white'}`}>
                                TOP <span className="text-blue-500 italic">Design</span>
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] shrink-0 transition-colors ${scrolled || !isHomePage ? 'text-blue-400' : 'text-blue-200'}`}>
                                Creative Agency
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-bold uppercase tracking-widest transition-all relative group whitespace-nowrap ${isActive(link.path)
                                    ? 'text-blue-500'
                                    : (scrolled || !isHomePage ? 'text-slate-500' : 'text-blue-50/90') + ' hover:text-blue-400'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-2 left-0 h-1 bg-blue-500 rounded-full transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Cart - Always visible but smaller on mobile */}
                        <Link
                            to="/cart"
                            className="relative p-2 sm:p-2.5 bg-blue-50/50 hover:bg-blue-100 rounded-2xl transition-all group shrink-0"
                        >
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Desktop Auth / Dashboard (Hidden on Mobile) */}
                        <div className="hidden lg:flex items-center gap-3">
                            {isAuthenticated ? (
                                <div className={`flex items-center gap-3 ml-2 pl-3 border-l ${scrolled || !isHomePage ? 'border-slate-200' : 'border-white/20'}`}>
                                    <Link
                                        to="/client"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:scale-105"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className={`p-2.5 rounded-2xl transition-all ${scrolled || !isHomePage ? 'text-slate-400 hover:bg-red-50 hover:text-red-500' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 ml-4">
                                    <Link to="/shop/login" className={`text-sm font-bold transition-colors uppercase tracking-widest ${scrolled || !isHomePage ? 'text-slate-500 hover:text-blue-600' : 'text-white hover:text-blue-300'}`}>
                                        Login
                                    </Link>
                                    <Link
                                        to="/shop/register"
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/10 hover:scale-105 active:scale-95"
                                    >
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 bg-slate-100 rounded-2xl text-slate-600 shrink-0"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 p-6 space-y-4 animate-fade-in-up">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-6 py-4 rounded-2xl font-bold transition-all ${isActive(link.path) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/client"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100"
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            setMobileMenuOpen(false)
                                        }}
                                        className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/shop/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-4 bg-slate-50 text-indigo-950 rounded-2xl font-bold text-sm text-center uppercase tracking-widest"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/shop/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm text-center shadow-lg shadow-indigo-100 uppercase tracking-widest"
                                    >
                                        Join Now
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
