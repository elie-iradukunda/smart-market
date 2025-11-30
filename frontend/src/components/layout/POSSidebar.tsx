// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    ShoppingCart,
    History,
    Settings,
    ChevronDown,
    ChevronRight,
    LogOut,
    Receipt
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

interface SidebarItem {
    label: string
    path?: string
    icon: React.ElementType
    children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
    {
        label: 'Overview',
        path: '/dashboard/pos',
        icon: LayoutDashboard,
    },
    {
        label: 'Point of Sale',
        icon: ShoppingCart,
        children: [
            { label: 'POS Terminal', path: '/pos/terminal', icon: Receipt },
            { label: 'Sales History', path: '/pos/sales-history', icon: History },
        ]
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: Settings,
    },
]

const POSSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Point of Sale'])
    const user = getAuthUser()

    // Only show for POS Cashier role (11)
    if (!user || user.role_id !== 11) {
        return null
    }

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        )
    }

    const isActive = (path?: string) => {
        if (!path) return false
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-purple-50 to-pink-50 border-r border-purple-100 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-center border-b border-purple-100 px-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30">
                            <ShoppingCart size={18} />
                        </div>
                        <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Top<span className="font-light">Design</span>
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {sidebarItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${expandedItems.includes(item.label)
                                            ? 'text-gray-900'
                                            : 'text-gray-500 hover:bg-purple-100/50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-purple-600' : 'text-gray-400'} />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={16} className="text-gray-400" />
                                        ) : (
                                            <ChevronRight size={16} className="text-gray-400" />
                                        )}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ml-4 ${isActive(child.path)
                                                    ? 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200'
                                                    : 'text-gray-500 hover:bg-purple-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <div className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive(child.path) ? 'bg-purple-500' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200'
                                        : 'text-gray-500 hover:bg-purple-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon size={18} className={`transition-colors ${isActive(item.path) ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="border-t border-purple-100 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default POSSidebar
