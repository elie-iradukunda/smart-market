// @ts-nocheck
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    FileText,
    ShoppingCart,
    ChevronDown,
    ChevronRight,
    LogOut,
    Briefcase,
    Phone,
    Megaphone,
    BarChart3,
    BrainCircuit,
    Monitor,
    History,
    Settings,
    Receipt,
    Package,
    CreditCard,
    DollarSign,
    Factory,
    Banknote,
    BookOpen,
    Shield,
    Crown,
    Activity,
    PieChart,
    Wallet
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { filterSidebarItemsByPermission, SidebarItem } from '@/utils/sidebarUtils'

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboards',
        icon: LayoutDashboard,
        children: [
            { label: 'Admin', path: '/dashboard/sales/admin', icon: Shield },
            { label: 'Sales', path: '/dashboard/sales', icon: LayoutDashboard },
            { label: 'Marketing', path: '/dashboard/sales/marketing', icon: LayoutDashboard },
            { label: 'Owner', path: '/dashboard/sales/owner', icon: Crown },
            { label: 'Accountant', path: '/dashboard/sales/accountant', icon: DollarSign },
            { label: 'Controller', path: '/dashboard/sales/controller', icon: Activity },
            { label: 'POS Overview', path: '/dashboard/sales/pos', icon: LayoutDashboard },
        ]
    },
    {
        label: 'Sales & CRM',
        icon: Users,
        children: [
            { label: 'Leads', path: '/dashboard/sales/crm/leads', icon: Phone },
            { label: 'Customers', path: '/dashboard/sales/crm/customers', icon: Users },
            { label: 'Quotes', path: '/dashboard/sales/crm/quotes', icon: FileText },
            { label: 'Orders', path: '/dashboard/sales/orders', icon: ShoppingCart },
        ]
    },
    {
        label: 'Marketing',
        icon: Megaphone,
        children: [
            { label: 'Campaigns', path: '/dashboard/sales/marketing/campaigns', icon: Megaphone },
            { label: 'Ads Management', path: '/dashboard/sales/marketing/ads', icon: Monitor },
            { label: 'Performance', path: '/dashboard/sales/marketing/ad-performance', icon: BarChart3 },
        ]
    },
    {
        label: 'Finance',
        icon: Banknote,
        children: [
            { label: 'Reports', path: '/dashboard/sales/finance/reports', icon: PieChart },
            { label: 'Invoices', path: '/dashboard/sales/finance/invoices', icon: FileText },
            { label: 'Payments', path: '/dashboard/sales/finance/payments', icon: CreditCard },
            { label: 'Journals', path: '/dashboard/sales/finance/journals', icon: BookOpen },
            { label: 'Finance Main', path: '/dashboard/sales/finance', icon: Banknote },
        ]
    },
    {
        label: 'Operations',
        icon: Factory,
        children: [
            { label: 'Production', path: '/dashboard/sales/production/work-orders', icon: Factory },
            { label: 'Materials', path: '/dashboard/sales/inventory/materials', icon: Package },
            { label: 'Purchasing', path: '/dashboard/sales/inventory/purchase-orders', icon: FileText },
            { label: 'Inventory', path: '/dashboard/sales/inventory/materials', icon: Package },
            { label: 'Operations Main', path: '/dashboard/sales/operations', icon: Factory },
        ]
    },
    {
        label: 'Point of Sale',
        icon: Receipt,
        children: [
            { label: 'POS Terminal', path: '/dashboard/sales/pos/terminal', icon: Receipt },
            { label: 'Sales History', path: '/dashboard/sales/pos/sales-history', icon: Wallet },
        ]
    },
    {
        label: 'Administration',
        icon: Shield,
        children: [
            { label: 'Users', path: '/dashboard/sales/users', icon: Users },
            { label: 'Roles', path: '/dashboard/sales/roles', icon: Shield },
            { label: 'System Settings', path: '/dashboard/sales/system-settings', icon: Settings },
            { label: 'Audit Logs', path: '/dashboard/sales/audit-logs', icon: FileText },
            { label: 'Admin Main', path: '/dashboard/sales/admin', icon: Settings },
        ]
    },
    { label: 'AI Insights', path: '/dashboard/sales/ai/overview', icon: BrainCircuit },
    { label: 'Reports', path: '/dashboard/sales/reports/operations', icon: BarChart3 },
    { label: 'Settings', path: '/dashboard/sales/settings', icon: Settings },
];
const SalesSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboards']);
    const user = getAuthUser();

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    }

    const isActive = (path?: string) => {
        if (!path) return false;
        return location.pathname === path || location.pathname.startsWith(path + '/');
    }

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    }

    const filteredItems = filterSidebarItemsByPermission([...sidebarItems]);

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Fixed Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Section - Fixed at top */}
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-100 px-6 bg-slate-900 text-white font-bold text-xl">
                    <Briefcase size={20} className="mr-2" />
                    <span>TopDesign</span>
                </div>

                {/* Scrollable Navigation Area */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {filteredItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${expandedItems.includes(item.label) ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className="text-slate-500" />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>

                                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-[600px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                to={child.path!}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ml-4 transition-all ${isActive(child.path) ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
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
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive(item.path) ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-slate-500'} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer Section - Fixed at bottom */}
                <div className="shrink-0 border-t border-slate-100 p-4 bg-white">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
            
            {/* Spacer for Main Content to prevent overlap on Desktop */}
            <div className="hidden lg:block lg:w-64 lg:shrink-0" />
        </>
    )
}

export default SalesSidebar;