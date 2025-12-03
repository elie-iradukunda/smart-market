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
    <nav className="bg-blue-900/95 backdrop-blur-sm shadow-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            {onMenuClick && (
              <button
                type="button"
                className="lg:hidden -ml-2 p-2 text-blue-100 hover:text-white"
                onClick={onMenuClick}
              >
                <Menu size={24} />
              </button>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#67E8F9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20a6 6 0 0 0 0-12v12" />
              <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4" />
              <path d="M18 10a6 6 0 0 1 0 12" />
            </svg>
            <span className="text-2xl font-extrabold text-white tracking-wider">TOP</span>
            <span className="text-2xl font-light text-cyan-400">Design</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:text-cyan-400 font-medium py-2 px-1 border-b-2 border-transparent hover:border-cyan-400 transition duration-300"
              >
                {link.label}
              </Link>
            ))}

            {/* Global search input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 lg:w-56 rounded-full border border-blue-300/60 bg-blue-900/40 px-3 py-1.5 text-xs text-blue-50 placeholder-blue-200/70 focus:outline-none focus:ring-1 focus:ring-cyan-300 focus:border-cyan-300"
              />

              {/* Suggestions dropdown */}
              {search.trim() && (
                <div className="absolute right-0 mt-1 w-56 lg:w-64 rounded-xl bg-white shadow-xl border border-slate-200 text-xs text-slate-800 z-50">
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
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
                    >
                      <span className="block font-semibold text-slate-900">{route.label}</span>
                      <span className="block text-[10px] text-slate-500 truncate">{route.path}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Right side: user label + change password + logout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-semibold text-blue-100/90">
              Business Owner
            </span>
            <Link
              to="/account/change-password"
              className="text-xs font-medium text-blue-100 hover:text-cyan-200 underline underline-offset-2"
            >
              Change password
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm font-medium text-red-100 hover:text-white rounded-full px-3 py-1 border border-red-200/60 bg-red-500/70 hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
