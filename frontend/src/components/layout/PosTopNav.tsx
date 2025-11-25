// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, currentUserHasPermission, getAuthUser } from '@/utils/apiClient'

export default function PosTopNav() {
  const navigate = useNavigate()
  const user = getAuthUser()
  // POS is handled primarily by Sales Rep role (role_id 9)
  const isPosRole = user?.role_id === 9

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  if (!isPosRole) return null

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
            POS
          </span>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Role</p>
            <p className="text-sm font-semibold">Cashier</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          <Link to="/dashboard/pos" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
            Overview
          </Link>

          {/* POS core */}
          {currentUserHasPermission('pos.create') && (
            <Link to="/pos/terminal" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              POS Terminal
            </Link>
          )}
          {currentUserHasPermission('pos.create') && (
            <Link to="/pos/sales-history" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Sales History
            </Link>
          )}

          {/* CRM quick links */}
          {currentUserHasPermission('customer.view') && (
            <Link to="/crm/customers" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Customers
            </Link>
          )}
          {currentUserHasPermission('lead.create') && (
            <Link to="/crm/leads" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Leads
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

          {/* Finance */}
          {currentUserHasPermission('invoice.create') && (
            <Link to="/finance/invoices" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Invoices
            </Link>
          )}
          {currentUserHasPermission('payment.create') && (
            <Link to="/finance/payments" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Payments
            </Link>
          )}
          {currentUserHasPermission('journal.create') && (
            <Link to="/finance/journals" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Journals
            </Link>
          )}
          {currentUserHasPermission('report.view') && (
            <Link to="/finance/reports" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Reports
            </Link>
          )}
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
