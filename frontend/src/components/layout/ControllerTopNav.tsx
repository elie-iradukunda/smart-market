// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, currentUserHasPermission, getAuthUser } from '@/utils/apiClient'

export default function ControllerTopNav() {
  const navigate = useNavigate()
  const user = getAuthUser()
  const isController = user?.role_id === 6

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  if (!isController) return null

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/90 text-xs font-bold text-slate-900">
            CO
          </span>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Role</p>
            <p className="text-sm font-semibold">Controller</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          <Link to="/dashboard/controller" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
            Overview
          </Link>
          {currentUserHasPermission('report.view') && (
            <Link to="/finance/reports" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Finance reports
            </Link>
          )}
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
          {currentUserHasPermission('material.view') && (
            <Link to="/inventory/materials" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Materials
            </Link>
          )}
          {currentUserHasPermission('stock.move') && (
            <Link to="/inventory/purchase-orders" className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-100">
              Purchase orders
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
