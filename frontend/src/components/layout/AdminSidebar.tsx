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
    Lock,
    Banknote,
    Activity,
    BrainCircuit,
    ShoppingCart,
    Factory,
    Package,
    Receipt,
    Monitor,
    Palette
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

const sidebarItems = [
    {
        label: 'Dashboard',
        path: '/dashboard/admin',
        icon: LayoutDashboard,
    },
    {
        label: 'Orders',
        path: '/dashboard/admin/orders',
        icon: ShoppingCart,
    },
    {
        label: 'Users',
        icon: Users,
        children: [
            { label: 'All Users', path: '/dashboard/admin/users', icon: Users },
            { label: 'Roles & Permissions', path: '/dashboard/admin/roles', icon: Shield },
        ]
    },
    {
        label: 'Custom Design',
        icon: Palette,
        children: [
            { label: 'View Orders', path: '/dashboard/admin/design/orders' },
            { label: 'Place Custom Order', path: '/dashboard/admin/design/order' },
            { label: 'Pricing Settings', path: '/dashboard/admin/design/pricing' },
        ]
    },
    {
        label: 'Finance',
        icon: Banknote,
        children: [
            { label: 'Reports', path: '/dashboard/admin/finance/reports', icon: Activity },
            { label: 'Invoices', path: '/dashboard/admin/finance/invoices', icon: FileText },
            { label: 'Payments', path: '/dashboard/admin/finance/payments', icon: Receipt },
        ]
    },
    {
        label: 'CRM',
        icon: Users,
        children: [
            { label: 'Leads', path: '/dashboard/sales/crm/leads', icon: Users },
            { label: 'Customers', path: '/dashboard/sales/crm/customers', icon: Users },
            { label: 'Quotes', path: '/dashboard/sales/crm/quotes', icon: FileText },
        ]
    },
    {
        label: 'Operations',
        icon: Factory,
        children: [
            { label: 'Production', path: '/dashboard/admin/production/work-orders', icon: Factory },
            { label: 'Supplies', path: '/dashboard/admin/inventory/materials', icon: Package },
            { label: 'Products', path: '/dashboard/admin/inventory/products', icon: ShoppingCart },
            { label: 'POS Terminal', path: '/dashboard/staff/pos/terminal', icon: Receipt },
        ]
    },
    {
        label: 'Settings',
        path: '/dashboard/settings',
        icon: Settings,
    },
]

const AdminSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const user = getAuthUser()

    if (!user) return null

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
                            <Package size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-900 leading-tight">TOP Design</span>
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Admin Portal</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-hide">
                    {sidebarItems.map((item) => (
                        <div key={item.label} className="mb-1">
                            {item.children ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${expandedItems.includes(item.label)
                                            ? 'text-slate-900 bg-slate-100/50'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-slate-900' : 'text-slate-500'} />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100 mt-1 pb-1' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ml-8 transition-colors ${isActive(child.path)
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive(item.path)
                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-slate-500'} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-slate-200/60 shadow-sm mb-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                            <p className="truncate text-[10px] text-slate-500 uppercase tracking-tighter">Administrator</p>
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

export default AdminSidebar