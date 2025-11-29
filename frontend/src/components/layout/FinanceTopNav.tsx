// @ts-nocheck
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { Search, Menu } from 'lucide-react'

const FINANCE_LINKS = [
  { path: '/dashboard/accountant', label: 'Overview' },
  { path: '/finance/invoices', label: 'Invoices' },
  { path: '/finance/payments', label: 'Payments' },
  { path: '/finance/journals', label: 'Journals' },
  { path: '/finance/reports', label: 'Reports' },
]

const SEARCH_ROUTES = [
  { path: '/dashboard/accountant', label: 'Overview', keywords: ['overview', 'dashboard', 'home'] },
  { path: '/finance/invoices', label: 'Invoices', keywords: ['invoice', 'bill', 'receivable'] },
  { path: '/finance/payments', label: 'Payments', keywords: ['payment', 'receipt', 'money', 'cash'] },
  { path: '/finance/journals', label: 'Journals', keywords: ['journal', 'entry', 'ledger', 'book'] },
  { path: '/finance/reports', label: 'Reports', keywords: ['report', 'statement', 'balance', 'profit', 'loss'] },
  { path: '/finance/accounts', label: 'Accounts', keywords: ['account', 'chart', 'coa'] },
]

export default function FinanceTopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const user = getAuthUser()

  // Only for Accountant role (3)
  if (!user || user.role_id !== 3) {
    return null
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const term = (search || '').trim()
    if (!term) return
    const value = term.toLowerCase()

    // Try to find a direct match first
    const direct = SEARCH_ROUTES.find((route) =>
      route.keywords.some((k) => value === k || value.includes(k))
    )

    if (direct) {
      navigate(direct.path)
      setSearch('')
      return
    }

    // Fallback to finance search results page
    navigate(`/finance/search?q=${encodeURIComponent(term)}`)
    setSearch('')
  }

  return (
    <header className="bg-slate-900 text-slate-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              type="button"
              className="lg:hidden -ml-2 p-2 text-slate-200 hover:text-white"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
          )}
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

          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 lg:w-48 rounded-full border border-slate-700 bg-slate-800/60 pl-8 pr-3 py-1.5 text-xs text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Suggestions dropdown */}
            {search.trim() && (
              <div className="absolute right-0 mt-1 w-56 lg:w-64 rounded-xl bg-white shadow-xl border border-slate-200 text-xs text-slate-800 z-50 max-h-80 overflow-y-auto">
                {SEARCH_ROUTES.filter((route) => {
                  const v = search.toLowerCase()
                  return (
                    route.label.toLowerCase().includes(v) ||
                    route.keywords.some((k) => k.includes(v) || v.includes(k))
                  )
                }).slice(0, 8).map((route) => (
                  <button
                    key={route.path}
                    type="button"
                    onClick={() => {
                      navigate(route.path)
                      setSearch('')
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="block font-semibold text-slate-900">{route.label}</span>
                    <span className="block text-[10px] text-slate-500 truncate">{route.path}</span>
                  </button>
                ))}
                {search.trim() && SEARCH_ROUTES.filter((route) => {
                  const v = search.toLowerCase()
                  return (
                    route.label.toLowerCase().includes(v) ||
                    route.keywords.some((k) => k.includes(v) || v.includes(k))
                  )
                }).length === 0 && (
                    <div className="px-3 py-2 text-slate-500">
                      No quick links found. Press Enter to search.
                    </div>
                  )}
              </div>
            )}
          </form>
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
