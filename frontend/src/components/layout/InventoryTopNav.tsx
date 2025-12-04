// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, currentUserHasPermission, getAuthUser } from '@/utils/apiClient'

export default function InventoryTopNav() {
  const navigate = useNavigate()
  const user = getAuthUser()
  const isInventoryRole =
    user?.role_id === 8 ||
    user?.role_id === 1 ||
    user?.role_id === 6 // Manager, Owner/Admin, and Inventory Controller

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  if (!isInventoryRole) return null

  return (
    <header className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 text-white shadow-lg sticky top-0 z-30 backdrop-blur-sm border-b border-emerald-800/50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Role Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-md"></div>
            <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs sm:text-sm font-bold text-white shadow-lg ring-2 ring-white/20">
              INV
            </span>
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-emerald-200/90 font-medium">Role</p>
            <p className="text-xs sm:text-sm font-bold text-white">Inventory / Store</p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center">
          <Link 
            to="/dashboard/inventory" 
            className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
          >
            <span className="relative z-10">Overview</span>
            <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          {currentUserHasPermission('material.view') && (
            <Link 
              to="/inventory/materials" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">Materials</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link 
              to="/inventory/suppliers" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">Suppliers</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link 
              to="/inventory/stock-movements" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">Stock Movements</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link 
              to="/inventory/purchase-orders" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">Purchase Orders</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link 
              to="/inventory/bom-templates" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">BOM Templates</span>
              <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          )}
          {currentUserHasPermission('report.view') && (
            <Link 
              to="/inventory/reports" 
              className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
            >
              <span className="relative z-10">Reports</span>
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
