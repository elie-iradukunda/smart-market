// @ts-nocheck
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { 
  Menu, 
  LayoutDashboard, 
  ShoppingCart, 
  Banknote, 
  Users, 
  Settings,
  Search
} from 'lucide-react'

const NAV_LINKS = [
  { path: '/dashboard/owner', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/orders', label: 'Operations', icon: ShoppingCart },
  { path: '/finance/reports', label: 'Finance', icon: Banknote },
  { path: '/crm/leads', label: 'Sales', icon: Users },
  { path: '/admin/users', label: 'Team', icon: Users },
]

const ROUTE_CANDIDATES = [
  { path: '/dashboard/owner', label: 'Dashboard', keywords: ['dashboard', 'home'] },
  { path: '/orders', label: 'Operations', keywords: ['orders', 'operations'] },
  { path: '/finance/reports', label: 'Finance', keywords: ['finance', 'reports'] },
  { path: '/crm/leads', label: 'Sales', keywords: ['sales', 'leads'] },
  { path: '/admin/users', label: 'Team', keywords: ['team', 'users'] },
]

export default function OwnerTopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const user = getAuthUser()

  if (!user || user.role_id !== 1) return null

  const handleLogout = () => {
    clearAuth()
    window.location.href = '/login'
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-300">
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tracking-tight">TOP</span>
              <span className="text-xl font-light text-cyan-400">Design</span>
            </div>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-white/10 text-cyan-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Logout */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 gap-1 transition-colors ${
                isActive(link.path) ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              <link.icon size={20} />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}