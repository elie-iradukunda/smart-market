import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  ArrowLeftRight,
  ShoppingCart,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Box
} from 'lucide-react';
import { clearAuth } from '@/utils/apiClient';
import { filterSidebarItemsByPermission, SidebarItem } from '@/utils/sidebarUtils';

const sidebarItems: SidebarItem[] = [
  {
    label: 'Overview',
    path: '/dashboard/inventory',
    icon: LayoutDashboard,
    permission: null,
  },
  {
    label: 'Inventory',
    icon: Package,
    permission: null,
    children: [
      { label: 'Materials', path: '/inventory/materials', icon: Box, permission: 'material.view' },
      { label: 'Stock Movements', path: '/inventory/stock-movements', icon: ArrowLeftRight, permission: 'inventory.manage' },
      { label: 'BOM Templates', path: '/inventory/bom-templates', icon: FileText, permission: 'inventory.manage' },
    ]
  },
  {
    label: 'Procurement',
    icon: ShoppingCart,
    permission: null,
    children: [
      { label: 'Purchase Orders', path: '/inventory/purchase-orders', icon: ShoppingCart, permission: 'inventory.manage' },
      { label: 'Suppliers', path: '/inventory/suppliers', icon: Truck, permission: 'supplier.view' },
    ]
  },
  {
    label: 'Reports',
    path: '/inventory/reports',
    icon: FileText,
    permission: 'report.view',
  },
  {
    label: 'Settings',
    path: '/inventory/settings',
    icon: Settings,
    permission: null,
  }
];

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventory', 'Procurement']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // Filter items based on permissions
  const filteredItems = filterSidebarItemsByPermission([...sidebarItems]);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-blue-50 to-blue-100 border-r border-blue-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-center border-b border-blue-200 px-6 bg-white/50">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30">
              <Package size={18} />
            </div>
            <span className="bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Top<span className="font-light">Design</span>
            </span>
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
                      ? 'text-blue-900 bg-white/60'
                      : 'text-blue-700 hover:bg-white/40 hover:text-blue-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-blue-600' : 'text-blue-500'} />
                      <span>{item.label}</span>
                    </div>
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown size={16} className="text-blue-500" />
                    ) : (
                      <ChevronRight size={16} className="text-blue-500" />
                    )}
                  </button>

                  <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path!}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ml-4 ${isActive(child.path)
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-blue-700 hover:bg-white/50 hover:text-blue-900'
                          }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive(child.path) ? 'bg-white' : 'bg-blue-400 group-hover:bg-blue-600'}`} />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-blue-700 hover:bg-white/50 hover:text-blue-900'
                    }`}
                >
                  <item.icon size={18} className={`transition-colors ${isActive(item.path) ? 'text-white' : 'text-blue-500 group-hover:text-blue-700'}`} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile / Footer Section */}
        <div className="border-t border-blue-200 p-4 space-y-3 bg-white/30">
          <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 border border-blue-200">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs shadow-md">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-blue-900">John Doe</p>
              <p className="truncate text-xs text-blue-600">Inventory Manager</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white p-2.5 text-sm font-medium text-blue-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
