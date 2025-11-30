// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    ClipboardList,
    ShoppingCart,
    Package,
    ChevronDown,
    ChevronRight,
    LogOut,
    Wrench,
    Settings
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
        path: '/dashboard/technician',
        icon: LayoutDashboard,
        permission: null,
    },
    {
        label: 'Production',
        icon: ClipboardList,
        permission: null,
        children: [
            { label: 'Work Orders', path: '/production/work-orders', icon: ClipboardList, permission: 'workorder.view' },
        ]
    },
    {
        label: 'Orders',
        path: '/orders',
        icon: ShoppingCart,
        permission: 'order.view',
    },
    {
        label: 'Inventory',
        icon: Package,
        permission: null,
        children: [
            { label: 'Materials', path: '/inventory/materials', icon: Package, permission: 'material.view' },
        ]
    },
]

const TechnicianSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Production', 'Inventory'])
    const user = getAuthUser()

    // Only show for Technician role (6)
    if (!user || user.role_id !== 6) {
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
            // If item has permission requirement, check it
            if (item.permission && !currentUserHasPermission(item.permission)) {
                return false
            }
            // If item has children, filter them too
            if (item.children) {
                item.children = filterItemsByPermission(item.children)
                // Only show parent if it has visible children
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
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-sky-50 via-white to-cyan-50 border-r border-sky-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-center border-b border-sky-200 px-6 bg-gradient-to-r from-sky-600 to-cyan-600">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                            <Wrench size={20} />
                        </div>
                        <span>
                            Top<span className="font-light">Design</span>
                        </span>
                    </div>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-sky-100 bg-sky-50/50">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-sky-200">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            TE
                        </div>
                        <div>
                            <p className="text-xs font-medium text-sky-600">Production</p>
                            <p className="text-sm font-bold text-sky-900">Technician</p>
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
                                            ? 'text-sky-900 bg-sky-100/80 shadow-sm'
                                            : 'text-sky-700 hover:bg-sky-50 hover:text-sky-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-sky-600' : 'text-sky-500'} />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={16} className="text-sky-500" />
                                        ) : (
                                            <ChevronRight size={16} className="text-sky-500" />
                                        )}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ml-4 ${isActive(child.path)
                                                    ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/30'
                                                    : 'text-sky-700 hover:bg-sky-100 hover:text-sky-900'
                                                    }`}
                                            >
                                                <child.icon size={16} className={`transition-colors ${isActive(child.path) ? 'text-white' : 'text-sky-500 group-hover:text-sky-700'}`} />
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/30'
                                        : 'text-sky-700 hover:bg-sky-100 hover:text-sky-900'
                                        }`}
                                >
                                    <item.icon size={18} className={`transition-colors ${isActive(item.path) ? 'text-white' : 'text-sky-500 group-hover:text-sky-700'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Profile / Footer Section */}
                <div className="border-t border-sky-200 p-4 space-y-3 bg-gradient-to-b from-white to-sky-50/50">
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-sky-200 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-sky-900">{user?.name || 'Technician'}</p>
                            <p className="truncate text-xs text-sky-600">Production Staff</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300 bg-white p-2.5 text-sm font-medium text-sky-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm hover:shadow-md"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default TechnicianSidebar
