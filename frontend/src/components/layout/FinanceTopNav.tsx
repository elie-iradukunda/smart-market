// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

const FINANCE_LINKS = [
  { path: '/dashboard/accountant', label: 'Overview' },
  { path: '/finance/invoices', label: 'Invoices' },
  { path: '/finance/payments', label: 'Payments' },
  { path: '/finance/journals', label: 'Journal entries' },
  { path: '/finance/reports', label: 'Reports' },
  { path: '/pos/sales-history', label: 'POS history' },
]

export default function FinanceTopNav() {
  const navigate = useNavigate()
  const user = getAuthUser()

  // Only for Accountant role (3)
  if (!user || user.role_id !== 3) {
    return null
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="bg-slate-900 text-slate-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-400 text-xs font-bold text-slate-900">
            AC
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-200/80">Role</p>
            <p className="text-sm font-semibold">Accountant</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          {FINANCE_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-50"
            >
              {link.label}
            </Link>
          ))}
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
