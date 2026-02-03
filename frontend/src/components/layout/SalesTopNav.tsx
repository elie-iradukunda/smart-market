// @ts-nocheck
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingCart, 
    Megaphone, 
    LogOut,
    Briefcase,
    Menu // Added Menu icon
} from 'lucide-react';
import { clearAuth, getAuthUser } from '@/utils/apiClient';

const NAV_LINKS = [
    { path: '/dashboard/sales', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/sales/crm/leads', label: 'Leads', icon: Users },
    { path: '/dashboard/sales/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/dashboard/sales/marketing/campaigns', label: 'Marketing', icon: Megaphone },
];

interface SalesTopNavProps {
    onMenuClick?: () => void;
}

export default function SalesTopNav({ onMenuClick }: SalesTopNavProps) {
    const navigate = useNavigate();
    const user = getAuthUser();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    return (
        <>
            {/* Top Header */}
            <header className="bg-black text-white shadow-xl sticky top-0 z-30 h-16 border-b border-white/10">
                <div className="mx-auto h-full px-4 lg:px-8 flex items-center justify-between">
                    
                    {/* Left Section: Brand & Mobile Menu Toggle */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* RESTORED: Menu button to trigger the Sidebar on mobile */}
                        <button
                            type="button"
                            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={onMenuClick}
                            aria-label="Toggle menu"
                        >
                            <Menu size={22} />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg hidden xs:block">
                                <Briefcase size={18} className="text-white" />
                            </div>
                            <span className="font-black tracking-tighter text-xl">TOPDESIGN</span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) => `
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                                    ${isActive 
                                        ? 'bg-white text-black' 
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <link.icon size={16} />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="hidden md:flex flex-col items-end leading-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Sales Pro</span>
                            <span className="text-sm font-bold mt-1 text-slate-200">{user?.name || 'User'}</span>
                        </div>
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-black transition-all shadow-lg shadow-red-900/20"
                        >
                            <LogOut size={14} />
                            <span className="hidden xs:inline">LOGOUT</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-2 pb-safe z-50">
                <div className="flex justify-around items-center h-16">
                    {NAV_LINKS.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `
                                flex flex-col items-center justify-center flex-1 gap-1 transition-all
                                ${isActive ? 'text-blue-500' : 'text-slate-400'}
                            `}
                        >
                            <link.icon size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{link.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </>
    );
}