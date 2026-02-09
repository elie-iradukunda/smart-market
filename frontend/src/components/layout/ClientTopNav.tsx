// @ts-nocheck
import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { useCart } from '@/contexts/CartContext'
import {
    Menu,
    User,
    LogOut,
    Bell,
    ShoppingCart
} from 'lucide-react'

interface ClientTopNavProps {
    onMenuClick?: () => void
}

export default function ClientTopNav({ onMenuClick }: ClientTopNavProps) {
    const navigate = useNavigate()
    const user = getAuthUser()
    const { getCartCount } = useCart()
    const cartCount = getCartCount()

    const handleLogout = () => {
        clearAuth()
        navigate('/shop/login')
    }

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-6">

                {/* Left: Mobile Menu + Branding */}
                <div className="flex items-center gap-4 shrink-0">
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5 text-slate-600" />
                    </button>

                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                            <Palette size={18} />
                        </div>
                        <span className="font-bold tracking-tight text-slate-900">
                            TOP Design
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    <Link
                        to="/cart"
                        className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="View Cart"
                    >
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce-short">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell size={20} />
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold text-slate-900">{user?.name || 'Client'}</span>
                            <span className="text-[10px] text-slate-500 uppercase">Customer</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
