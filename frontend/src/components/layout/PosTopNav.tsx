// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, currentUserHasPermission, getAuthUser } from '@/utils/apiClient'

import { Menu } from 'lucide-react'

export default function PosTopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate()
  const user = getAuthUser()
  // POS Cashier role (11)
  const isPosRole = user?.role_id === 11

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  if (!isPosRole) return null

  return (
    <header className="bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 text-white shadow-lg sticky top-0 z-30 backdrop-blur-sm border-b border-purple-800/50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Menu + Role Badge */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink-0">
          {onMenuClick && (
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-md"></div>
              <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-[10px] sm:text-xs font-bold text-white shadow-lg ring-2 ring-white/20">
                POS
              </span>
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-purple-200/90 font-medium">Role</p>
              <p className="text-xs sm:text-sm font-bold text-white">Cashier</p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center overflow-x-auto">
          <Link 
            to="/dashboard/pos" 
            className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 whitespace-nowrap"
          >
            <span className="relative z-10">Overview</span>
            <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          {currentUserHasPermission('pos.create') && (
            <Link 
              to="/pos/terminal" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <span className="relative z-10">POS Terminal</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('pos.create') && (
            <Link 
              to="/pos/sales-history" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <span className="relative z-10">Sales History</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('customer.view') && (
            <Link 
              to="/crm/customers" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <span className="relative z-10">Customers</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('order.view') && (
            <Link 
              to="/orders" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <span className="relative z-10">Orders</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
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
