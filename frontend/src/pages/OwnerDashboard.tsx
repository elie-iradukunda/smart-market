// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth } from '@/utils/apiClient'
import { fetchUsers, createWorkOrder, fetchDemoOrders } from '@/api/apiClient'

import OwnerTopNav from '@/components/layout/OwnerTopNav'

// --- Icon Imports (Simulated for visualization) ---
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
    'megaphone': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 11a4 4 0 0 1 0 8" /><path d="M11 5v16" /><path d="M18 8l-3 3v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
    ),
    'cpu': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="16" x="4" y="4" rx="2" /><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M12 2v2M12 20v2M20 12h2M2 12h2" /></svg>
    ),
    'settings': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.44a2 2 0 0 1-2 2h-.44a2 2 0 0 0-2 2v.44a2 2 0 0 1 2 2h.44a2 2 0 0 0 2 2v.44a2 2 0 0 1 2 2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1 2-2h.44a2 2 0 0 0 2-2v-.44a2 2 0 0 1-2-2h-.44a2 2 0 0 0-2-2v-.44a2 2 0 0 1-2-2h-.44a2 2 0 0 0-2-2v-.44a2 2 0 0 1-2-2h-.44a2 2 0 0 0-2-2v-.44a2 2 0 0 1-2-2h-.44z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
    'file-text': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5M9 13h6M9 17h6M9 9h3" /></svg>
    ),
    'shopping-cart': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.72a2 2 0 0 0 2-1.58L23 6H6" /></svg>
    ),
    'briefcase': (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    ),
  }
  return iconMap[name] || <div className={className}>&bull;</div>
}
// --- End Icon Imports ---

const DashboardLink = ({ to, label, IconName, iconColorClass = 'text-cyan-400', linkColorClass = 'bg-white hover:bg-cyan-50/50' }) => (
  <Link
    to={to}
    // Added transition and shadow classes for modern feel
    className={`flex items-center space-x-3 p-3 transition duration-300 rounded-xl border border-gray-100 shadow-sm ${linkColorClass} hover:shadow-lg transform hover:scale-[1.02]`}
  >
    <div className={`p-1.5 rounded-lg border border-gray-100 ${linkColorClass}`}>
      <Icon name={IconName} className={`w-5 h-5 ${iconColorClass}`} />
    </div>
    <span className="text-sm font-semibold text-gray-800 tracking-wide">{label}</span>
  </Link>
)

const GroupCard = ({ title, children, iconName, iconColor = 'text-cyan-400', animationDelay = 'delay-0' }) => (
  // Added animation classes (animate-fadeIn and delay) to simulate better entrance/scrolling look
  <div className={`rounded-2xl border border-blue-100 bg-white/90 backdrop-blur-sm p-6 shadow-xl space-y-4 transition duration-500 hover:shadow-2xl animate-fadeIn ${animationDelay}`}>
    <div className="flex items-center space-x-3">
      <Icon name={iconName} className={`w-7 h-7 ${iconColor}`} />
      <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>
  </div>
)

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [workOrder, setWorkOrder] = useState({ orderId: '', stage: 'Design', assignedTo: '' })

  const [woSaving, setWoSaving] = useState(false)
  const [woError, setWoError] = useState<string | null>(null)
  const [woSuccess, setWoSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchUsers()
      .then((data) => {
        if (!isMounted) return
        setUsers(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        // owner dashboard can still work without users list
      })

    // Load available orders so owner can select instead of typing ID
    fetchDemoOrders()
      .then((data) => {
        if (!isMounted) return
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        // ignore in case orders fail to load; form just won't show options
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setWoSaving(true)
    setWoError(null)
    setWoSuccess(null)

    try {
      if (!workOrder.orderId || !workOrder.assignedTo) {
        setWoError('Please select an order and assignee')
        return
      }

      await createWorkOrder({
        order_id: Number(workOrder.orderId),
        stage: workOrder.stage,
        assigned_to: Number(workOrder.assignedTo),
      })
      setWoSuccess('Work order created and assigned successfully')
      setWorkOrder({ ...workOrder, orderId: '' })
    } catch (err: any) {
      setWoError(err.message || 'Failed to create work order')
    } finally {
      setWoSaving(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    // Custom blue background and font
    <div className="min-h-screen font-['Inter',_sans-serif] bg-gray-50/50">
      <OwnerTopNav />
      {/* --- Main Content Area --- */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        
        {/* --- Hero Section: Clean Title Block with Blue Gradient Accent --- */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl p-8 lg:p-12 overflow-hidden relative">
          
          {/* Subtle Blue/Cyan Gradient Accent */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-r from-blue-100/50 to-cyan-50/50 rounded-t-3xl z-0 opacity-50"></div>

          <div className="relative z-10">
            <p className="text-base font-semibold uppercase tracking-widest text-blue-600">Business Control</p>
            <h1 className="mt-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-500">Enterprise Platform</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-4xl">
              Access and monitor all core operations, finance, and team performance to drive your business forward.
            </p>
          </div>
        </div>

        {/* --- Main Feature Grid --- */}
        <div className="space-y-8">

          {/* Group 1: Finance & Performance */}
          <GroupCard title="Financial Performance" iconName="banknote" iconColor="text-green-500" animationDelay="delay-100">
            <DashboardLink to="/finance/reports" label="Finance Reports" IconName="banknote" iconColorClass="text-green-500" />
            <DashboardLink to="/finance/invoices" label="Invoices" IconName="file-text" />
            <DashboardLink to="/finance/payments" label="Payments" IconName="file-text" />
            <DashboardLink to="/pos/sales-history" label="POS Sales History" IconName="shopping-cart" />
            <DashboardLink to="/finance/journals" label="Journal Entries" IconName="file-text" />
          </GroupCard>

          {/* Group 2: Operations & Inventory */}
          <GroupCard title="Operations & Production" iconName="factory" iconColor="text-orange-500" animationDelay="delay-200">
            <DashboardLink to="/orders" label="Customer Orders" IconName="shopping-cart" />
            <DashboardLink to="/production/work-orders" label="Work Orders" IconName="factory" iconColorClass="text-orange-500" />
            <DashboardLink to="/inventory/materials" label="Raw Materials" IconName="shopping-cart" />
            <DashboardLink to="/inventory/purchase-orders" label="Purchase Orders" IconName="file-text" />
          </GroupCard>

          {/* Group: Create work / assign tasks */}
          <div className="rounded-2xl border border-blue-100 bg-white/95 backdrop-blur-sm p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Icon name="briefcase" className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Create Work / Assign Task</h3>
              </div>
              <span className="text-[11px] uppercase tracking-wide text-blue-500">Production</span>
            </div>
            <p className="text-xs text-gray-600">
              Create a work order for an existing customer order and assign it to a technician or controller.
            </p>
            <form onSubmit={handleCreateWorkOrder} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Order</label>
                <select
                  value={workOrder.orderId}
                  onChange={(e) => setWorkOrder({ ...workOrder, orderId: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select order</option>
                  {orders.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      #{o.id} - {o.customer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Stage</label>
                <select
                  value={workOrder.stage}
                  onChange={(e) => setWorkOrder({ ...workOrder, stage: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Design">Design</option>
                  <option value="Print">Print</option>
                  <option value="Finish">Finish</option>
                  <option value="QC">QC</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Assign to user</label>
                <select
                  value={workOrder.assignedTo}
                  onChange={(e) => setWorkOrder({ ...workOrder, assignedTo: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select user</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3 flex flex-col gap-2 mt-1">
                {woError && (
                  <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1">{woError}</p>
                )}
                {woSuccess && !woError && (
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">{woSuccess}</p>
                )}
                <button
                  type="submit"
                  disabled={woSaving}
                  className="inline-flex items-center justify-center self-start rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {woSaving ? 'Saving…' : 'Create work order'}
                </button>
              </div>
            </form>
          </div>

          {/* Group 3: Sales, Marketing & AI (Combined into a 2-column layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <GroupCard title="Sales & Customer Relations" iconName="users" iconColor="text-blue-500" animationDelay="delay-300">
              <DashboardLink to="/crm/leads" label="Sales Leads" IconName="users" />
              <DashboardLink to="/crm/quotes" label="Quotes Management" IconName="file-text" />
              <DashboardLink to="/orders" label="Sales Orders" IconName="shopping-cart" iconColorClass="text-blue-500" />
              <DashboardLink to="/marketing/campaigns" label="Marketing Campaigns" IconName="megaphone" />
              <DashboardLink to="/marketing/ad-performance" label="Ad Performance" IconName="megaphone" />
            </GroupCard>
            
            <div className="space-y-6">
              {/* AI & Insights Card */}
              {/* Added transition/animation classes */}
              <div className="rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-sm p-6 shadow-xl transition duration-500 hover:shadow-2xl transform hover:-translate-y-0.5 animate-fadeIn delay-400">
                <div className="flex items-center space-x-3 mb-4">
                  <Icon name="cpu" className="w-7 h-7 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">AI & Core Insights</h3>
                </div>
                {/* AI Button with Gradient (Prominent CTA) */}
                <Link
                  to="/ai/overview"
                  className="flex items-center justify-center rounded-xl px-4 py-3 font-extrabold text-white tracking-wider text-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 transition shadow-lg transform hover:scale-[1.01]"
                >
                  <span className="mr-2 text-xl">🚀</span> Launch AI Overview
                </Link>
              </div>

              {/* Team & Admin Card */}
              <GroupCard title="Team & Administration" iconName="settings" iconColor="text-gray-600" animationDelay="delay-500">
                <DashboardLink to="/communications/inbox" label="Team Inbox" IconName="briefcase" />
                <DashboardLink to="/admin/users" label="Manage Users" IconName="users" />
                <DashboardLink to="/admin/roles" label="Roles & Permissions" IconName="settings" />
                <DashboardLink to="/admin/audit-logs" label="Audit Logs" IconName="file-text" />
                <DashboardLink to="/admin/system-settings" label="System Settings" IconName="settings" />
              </GroupCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}