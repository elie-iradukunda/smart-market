// @ts-nocheck
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, FileText, ShoppingCart, MessageSquare,
  Mail, CreditCard, BarChart3, ClipboardList, Package, Truck,
  ArrowRightLeft, ShoppingBag, Wrench, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';
import { clearAuth, getAuthUser } from '@/utils/apiClient';

const SIDEBAR_LINKS = [
  {
    label: 'Dashboards',
    icon: LayoutDashboard,
    children: [
      { label: 'Staff Main', path: '/dashboard/staff' },
  { label: 'Production', path: '/dashboard/staff/production' },
  { label: 'Inventory', path: '/dashboard/staff/inventory' },
  { label: 'Reception', path: '/dashboard/staff/reception' },
  { label: 'Support', path: '/dashboard/staff/support' }
    ]
  },
  {
    label: 'CRM',
    icon: Users,
    children: [
      { label: 'Customers', path: '/dashboard/staff/crm/customers' },
      { label: 'Leads', path: '/dashboard/staff/crm/leads' },
      { label: 'Quotes', path: '/dashboard/staff/crm/quotes' },
    ]
  },
  { label: 'Orders', path: '/dashboard/staff/orders', icon: ShoppingCart },
  {
    label: 'Production',
    icon: ClipboardList,
    children: [
      { label: 'Work Orders', path: '/dashboard/staff/production/work-orders' },
      { label: 'Schedule', path: '/dashboard/staff/production/schedule' },
    ]
  },
  {
    label: 'Inventory',
    icon: Package,
    children: [
      { label: 'Materials', path: '/dashboard/staff/inventory/materials' },
      { label: 'Products', path: '/dashboard/staff/inventory/products' },
      { label: 'Suppliers', path: '/dashboard/staff/inventory/suppliers' },
      { label: 'Purchase Orders', path: '/dashboard/staff/inventory/purchase-orders' },
      { label: 'Stock Movements', path: '/dashboard/staff/inventory/stock-movements' },
      { label: 'BOM Templates', path: '/inventory/bom-templates' },
    ]
  },
  {
    label: 'Point of Sale',
    icon: CreditCard,
    children: [
      { label: 'POS Terminal', path: '/dashboard/staff/pos/terminal' },
      { label: 'Sales History', path: '/dashboard/staff/pos/sales-history' },
    ]
  },
  {
    label: 'Reports',
    icon: BarChart3,
    children: [
      { label: 'Production Reports', path: '/dashboard/staff/reports/production' },
      { label: 'Inventory Reports', path: '/inventory/reports' },
      { label: 'Sales Performance', path: '/reports/sales' },
    ]
  },
  { label: 'Communications', path: '/dashboard/staff/communications/inbox', icon: Mail },
];

const StaffSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getAuthUser();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!user) return null;

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);
  };

  const isActive = (path?: string) => path && (location.pathname === path || location.pathname.startsWith(`${path}/`));

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
      
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 
        flex flex-col bg-slate-900 border-r border-slate-800 transition-transform 
        duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex-shrink-0 flex h-16 items-center px-6 border-b border-slate-800 text-white font-bold text-xl">
          <Wrench className="mr-2 text-blue-500" size={20} />
          Top<span className="text-blue-400 font-light">Design</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {SIDEBAR_LINKS.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button onClick={() => toggleExpand(item.label)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${expandedItems.includes(item.label) ? 'text-blue-400 bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-blue-400' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </div>
                    {expandedItems.includes(item.label) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-[600px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                    {item.children.map((child) => (
                      <Link key={child.label} to={child.path!} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ml-4 mt-0.5 transition-all ${isActive(child.path) ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link to={item.path!} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default StaffSidebar;