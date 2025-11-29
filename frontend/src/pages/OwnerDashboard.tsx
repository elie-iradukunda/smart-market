// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

import { fetchUsers, createWorkOrder, fetchOrders } from '@/api/apiClient'

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
  const user = getAuthUser()

  // Guard: only admin/owner role (role_id === 1) may access this dashboard
  if (!user || user.role_id !== 1) {
    navigate('/login')
    return null
  }

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
    fetchOrders()
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
    // Dashboard shell: Owner top navbar + sidebar + main content
    <div className="min-h-screen font-['Inter',_sans-serif] bg-slate-50">
      <OwnerTopNav />
      {/* Full-width shell with smaller side padding so content starts closer to the left */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4">

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden md:flex w-64 flex-col rounded-3xl bg-white shadow-xl border border-slate-100 py-6 px-4 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <h2 className="mt-2 text-lg font-bold text-slate-900">Owner Control</h2>
            </div>

            <nav className="flex-1 space-y-1 text-sm">
              <DashboardLink to="/dashboard/owner" label="Dashboard" IconName="file-text" />
              <DashboardLink to="/orders" label="Operations" IconName="shopping-cart" />
              <DashboardLink to="/finance/reports" label="Finance" IconName="banknote" />
              <DashboardLink to="/crm/leads" label="Sales" IconName="users" />
              <DashboardLink to="/admin/users" label="Team" IconName="users" />
              <DashboardLink to="/admin/system-settings" label="Settings" IconName="settings" />
            </nav>

            <button
              onClick={handleLogout}
              className="mt-auto inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-black transition"
            >
              Sign out
            </button>
          </aside>

          {/* Main content area */}
          <main className="flex-1 space-y-6">
            {/* Top header row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Today&apos;s overview of sales, production, and team activity for TOP Design.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>System healthy</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="sm:hidden inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Hero + AI card row */}
            <div className="grid gap-6 lg:grid-cols-[2.1fr,1.4fr] items-stretch">
              {/* Hero Section */}
              <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl p-7 lg:p-9 overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
                  <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                <div className="relative z-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Business Control</p>
                  <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                    Your
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-cyan-500 to-emerald-500">
                      Enterprise Platform
                    </span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl">
                    Monitor finance, production and customer pipelines in one clean owner workspace.
                  </p>

                  <dl className="mt-6 grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100 shadow-sm">
                      <dt className="text-[11px] font-medium text-slate-500">Open work orders</dt>
                      <dd className="mt-1 text-xl font-bold text-slate-900">13</dd>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 border border-emerald-100 shadow-sm">
                      <dt className="text-[11px] font-medium text-emerald-700">Invoices unpaid</dt>
                      <dd className="mt-1 text-xl font-bold text-emerald-900">$3,200</dd>
                    </div>
                    <div className="rounded-2xl bg-amber-50 px-4 py-3 border border-amber-200 shadow-sm">
                      <dt className="text-[11px] font-medium text-amber-700">Materials at risk</dt>
                      <dd className="mt-1 text-xl font-bold text-amber-900">2</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* AI / insights card */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl relative overflow-hidden p-6 flex flex-col justify-between min-h-[220px]">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_#38bdf8_0,_transparent_60%),_radial-gradient(circle_at_bottom,_#a855f7_0,_transparent_55%)]" />
                  <div className="relative z-10 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">AI & Insights</p>
                    <p className="text-lg font-semibold text-white">Run AI overview & reports</p>
                    <p className="text-xs text-slate-200 max-w-xs">
                      Use AI to surface anomalies in orders, cashflow and production before they become problems.
                    </p>
                  </div>
                  <div className="mt-4 relative z-10 flex flex-wrap gap-2">
                    <Link
                      to="/ai/overview"
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-1.5 text-xs font-semibold text-white shadow-lg hover:from-purple-600 hover:to-cyan-500"
                    >
                      <span className="mr-1.5">🚀</span> Launch AI Overview
                    </Link>
                    <Link
                      to="/finance/reports"
                      className="inline-flex items-center rounded-full border border-slate-500/60 bg-slate-800/60 px-3 py-1.5 text-[11px] font-medium text-slate-100 hover:bg-slate-700"
                    >
                      View Finance reports
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing groups / cards below, unchanged in logic */}
            <div className="space-y-8">
              <GroupCard title="Financial Performance" iconName="banknote" iconColor="text-green-500" animationDelay="delay-100">
                <DashboardLink to="/finance/reports" label="Finance Reports" IconName="banknote" iconColorClass="text-green-500" />
                <DashboardLink to="/finance/invoices" label="Invoices" IconName="file-text" />
                <DashboardLink to="/finance/payments" label="Payments" IconName="file-text" />
                <DashboardLink to="/pos/sales-history" label="POS Sales History" IconName="shopping-cart" />
                <DashboardLink to="/finance/journals" label="Journal Entries" IconName="file-text" />
              </GroupCard>

              <GroupCard title="Operations & Production" iconName="factory" iconColor="text-orange-500" animationDelay="delay-200">
                <DashboardLink to="/orders" label="Customer Orders" IconName="shopping-cart" />
                <DashboardLink to="/production/work-orders" label="Work Orders" IconName="factory" iconColorClass="text-orange-500" />
                <DashboardLink to="/inventory/materials" label="Raw Materials" IconName="shopping-cart" />
                <DashboardLink to="/inventory/purchase-orders" label="Purchase Orders" IconName="file-text" />
              </GroupCard>

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GroupCard title="Sales & Customer Relations" iconName="users" iconColor="text-blue-500" animationDelay="delay-300">
                  <DashboardLink to="/crm/leads" label="Sales Leads" IconName="users" />
                  <DashboardLink to="/crm/quotes" label="Quotes Management" IconName="file-text" />
                  <DashboardLink to="/orders" label="Sales Orders" IconName="shopping-cart" iconColorClass="text-blue-500" />
                  <DashboardLink to="/marketing/campaigns" label="Marketing Campaigns" IconName="megaphone" />
                  <DashboardLink to="/marketing/ad-performance" label="Ad Performance" IconName="megaphone" />
                </GroupCard>

                <div className="space-y-6">
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
          </main>
        </div>
      </div>
    </div>
  )
}