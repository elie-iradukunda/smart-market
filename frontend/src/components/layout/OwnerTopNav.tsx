// @ts-nocheck
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { Menu } from 'lucide-react'

const NAV_LINKS = [
  { path: '/dashboard/owner', label: 'Dashboard' },
  { path: '/orders', label: 'Operations' },
  { path: '/finance/reports', label: 'Finance' },
  { path: '/crm/leads', label: 'Sales' },
  { path: '/admin/users', label: 'Team' },
  { path: '/admin/system-settings', label: 'Settings' },
]

const ROUTE_CANDIDATES: { path: string; label: string; keywords: string[] }[] = [
  { path: '/dashboard/owner', label: 'Owner dashboard', keywords: ['dashboard', 'home', 'overview'] },
  { path: '/orders', label: 'Orders & operations', keywords: ['orders', 'order', 'operations'] },
  { path: '/finance/reports', label: 'Finance reports', keywords: ['finance', 'report', 'reports', 'financial'] },
  { path: '/crm/leads', label: 'CRM leads', keywords: ['crm', 'leads', 'lead', 'sales'] },
  { path: '/inventory/materials', label: 'Inventory materials', keywords: ['inventory', 'materials', 'stock', 'warehouse'] },
  { path: '/marketing', label: 'Marketing overview', keywords: ['marketing', 'campaigns', 'ads', 'ad performance'] },
  { path: '/ai/overview', label: 'AI insights', keywords: ['ai', 'insights', 'prediction'] },
  { path: '/admin/users', label: 'Team / users', keywords: ['team', 'users', 'user management'] },
  { path: '/admin/system-settings', label: 'System settings', keywords: ['settings', 'system', 'config'] },
  { path: '/search', label: 'Global search', keywords: ['search', 'global search'] },
]

export default function OwnerTopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const user = getAuthUser()
  // Only show the owner navbar if the logged-in user is the Admin / Owner (role_id === 1)
  if (!user || user.role_id !== 1) {
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
    const direct = ROUTE_CANDIDATES.find((route) =>
      route.keywords.some((k) => value === k || value.includes(k))
    )

    if (direct) {
      navigate(direct.path)
      return
    }

    // Fallback to global search results page
    navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <header className="bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-900 text-white shadow-lg sticky top-0 z-30 backdrop-blur-sm border-b border-blue-800/50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu + Logo/Brand */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink-0">
          {onMenuClick && (
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-md"></div>
              <div className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg ring-2 ring-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 20a6 6 0 0 0 0-12v12" />
                  <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4" />
                  <path d="M18 10a6 6 0 0 1 0 12" />
                </svg>
              </div>
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">TOP</span>
                <span className="text-lg sm:text-xl font-light text-cyan-300">Design</span>
              </div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-cyan-200/80 font-medium">Business Owner</p>
            </div>
          </div>
        </div>

        {/* Center: Nav Links + Search */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">{link.label}</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}

          {/* Global search input */}
          <form onSubmit={handleSearchSubmit} className="relative ml-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 sm:w-40 lg:w-48 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            {/* Suggestions dropdown */}
            {search.trim() && (
              <div className="absolute right-0 mt-1 w-56 lg:w-64 rounded-xl bg-white shadow-xl border border-slate-200 text-xs text-slate-800 z-50 max-h-80 overflow-y-auto">
                {ROUTE_CANDIDATES.filter((route) => {
                  const v = search.toLowerCase()
                  return (
                    route.label.toLowerCase().includes(v) ||
                    route.keywords.some((k) => k.includes(v) || v.includes(k))
                  )
                }).slice(0, 6).map((route) => (
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
              </div>
            )}
          </form>
        </div>

        {/* Right: Change Password + Logout */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link
            to="/account/change-password"
            className="hidden lg:inline text-xs font-medium text-white/70 hover:text-white underline underline-offset-2 transition-colors"
          >
            Change password
          </Link>
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
