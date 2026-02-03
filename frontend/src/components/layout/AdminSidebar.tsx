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
    ShoppingCart,
    Crown,
    Factory,
    Megaphone,
    Banknote,
    Package,
    DollarSign,
    Wallet,
    CreditCard,
    BookOpen,
    Receipt,
    BrainCircuit,
    Activity
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { filterSidebarItemsByPermission, SidebarItem } from '@/utils/sidebarUtils'

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboards',
        icon: LayoutDashboard,
        permission: null,
        children: [
            { label: 'Admin', path: '/dashboard/admin', icon: LayoutDashboard },
            { label: 'Owner', path: '/dashboard/admin/owner', icon: Crown },
            { label: 'Accountant', path: '/dashboard/admin/accountant', icon: DollarSign },
            { label: 'Controller', path: '/dashboard/admin/controller', icon: Activity },
        ]
    },
    {
        label: 'User Management',
        icon: Users,
        permission: 'user.manage',
        children: [
            { label: 'Users', path: '/dashboard/admin/users', icon: Users, permission: 'user.manage' },
            { label: 'Roles', path: '/dashboard/admin/roles', icon: Shield, permission: 'role.manage' },
        ]
    },
    {
        label: 'Finance',
        icon: Banknote,
        permission: 'report.view',
        children: [
            { label: 'Reports', path: '/dashboard/admin/finance/reports', icon: Banknote },
            { label: 'Invoices', path: '/dashboard/admin/finance/invoices', icon: FileText },
            { label: 'Payments', path: '/dashboard/admin/finance/payments', icon: CreditCard },
            { label: 'POS History', path: '/dashboard/admin/pos/sales-history', icon: ShoppingCart },
            { label: 'Journals', path: '/dashboard/admin/finance/journals', icon: BookOpen },
        ]
    },
    {
        label: 'Operations',
        icon: Factory,
        permission: 'order.view',
        children: [
            { label: 'Orders', path: '/dashboard/admin/orders', icon: ShoppingCart },
            { label: 'Production', path: '/dashboard/admin/production/work-orders', icon: Factory },
            { label: 'Materials', path: '/dashboard/admin/inventory/materials', icon: Package },
        ]
    },
    {
        label: 'Point of Sale',
        icon: Receipt,
        permission: null,
        children: [
            { label: 'POS Terminal', path: '/dashboard/admin/pos/terminal', icon: Receipt, permission: 'pos.create' },
            { label: 'Sales History', path: '/dashboard/admin/pos/sales-history', icon: Wallet, permission: 'payment.view' },
        ]
    },
    {
        label: 'AI Insights',
        path: '/dashboard/admin/ai/overview',
        icon: BrainCircuit,
        permission: 'ai.view',
    },
]

const AdminSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboards'])
    const user = getAuthUser()

    if (!user || ![1, 2].includes(user.role_id)) return null

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

    const filteredItems = filterSidebarItemsByPermission([...sidebarItems])

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-200 px-6 bg-slate-900">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <Lock size={20} />
                        <span>TopDesign</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {filteredItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${expandedItems.includes(item.label)
                                            ? 'text-slate-900 bg-slate-100'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className="text-slate-500" />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-[800px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ml-4 transition-colors ${isActive(child.path)
                                                    ? 'bg-slate-900 text-white'
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
                                    onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(item.path)
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="shrink-0 border-t border-slate-200 p-4 space-y-3 bg-slate-50">
                    <div className="flex items-center gap-3 rounded-lg bg-white p-2 border border-slate-200">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs font-bold text-slate-900">{user?.name || 'Admin'}</p>
                            <p className="truncate text-[10px] text-slate-500">System Admin</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            
            <div className="hidden lg:block lg:w-64 lg:shrink-0" />
        </>
    )
}

export default AdminSidebar