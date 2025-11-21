// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, currentUserHasPermission, getAuthUser } from '@/utils/apiClient'

export default function InventoryTopNav() {
  const navigate = useNavigate()
  const user = getAuthUser()
  const isInventoryRole = user?.role_id === 8 || user?.role_id === 7 || user?.role_id === 1 // Inventory/Production manager + Owner

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  if (!isInventoryRole) return null

  return (
    <header className="bg-emerald-900 text-emerald-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-emerald-950">
            INV
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">Role</p>
            <p className="text-sm font-semibold">Inventory / Store</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          <Link to="/dashboard/inventory" className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50">
            Overview
          </Link>

          {/* Core inventory objects */}
          {currentUserHasPermission('material.view') && (
            <Link to="/inventory/materials" className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50">
              Materials
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link to="/inventory/suppliers" className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50">
              Suppliers
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link to="/inventory/stock-movements" className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50">
              Stock movements
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link to="/inventory/purchase-orders" className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50">
              Purchase orders
            </Link>
          )}
          {currentUserHasPermission('inventory.manage') && (
            <Link to="/inventory/bom-templates" className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50">
              BOM templates
            </Link>
          )}

          {/* Reports */}
          {currentUserHasPermission('report.view') && (
            <Link to="/inventory/reports" className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50">
              Reports
            </Link>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="text-xs font-medium text-red-100 hover:text-white border border-red-300/70 bg-red-500/10 hover:bg-red-500/80 rounded-full px-3 py-1 transition"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
