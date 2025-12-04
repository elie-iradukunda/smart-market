// @ts-nocheck
import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, ListOrdered, Menu } from 'lucide-react'
import { getAuthUser } from '@/utils/apiClient'

const linkBase =
  'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors'

interface SalesTopNavProps {
  onMenuClick?: () => void
}

export default function SalesTopNav({ onMenuClick }: SalesTopNavProps) {
  const user = getAuthUser()
  const isSalesRep = user?.role_id === 9

  if (!isSalesRep) return null

  const links = [
    { to: '/dashboard/sales', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/crm/leads', label: 'Leads', icon: Users },
    { to: '/crm/quotes', label: 'Quotes', icon: FileText },
    { to: '/orders', label: 'Orders', icon: ListOrdered },
  ]

  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white shadow-lg sticky top-0 z-30 backdrop-blur-sm border-b border-blue-800/50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu + Role Badge */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-md"></div>
              <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs sm:text-sm font-bold text-white shadow-lg ring-2 ring-white/20">
                SL
              </span>
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-blue-200/90 font-medium">Role</p>
              <p className="text-xs sm:text-sm font-bold text-white">Sales Rep</p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 rounded-full bg-white/10 px-1.5 py-1 backdrop-blur-sm">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-900 shadow-md scale-105'
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
