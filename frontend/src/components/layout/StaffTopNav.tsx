// @ts-nocheck
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '@/utils/apiClient';
import { Menu, LogOut, LayoutDashboard, ShoppingCart, BarChart3, Mail, Settings, Receipt } from 'lucide-react';

interface StaffTopNavProps {
  onMenuClick?: () => void;
}

export default function StaffTopNav({ onMenuClick }: StaffTopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Define the main links to reuse for both top and bottom nav
  const mainLinks = [
    { to: "/dashboard/staff", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/staff/reports/operations", label: "Reports", icon: BarChart3 },
  ];

  const utilLinks = [
    { to: "/dashboard/staff/communications/inbox", label: "Messages", icon: Mail },
    { to: "/account/change-password", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Header - Visible on all screens, but nav links hidden on mobile */}
      <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-md"></div>
              <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center
               justify-center rounded-full bg-black text-xs sm:text-sm font-bold text-white shadow-lg ring-2 ring-white/20">
                STA
              </span>
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-200/90 font-medium">Role</p>
              <p className="text-xs sm:text-sm font-bold text-white">Admin</p>
            </div>
          </div>


          <nav className="hidden md:flex items-center gap-6">
            {mainLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-bold transition-colors ${isActive(link.to) ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-4 w-px bg-slate-300 mx-1"></div>

            {utilLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${isActive(link.to) ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Bottom Navigation - Visible ONLY on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 z-40 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {[...mainLinks, ...utilLinks].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${isActive(link.to) ? 'text-blue-600' : 'text-slate-500'
              }`}
          >
            <link.icon size={20} className={isActive(link.to) ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}