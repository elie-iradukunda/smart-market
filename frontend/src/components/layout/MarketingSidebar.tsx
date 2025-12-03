// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Megaphone,
    BarChart3,
    Users,
    BrainCircuit,
    ChevronDown,
    ChevronRight,
    LogOut,
    Target,
    Monitor
} from 'lucide-react'
import { clearAuth, getAuthUser, currentUserHasPermission } from '@/utils/apiClient'

interface SidebarItem {
    label: string
    path?: string
    icon: React.ElementType
    permission?: string | null
    children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard/marketing',
        icon: LayoutDashboard,
        permission: null,
    },
    {
        label: 'Campaigns',
        path: '/marketing/campaigns',
        icon: Megaphone,
        permission: 'campaign.manage',
    },
    {
        label: 'Ads Management',
        path: '/marketing/ads',
        icon: Monitor,
        permission: 'ad.view',
    },
    {
        label: 'Leads',
        path: '/crm/leads',
        icon: Users,
        permission: 'lead.manage',
    },
    {
        label: 'Performance',
        path: '/marketing/ad-performance',
        icon: BarChart3,
        permission: 'report.view',
    },
    {
        label: 'AI Insights',
        path: '/ai/overview',
        icon: BrainCircuit,
        permission: 'ai.view',
    },
]

const MarketingSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const user = getAuthUser()

    // Only show for Marketing role (10)
    if (!user || user.role_id !== 10) {
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

    // Filter items based on permissions
    const filterItemsByPermission = (items: SidebarItem[]): SidebarItem[] => {
        return items.filter(item => {
            if (item.permission && !currentUserHasPermission(item.permission)) {
                return false
            }
            if (item.children) {
                item.children = filterItemsByPermission(item.children)
                return item.children.length > 0
            }
            return true
        })
    }

    const filteredItems = filterItemsByPermission([...sidebarItems])

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-fuchsia-50 via-white to-pink-50 border-r border-fuchsia-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-center border-b border-fuchsia-200 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                            <Target size={20} />
                        </div>
                        <span>
                            Top<span className="font-light">Design</span>
                        </span>
                    </div>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-fuchsia-100 bg-fuchsia-50/50">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-fuchsia-200">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            MK
                        </div>
                        <div>
                            <p className="text-xs font-medium text-fuchsia-600">Marketing</p>
                            <p className="text-sm font-bold text-fuchsia-900">Manager</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {filteredItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${expandedItems.includes(item.label)
                                            ? 'text-fuchsia-900 bg-fuchsia-100/80 shadow-sm'
                                            : 'text-fuchsia-700 hover:bg-fuchsia-50 hover:text-fuchsia-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-fuchsia-600' : 'text-fuchsia-500'} />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={16} className="text-fuchsia-500" />
                                        ) : (
                                            <ChevronRight size={16} className="text-fuchsia-500" />
                                        )}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ml-4 ${isActive(child.path)
                                                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30'
                                                    : 'text-fuchsia-700 hover:bg-fuchsia-100 hover:text-fuchsia-900'
                                                    }`}
                                            >
                                                <child.icon size={16} className={`transition-colors ${isActive(child.path) ? 'text-white' : 'text-fuchsia-500 group-hover:text-fuchsia-700'}`} />
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30'
                                        : 'text-fuchsia-700 hover:bg-fuchsia-100 hover:text-fuchsia-900'
                                        }`}
                                >
                                    <item.icon size={18} className={`transition-colors ${isActive(item.path) ? 'text-white' : 'text-fuchsia-500 group-hover:text-fuchsia-700'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Profile / Footer Section */}
                <div className="border-t border-fuchsia-200 p-4 space-y-3 bg-gradient-to-b from-white to-fuchsia-50/50">
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-fuchsia-200 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'M'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-fuchsia-900">{user?.name || 'Marketing'}</p>
                            <p className="truncate text-xs text-fuchsia-600">Marketing Team</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-300 bg-white p-2.5 text-sm font-medium text-fuchsia-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm hover:shadow-md"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default MarketingSidebar
