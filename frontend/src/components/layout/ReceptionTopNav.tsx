// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, currentUserHasPermission, getAuthUser } from '@/utils/apiClient'
import { Menu } from 'lucide-react'

interface ReceptionTopNavProps {
  onMenuClick?: () => void
}

export default function ReceptionTopNav({ onMenuClick }: ReceptionTopNavProps) {
  const navigate = useNavigate()
  const user = getAuthUser()
  // Receptionist role ID is 5
  const isReception = user?.role_id === 5

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  if (!isReception) return null

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden text-slate-300 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-slate-900">
              RE
            </span>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Role</p>
              <p className="text-sm font-semibold">Reception</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          <Link to="/dashboard/reception" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
            Overview
          </Link>
          {currentUserHasPermission('lead.create') && (
            <Link to="/crm/leads" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Leads
            </Link>
          )}
          {currentUserHasPermission('customer.view') && (
            <Link to="/crm/customers" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Customers
            </Link>
          )}
          {currentUserHasPermission('quote.create') && (
            <Link to="/crm/quotes" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Quotes
            </Link>
          )}
          {currentUserHasPermission('order.view') && (
            <Link to="/orders" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Orders
            </Link>
          )}
          <Link to="/communications/inbox" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
            Communication
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="text-xs font-medium text-red-200 hover:text-white border border-red-400/60 bg-red-500/10 hover:bg-red-500/80 rounded-full px-3 py-1 transition"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
