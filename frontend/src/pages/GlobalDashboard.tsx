// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { fetchUsers, fetchOrders, fetchPOSSales, fetchFinancialOverview, fetchWorkLogs } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PermissionGate from '@/components/common/PermissionGate'
import { getRequiredPermission } from '@/utils/routePermissions'

// Icon Component
const Icon = ({ name, className }) => {
  const iconMap = {
    'banknote': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20a6 6 0 0 0 0-12v12" /><path d="M12 20a6 6 0 0 1 0-12v12" /><path d="M16 10H8" /></svg>
    ),
    'factory': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="12" x="2" y="6" rx="2" /><path d="M7 18v-4M12 18v-4M17 18v-4M4 10h16" /></svg>
    ),
    'users': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    'shopping-cart': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.72a2 2 0 0 0 2-1.58L23 6H6" /></svg>
    ),
    'file-text': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5M9 13h6M9 17h6M9 9h3" /></svg>
    ),
    'settings': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2h-.44a2 2 0 0 0-2 2v.44a2 2 0 0 1 2 2h.44a2 2 0 0 0 2 2v.44a2 2 0 0 1 2 2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1-2-2h-.44a2 2 0 0 0-2-2v-.44a2 2 0 0 1-2-2h-.44a2 2 0 0 0-2-2v-.44a2 2 0 0 1-2-2h-.44z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    'briefcase': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    ),
    'megaphone': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 11a4 4 0 0 1 0 8" /><path d="M11 5v16" /><path d="M18 8l-3 3v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
    ),
    'package': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
    ),
    'bar-chart': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
    ),
    'message-square': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    'zap': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    ),
    'clipboard': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
    ),
    'truck': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 3h5l-5 5h5" /><path d="M21 8v8a2 2 0 0 1-2 2h-3" /><rect width="8" height="14" x="3" y="8" rx="2" /><path d="M5 8h6" /></svg>
    ),
    'store': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 7h14l-1 10H6L5 7z" /><path d="M5 7l-1-4H2" /><path d="M9 11v6" /><path d="M15 11v6" /><path d="M12 3v4" /></svg>
    ),
  }
  return iconMap[name] || <div className={className}>&bull;</div>
}

const DashboardLink = ({ to, label, IconName, iconColorClass = 'text-cyan-400', linkColorClass = 'bg-white hover:bg-cyan-50/50', permission = null }) => {
  const requiredPermission = permission !== null ? permission : getRequiredPermission(to)
  
  // If no permission required, show link directly
  if (!requiredPermission) {
    return (
      <Link
        to={to}
        className={`flex items-center space-x-3 p-3 transition duration-300 rounded-xl border border-gray-100 shadow-sm ${linkColorClass} hover:shadow-lg transform hover:scale-[1.02]`}
      >
        <div className={`p-1.5 rounded-lg border border-gray-100 ${linkColorClass}`}>
          <Icon name={IconName} className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-wide">{label}</span>
      </Link>
    )
  }
  
  // If permission required, wrap with PermissionGate
  return (
    <PermissionGate permission={requiredPermission}>
      <Link
        to={to}
        className={`flex items-center space-x-3 p-3 transition duration-300 rounded-xl border border-gray-100 shadow-sm ${linkColorClass} hover:shadow-lg transform hover:scale-[1.02]`}
      >
        <div className={`p-1.5 rounded-lg border border-gray-100 ${linkColorClass}`}>
          <Icon name={IconName} className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-wide">{label}</span>
      </Link>
    </PermissionGate>
  )
}

const StatCard = ({ title, value, icon, color = 'blue', loading = false }) => (
  <div className={`rounded-2xl border border-${color}-100 bg-white/95 backdrop-blur-sm p-6 shadow-xl`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        <p className={`mt-2 text-2xl font-bold text-${color}-900`}>
          {loading ? '...' : value}
        </p>
      </div>
      <div className={`p-3 rounded-xl bg-${color}-50`}>
        <Icon name={icon} className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
)

const GroupCard = ({ title, children, iconName, iconColor = 'text-cyan-400' }) => (
  <div className="rounded-2xl border border-blue-100 bg-white/90 backdrop-blur-sm p-6 shadow-xl space-y-4">
    <div className="flex items-center space-x-3">
      <Icon name={iconName} className={`w-7 h-7 ${iconColor}`} />
      <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  </div>
)

export default function GlobalDashboard() {
  const navigate = useNavigate()
  const user = getAuthUser()

  const [dashboardStats, setDashboardStats] = useState({
    todaySales: 0,
    totalRevenue: 0,
    outstandingInvoices: 0,
    openWorkOrders: 0,
    totalOrders: 0,
    totalCustomers: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoadingStats(true)

    // Load dashboard statistics
    Promise.all([
      fetchPOSSales().catch(() => []),
      fetchFinancialOverview().catch(() => ({ total_revenue: 0, outstanding_amount: 0 })),
      fetchWorkLogs().catch(() => []),
      fetchOrders().catch(() => []),
      fetchUsers().catch(() => [])
    ])
      .then(([posSales, financial, workLogs, orders, users]) => {
        if (!isMounted) return

        // Calculate today's sales
        const today = new Date().toISOString().slice(0, 10)
        const todaySales = (posSales || []).filter((sale: any) => {
          const saleDate = new Date(sale.created_at || sale.date).toISOString().slice(0, 10)
          return saleDate === today
        }).reduce((sum: number, sale: any) => sum + (Number(sale.total) || 0), 0)

        // Calculate open work orders
        const openWorkOrders = (workLogs || []).filter((log: any) => log.work_order_id).length

        setDashboardStats({
          todaySales,
          totalRevenue: Number(financial.total_revenue) || 0,
          outstandingInvoices: Number(financial.outstanding_amount) || 0,
          openWorkOrders,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalCustomers: Array.isArray(users) ? users.filter((u: any) => u.role_id === 13).length : 0
        })
        setLoadingStats(false)
      })
      .catch(() => {
        if (!isMounted) return
        setLoadingStats(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Global Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.name || 'User'}. Overview of all business activities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>System operational</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Today's Sales"
          value={`RF ${dashboardStats.todaySales.toLocaleString()}`}
          icon="banknote"
          color="green"
          loading={loadingStats}
        />
        <StatCard
          title="Total Revenue"
          value={`RF ${dashboardStats.totalRevenue.toLocaleString()}`}
          icon="banknote"
          color="blue"
          loading={loadingStats}
        />
        <StatCard
          title="Outstanding Invoices"
          value={`RF ${dashboardStats.outstandingInvoices.toLocaleString()}`}
          icon="file-text"
          color="amber"
          loading={loadingStats}
        />
        <StatCard
          title="Open Work Orders"
          value={dashboardStats.openWorkOrders}
          icon="factory"
          color="orange"
          loading={loadingStats}
        />
        <StatCard
          title="Total Orders"
          value={dashboardStats.totalOrders}
          icon="shopping-cart"
          color="purple"
          loading={loadingStats}
        />
        <StatCard
          title="Total Customers"
          value={dashboardStats.totalCustomers}
          icon="users"
          color="cyan"
          loading={loadingStats}
        />
      </div>

      {/* Quick Access Sections - All Pages Available to All Users */}
      <div className="space-y-8">
        {/* Financial Management */}
        <GroupCard title="Financial Management" iconName="banknote" iconColor="text-green-500">
          <DashboardLink to="/finance/reports" label="Finance Reports" IconName="banknote" iconColorClass="text-green-500" />
          <DashboardLink to="/finance/invoices" label="Invoices" IconName="file-text" />
          <DashboardLink to="/finance/payments" label="Payments" IconName="file-text" />
          <DashboardLink to="/finance/accounts" label="Chart of Accounts" IconName="file-text" />
          <DashboardLink to="/finance/journals" label="Journal Entries" IconName="file-text" />
          <DashboardLink to="/pos/terminal" label="POS Terminal" IconName="shopping-cart" />
          <DashboardLink to="/pos/sales-history" label="POS Sales History" IconName="shopping-cart" />
        </GroupCard>

        {/* Operations & Production */}
        <GroupCard title="Operations & Production" iconName="factory" iconColor="text-orange-500">
          <DashboardLink to="/orders" label="Customer Orders" IconName="shopping-cart" />
          <DashboardLink to="/production/work-orders" label="Work Orders" IconName="factory" iconColorClass="text-orange-500" />
          <DashboardLink to="/production/schedule" label="Production Schedule" IconName="clipboard" />
          <DashboardLink to="/production/new-order" label="New Work Order" IconName="factory" />
        </GroupCard>

        {/* Inventory Management */}
        <GroupCard title="Inventory Management" iconName="package" iconColor="text-purple-500">
          <DashboardLink to="/inventory/materials" label="Raw Materials" IconName="package" />
          <DashboardLink to="/inventory/products" label="Products" IconName="shopping-cart" />
          <DashboardLink to="/inventory/purchase-orders" label="Purchase Orders" IconName="file-text" />
          <DashboardLink to="/inventory/suppliers" label="Suppliers" IconName="users" />
          <DashboardLink to="/inventory/stock-movements" label="Stock Movements" IconName="truck" />
          <DashboardLink to="/inventory/bom-templates" label="BOM Templates" IconName="file-text" />
          <DashboardLink to="/inventory/reports" label="Inventory Reports" IconName="bar-chart" />
        </GroupCard>

        {/* Sales & Customer Relations */}
        <GroupCard title="Sales & Customer Relations" iconName="users" iconColor="text-blue-500">
          <DashboardLink to="/crm/customers" label="Customers" IconName="users" />
          <DashboardLink to="/crm/leads" label="Sales Leads" IconName="users" />
          <DashboardLink to="/crm/quotes" label="Quotes Management" IconName="file-text" />
          <DashboardLink to="/orders" label="Sales Orders" IconName="shopping-cart" iconColorClass="text-blue-500" />
        </GroupCard>

        {/* Marketing */}
        <GroupCard title="Marketing & Campaigns" iconName="megaphone" iconColor="text-pink-500">
          <DashboardLink to="/marketing/campaigns" label="Campaigns" IconName="megaphone" />
          <DashboardLink to="/marketing/ads" label="Ads Management" IconName="megaphone" />
          <DashboardLink to="/marketing/ad-performance" label="Ad Performance" IconName="bar-chart" />
        </GroupCard>

        {/* Communications */}
        <GroupCard title="Communications" iconName="message-square" iconColor="text-indigo-500">
          <DashboardLink to="/communications/inbox" label="Team Inbox" IconName="message-square" />
        </GroupCard>

        {/* Reports & Analytics */}
        <GroupCard title="Reports & Analytics" iconName="bar-chart" iconColor="text-teal-500">
          <DashboardLink to="/finance/reports" label="Financial Reports" IconName="bar-chart" />
          <DashboardLink to="/reports/operations" label="Operations Reports" IconName="bar-chart" />
          <DashboardLink to="/reports/production" label="Production Reports" IconName="bar-chart" />
          <DashboardLink to="/inventory/reports" label="Inventory Reports" IconName="bar-chart" />
        </GroupCard>

        {/* AI & Insights */}
        <GroupCard title="AI & Insights" iconName="zap" iconColor="text-yellow-500">
          <DashboardLink to="/ai/overview" label="AI Overview" IconName="zap" />
        </GroupCard>

        {/* Administration - Available to All Users */}
        <GroupCard title="Administration & System" iconName="settings" iconColor="text-gray-600">
          <DashboardLink to="/admin/users" label="Manage Users" IconName="users" />
          <DashboardLink to="/admin/roles" label="Roles & Permissions" IconName="settings" />
          <DashboardLink to="/admin/employee-activity" label="Employee Activity" IconName="users" />
          <DashboardLink to="/admin/audit-logs" label="Audit Logs" IconName="file-text" />
          <DashboardLink to="/admin/system-settings" label="System Settings" IconName="settings" />
          <DashboardLink to="/account/change-password" label="Change Password" IconName="settings" />
          <DashboardLink to="/files" label="Files" IconName="file-text" />
        </GroupCard>
      </div>
    </DashboardLayout>
  )
}

