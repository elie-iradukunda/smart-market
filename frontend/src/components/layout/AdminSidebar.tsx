// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Shield,
    FileText,
    Settings,
    ChevronDown,
    ChevronRight,
    LogOut,
    Lock
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { filterSidebarItemsByPermission, SidebarItem } from '@/utils/sidebarUtils'

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard/admin',
        icon: LayoutDashboard,
        permission: null,
    },
    {
        label: 'User Management',
        icon: Users,
        permission: 'user.manage',
        children: [
            { label: 'Users', path: '/admin/users', icon: Users, permission: 'user.manage' },
            { label: 'Roles', path: '/admin/roles', icon: Shield, permission: 'role.manage' },
        ]
    },
    {
        label: 'System',
        icon: Settings,
        permission: 'settings.manage',
        children: [
            { label: 'Settings', path: '/admin/system-settings', icon: Settings, permission: 'settings.manage' },
            { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText, permission: 'audit.view' },
        ]
    },
]

const AdminSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>(['User Management', 'System'])
    const user = getAuthUser()

    // Only show for Admin role (2) or Owner (1)
    if (!user || ![1, 2].includes(user.role_id)) {
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
    const filteredItems = filterSidebarItemsByPermission([...sidebarItems])

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-slate-50 via-white to-slate-100 border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-center border-b border-slate-200 px-6 bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                            <Lock size={20} />
                        </div>
                        <span>
                            Top<span className="font-light">Design</span>
                        </span>
                    </div>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            AD
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-600">System</p>
                            <p className="text-sm font-bold text-slate-900">Admin</p>
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
                                            ? 'text-slate-900 bg-slate-100/80 shadow-sm'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-slate-600' : 'text-slate-500'} />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={16} className="text-slate-500" />
                                        ) : (
                                            <ChevronRight size={16} className="text-slate-500" />
                                        )}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ml-4 ${isActive(child.path)
                                                    ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md shadow-slate-600/30'
                                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                                    }`}
                                            >
                                                <child.icon size={16} className={`transition-colors ${isActive(child.path) ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md shadow-slate-600/30'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon size={18} className={`transition-colors ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Profile / Footer Section */}
                <div className="border-t border-slate-200 p-4 space-y-3 bg-gradient-to-b from-white to-slate-50/50">
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-slate-200 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                            <p className="truncate text-xs text-slate-600">System Administrator</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm hover:shadow-md"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default AdminSidebar
