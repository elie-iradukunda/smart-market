// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Settings,
    ChevronDown,
    ChevronRight,
    LogOut,
    Crown,
    Factory,
    FileText,
    Megaphone,
    Briefcase,
    Banknote
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { filterSidebarItemsByPermission, SidebarItem } from '@/utils/sidebarUtils'

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard/owner',
        icon: LayoutDashboard,
        permission: null,
    },
    {
        label: 'Finance',
        path: '/finance',
        icon: Banknote,
        permission: 'report.view',
        children: [
            { label: 'Reports', path: '/finance/reports', icon: Banknote },
            { label: 'Invoices', path: '/finance/invoices', icon: FileText },
            { label: 'Payments', path: '/finance/payments', icon: FileText },
            { label: 'POS', path: '/pos/sales-history', icon: ShoppingCart },
            { label: 'Journals', path: '/finance/journals', icon: FileText },
        ]
    },
    {
        label: 'Operations',
        path: '/operations',
        icon: Factory,
        permission: 'order.view',
        children: [
            { label: 'Orders', path: '/orders', icon: ShoppingCart },
            { label: 'Production', path: '/production/work-orders', icon: Factory },
            { label: 'Materials', path: '/inventory/materials', icon: ShoppingCart },
            { label: 'Purchasing', path: '/inventory/purchase-orders', icon: FileText },
        ]
    },
    {
        label: 'Sales',
        path: '/crm',
        icon: Users,
        permission: 'lead.manage',
        children: [
            { label: 'Leads', path: '/crm/leads', icon: Users },
            { label: 'Quotes', path: '/crm/quotes', icon: FileText },
            { label: 'Sales', path: '/orders', icon: ShoppingCart },
            { label: 'Campaigns', path: '/marketing/campaigns', icon: Megaphone },
            { label: 'Performance', path: '/marketing/ad-performance', icon: Megaphone },
        ]
    },
    {
        label: 'Administration',
        path: '/admin',
        icon: Settings,
        permission: 'user.manage',
        children: [
            { label: 'Inbox', path: '/communications/inbox', icon: Briefcase },
            { label: 'Users', path: '/admin/users', icon: Users },
            { label: 'Permissions', path: '/admin/roles', icon: Settings },
            { label: 'Audit', path: '/admin/audit-logs', icon: FileText },
            { label: 'Settings', path: '/admin/system-settings', icon: Settings },
        ]
    },
]

const OwnerSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItem, setExpandedItem] = useState<string | null>(null)
    const user = getAuthUser()

    if (!user || user.role_id !== 1) {
        return null
    }

    const toggleExpand = (label: string) => {
        setExpandedItem(prev => (prev === label ? null : label))
    }

    const isActive = (path?: string) => {
        if (!path) return false
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    const filteredItems = filterSidebarItemsByPermission([...sidebarItems])

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo Section */}
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-200 px-6 bg-slate-900">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                            <Crown size={20} />
                        </div>
                        <span>
                            Top<span className="font-light">Design</span>
                        </span>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {filteredItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                            expandedItem === item.label
                                                ? 'text-slate-900 bg-slate-100'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className="text-slate-500" />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItem === item.label ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItem === item.label ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ml-4 ${
                                                    isActive(child.path)
                                                        ? 'bg-slate-900 text-white shadow-md'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                <child.icon size={16} />
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                        isActive(item.path)
                                            ? 'bg-slate-900 text-white shadow-md'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="shrink-0 border-t border-slate-200 p-4 bg-white">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default OwnerSidebar