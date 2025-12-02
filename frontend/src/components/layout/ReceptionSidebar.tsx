// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    UserPlus,
    FileText,
    ShoppingCart,
    MessageSquare,
    FolderOpen,
    CreditCard,
    BarChart3,
    ChevronDown,
    ChevronRight,
    LogOut,
    Building2,
    Phone,
    Mail
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
        path: '/dashboard/reception',
        icon: LayoutDashboard,
        permission: null,
    },
    {
        label: 'CRM',
        icon: Users,
        permission: null,
        children: [
            { label: 'Customers', path: '/crm/customers', icon: Users, permission: 'customer.view' },
            { label: 'Leads', path: '/crm/leads', icon: UserPlus, permission: 'lead.manage' },
            { label: 'Quotes', path: '/crm/quotes', icon: FileText, permission: 'quote.manage' },
        ]
    },
    {
        label: 'Orders',
        path: '/orders',
        icon: ShoppingCart,
        permission: 'order.view',
    },
    {
        label: 'Communications',
        icon: MessageSquare,
        permission: null,
        children: [
            { label: 'Inbox', path: '/communications/inbox', icon: Mail, permission: null },
        ]
    },
    {
        label: 'Point of Sale',
        icon: CreditCard,
        permission: null,
        children: [
            { label: 'POS Terminal', path: '/pos/terminal', icon: CreditCard, permission: 'pos.create' },
            { label: 'Sales History', path: '/pos/sales-history', icon: BarChart3, permission: null },
        ]
    },
]

const ReceptionSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>(['CRM', 'Communications', 'Point of Sale'])
    const user = getAuthUser()

    // Only show for Receptionist role (5)
    if (!user || user.role_id !== 5) {
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
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-emerald-50 via-white to-teal-50 border-r border-emerald-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-center border-b border-emerald-200 px-6 bg-gradient-to-r from-emerald-500 to-teal-500">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                            <Building2 size={20} />
                        </div>
                        <span>
                            Top<span className="font-light">Design</span>
                        </span>
                    </div>
                </div>

                {/* Role Badge */}
                <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-emerald-200">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            RE
                        </div>
                        <div>
                            <p className="text-xs font-medium text-emerald-600">Front Desk</p>
                            <p className="text-sm font-bold text-emerald-900">Reception</p>
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
                                            ? 'text-emerald-900 bg-emerald-100/80 shadow-sm'
                                            : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-emerald-600' : 'text-emerald-500'} />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={16} className="text-emerald-500" />
                                        ) : (
                                            <ChevronRight size={16} className="text-emerald-500" />
                                        )}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ml-4 ${isActive(child.path)
                                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                                                    : 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900'
                                                    }`}
                                            >
                                                <child.icon size={16} className={`transition-colors ${isActive(child.path) ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-700'}`} />
                                                <span>{child.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                                        : 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900'
                                        }`}
                                >
                                    <item.icon size={18} className={`transition-colors ${isActive(item.path) ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-700'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Profile / Footer Section */}
                <div className="border-t border-emerald-200 p-4 space-y-3 bg-gradient-to-b from-white to-emerald-50/50">
                    <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-emerald-200 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'R'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-emerald-900">{user?.name || 'Receptionist'}</p>
                            <p className="truncate text-xs text-emerald-600">Front Desk Staff</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white p-2.5 text-sm font-medium text-emerald-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm hover:shadow-md"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default ReceptionSidebar
