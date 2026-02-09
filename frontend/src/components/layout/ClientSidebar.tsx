// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    LogOut,
    User,
    Palette,
    ChevronDown,
    ChevronRight,
    Package,
    Settings
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

const sidebarItems = [
    {
        label: 'My Dashboard',
        path: '/client',
        icon: LayoutDashboard,
    },
    {
        label: 'My Orders',
        path: '/client/orders',
        icon: ShoppingCart,
    },
    {
        label: 'My Quotes',
        path: '/client/quotes',
        icon: FileText,
    },
    {
        label: 'My Files',
        path: '/client/files',
        icon: Package,
    },
    {
        label: 'Settings',
        path: '/dashboard/settings',
        icon: Settings,
    },
]

const ClientSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const user = getAuthUser()

    if (!user) return null

    const isActive = (path?: string) => {
        if (!path) return false
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    const handleLogout = () => {
        clearAuth()
        navigate('/shop/login')
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Brand Logo */}
                {/* Brand Logo */}
                <div className="flex h-20 shrink-0 items-center px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
                            <Palette size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-900 leading-tight">TOP Design</span>
                            <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">Client Portal</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-hide">
                    {sidebarItems.filter(item => {
                        // Hide Quotes and Files for Standard Customers (Role 13) and Clients (Role 4)
                        const roleId = Number(user?.role_id);
                        if (roleId === 13 || roleId === 4) {
                            if (item.label === 'My Quotes') return false;
                            if (item.label === 'My Files') return false;
                        }
                        return true;
                    }).map((item) => (
                        <div key={item.label} className="mb-1">
                            <Link
                                to={item.path!}
                                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive(item.path)
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-slate-500'} />
                                <span>{item.label}</span>
                            </Link>
                        </div>
                    ))}

                    {/* Add Start Order Link for Customers */}
                    <div className="mb-1">
                        <Link
                            to="/products"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            <ShoppingCart size={18} className="text-slate-500" />
                            <span>New Order</span>
                        </Link>
                    </div>
                </nav>

                {/* Footer / User Profile */}
                <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-slate-200/60 shadow-sm mb-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'Customer'}</p>
                            <p className="truncate text-[10px] text-slate-500 uppercase tracking-tighter">Verified Client</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <div className="hidden lg:block lg:w-64 lg:shrink-0" />
        </>
    )
}

export default ClientSidebar
