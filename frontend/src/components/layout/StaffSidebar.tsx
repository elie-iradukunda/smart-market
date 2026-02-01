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
  Mail,
  CreditCard,
  BarChart3,
  ClipboardList,
  Package,
  Truck,
  ArrowRightLeft,
  ShoppingBag,
  Wrench,
  LogOut,
  ChevronDown,
  ChevronRight,
  Archive,
  Building2,
  LifeBuoy
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { filterSidebarItemsByPermission } from '@/utils/sidebarUtils'
import type { SidebarItem } from '@/utils/sidebarUtils'

// Define all menu items organized by role
const ALL_SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  // Production Manager
  'production_manager': [
    {
      label: 'Dashboard',
      path: '/dashboard/staff',
      icon: LayoutDashboard,
      permission: null,
    },
    {
      label: 'Production',
      icon: ClipboardList,
      permission: 'workorder.view',
      children: [
        { label: 'Work Orders', path: '/dashboard/staff/production/work-orders', icon: ClipboardList, permission: 'workorder.view' },
        { label: 'Schedule', path: '/dashboard/staff/production/schedule', icon: ClipboardList, permission: 'workorder.view' },
      ]
    },
    {
      label: 'Inventory',
      icon: Package,
      permission: 'material.view',
      children: [
        { label: 'Materials', path: '/dashboard/staff/inventory/materials', icon: Package, permission: 'material.view' },
        { label: 'Suppliers', path: '/dashboard/staff/inventory/suppliers', icon: Truck, permission: 'supplier.view' },
      ]
    },
    {
      label: 'Reports',
      path: '/dashboard/staff/reports/production',
      icon: BarChart3,
      permission: 'report.view',
    },
  ],

  // Inventory Manager
  'inventory_manager': [
    {
      label: 'Dashboard',
      path: '/dashboard/staff',
      icon: LayoutDashboard,
      permission: null,
    },
    {
      label: 'Materials',
      path: '/dashboard/staff/inventory/materials',
      icon: Package,
      permission: 'material.view',
    },
    {
      label: 'Products',
      path: '/dashboard/staff/inventory/products',
      icon: ShoppingBag,
      permission: 'inventory.manage',
    },
    {
      label: 'Suppliers',
      path: '/dashboard/staff/inventory/suppliers',
      icon: Truck,
      permission: 'supplier.view',
    },
    {
      label: 'Purchase Orders',
      path: '/dashboard/staff/inventory/purchase-orders',
      icon: ClipboardList,
      permission: 'inventory.manage',
    },
    {
      label: 'Stock Movements',
      path: '/dashboard/staff/inventory/stock-movements',
      icon: ArrowRightLeft,
      permission: 'inventory.manage',
    },
  ],

  // Technician
  'technician': [
    {
      label: 'Dashboard',
      path: '/dashboard/staff',
      icon: LayoutDashboard,
      permission: null,
    },
    {
      label: 'Production',
      icon: ClipboardList,
      permission: null,
      children: [
        { label: 'Work Orders', path: '/dashboard/staff/production/work-orders', icon: ClipboardList, permission: 'workorder.view' },
      ]
    },
    {
      label: 'Orders',
      path: '/dashboard/staff/orders',
      icon: ShoppingCart,
      permission: 'order.view',
    },
    {
      label: 'Inventory',
      icon: Package,
      permission: null,
      children: [
        { label: 'Materials', path: '/dashboard/staff/inventory/materials', icon: Package, permission: 'material.view' },
      ]
    },
  ],

  // Reception
  'reception': [
    {
      label: 'Dashboard',
      path: '/dashboard/staff',
      icon: LayoutDashboard,
      permission: null,
    },
    {
      label: 'CRM',
      icon: Users,
      permission: null,
      children: [
        { label: 'Customers', path: '/dashboard/staff/crm/customers', icon: Users, permission: 'customer.view' },
        { label: 'Leads', path: '/dashboard/staff/crm/leads', icon: UserPlus, permission: 'lead.manage' },
        { label: 'Quotes', path: '/dashboard/staff/crm/quotes', icon: FileText, permission: 'quote.manage' },
      ]
    },
    {
      label: 'Orders',
      path: '/dashboard/staff/orders',
      icon: ShoppingCart,
      permission: 'order.view',
    },
    {
      label: 'Communications',
      icon: MessageSquare,
      permission: null,
      children: [
        { label: 'Inbox', path: '/dashboard/staff/communications/inbox', icon: Mail, permission: null },
      ]
    },
    {
      label: 'Point of Sale',
      icon: CreditCard,
      permission: null,
      children: [
        { label: 'POS Terminal', path: '/dashboard/staff/pos/terminal', icon: CreditCard, permission: 'pos.create' },
        { label: 'Sales History', path: '/dashboard/staff/pos/sales-history', icon: BarChart3, permission: null },
      ]
    },
  ],

  // Support Agent
  'support_agent': [
    {
      label: 'Dashboard',
      path: '/dashboard/staff',
      icon: LayoutDashboard,
      permission: null,
    },
    {
      label: 'Communications',
      path: '/dashboard/staff/communications/inbox',
      icon: MessageSquare,
      permission: 'conversation.view',
    },
    {
      label: 'Customers',
      path: '/dashboard/staff/crm/customers',
      icon: Users,
      permission: 'customer.view',
    },
  ],
}

const StaffSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const user = getAuthUser()

  // Only show for users with role_id = 3 (Staff consolidated role)
  if (!user || Number(user.role_id) !== 3) {
    return null
    }

  const userRole = (user.role || '').toLowerCase()
  const sidebarItems = ALL_SIDEBAR_ITEMS[userRole] || []
  console.log(sidebarItems)
  React.useEffect(() => {
    const getDefaultExpandedItems = () => {
      switch (userRole) {
        case 'production_manager':
          return ['Production', 'Inventory']
        case 'reception':
          return ['CRM', 'Communications', 'Point of Sale']
        case 'technician':
          return ['Production', 'Inventory']
        default:
          return []
      }
    }
    setExpandedItems(getDefaultExpandedItems())
  }, [userRole])

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


  // If no sidebar items, don't render
  if (filteredItems.length === 0) {
    return null
  }

  // Get role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'production_manager': return 'Production Manager'
      case 'inventory_manager': return 'Inventory Manager'
      case 'technician': return 'Technician'
      case 'reception': return 'Reception'
      case 'support_agent': return 'Support Agent'
      default: return 'Staff Member'
    }
  }

  // Get role icon
  const getRoleIcon = () => {
    switch (userRole) {
      case 'production_manager': return Wrench
      case 'inventory_manager': return Archive
      case 'technician': return Wrench
      case 'reception': return Building2
      case 'support_agent': return LifeBuoy
      default: return Users
    }
  }

  const RoleIcon = getRoleIcon()
  const roleDisplayName = getRoleDisplayName()

  // console.log (items)
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-indigo-50 via-white to-purple-50 border-r border-indigo-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-center border-b border-indigo-200 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
              <RoleIcon size={20} />
            </div>
            <span>
              Top<span className="font-light">Design</span>
            </span>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50/50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-indigo-200">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-600">Staff</p>
              <p className="text-sm font-bold text-indigo-900">{roleDisplayName}</p>
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
                      ? 'text-indigo-900 bg-indigo-100/80 shadow-sm'
                      : 'text-indigo-700 hover:bg-indigo-50 hover:text-indigo-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-indigo-600' : 'text-indigo-500'} />
                      <span>{item.label}</span>
                    </div>
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown size={16} className="text-indigo-500" />
                    ) : (
                      <ChevronRight size={16} className="text-indigo-500" />
                    )}
                  </button>

                  <div className={`space-y-1 overflow-hidden transition-all duration-300 ${expandedItems.includes(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path!}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ml-4 ${isActive(child.path)
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900'
                          }`}
                      >
                        <child.icon size={16} className={`transition-colors ${isActive(child.path) ? 'text-white' : 'text-indigo-500 group-hover:text-indigo-700'}`} />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(item.path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900'
                    }`}
                >
                  <item.icon size={18} className={`transition-colors ${isActive(item.path) ? 'text-white' : 'text-indigo-500 group-hover:text-indigo-700'}`} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile / Footer Section */}
        <div className="border-t border-indigo-200 p-4 space-y-3 bg-gradient-to-b from-white to-indigo-50/50">
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-indigo-200 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-indigo-900">{user?.name || 'Staff'}</p>
              <p className="truncate text-xs text-indigo-600">{roleDisplayName}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-white p-2.5 text-sm font-medium text-indigo-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm hover:shadow-md"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default StaffSidebar