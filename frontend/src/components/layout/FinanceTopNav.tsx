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
    window.location.href = '/login'
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
    <header className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white shadow-lg sticky top-0 z-30 backdrop-blur-sm border-b border-slate-800/50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu + Role Badge */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink-0">
          {onMenuClick && (
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400/30 rounded-full blur-md"></div>
              <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-xs sm:text-sm font-bold text-white shadow-lg ring-2 ring-white/20">
                AC
              </span>
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-200/90 font-medium">Role</p>
              <p className="text-xs sm:text-sm font-bold text-white">Accountant</p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links + Search */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center">
          {FINANCE_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">{link.label}</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}

          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="relative ml-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 sm:w-40 lg:w-48 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
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
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-b-0 transition-colors"
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

        {/* Right: Logout Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="group relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white border border-red-400/60 bg-red-500/20 hover:bg-red-500/40 hover:border-red-400 rounded-lg sm:rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
          >
            <span className="relative z-10">Logout</span>
            <div className="absolute inset-0 rounded-lg sm:rounded-full bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    </header>
  )
}
