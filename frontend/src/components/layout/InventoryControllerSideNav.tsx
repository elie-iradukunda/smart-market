// @ts-nocheck
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getAuthUser } from '@/utils/apiClient'

const baseItem =
  'flex items-center justify-between px-3 py-2 rounded-2xl border text-sm transition shadow-sm hover:shadow-md'

export default function InventoryControllerSideNav() {
  const user = getAuthUser()
  const location = useLocation()

  if (!user || user.role_id !== 6) return null

  const isActive = (path: string) => location.pathname === path

  const items = [
    { label: 'Overview', code: 'OV', path: '/dashboard/inventory' },
    { label: 'Materials', code: 'MT', path: '/inventory/materials' },
    { label: 'Suppliers', code: 'SP', path: '/inventory/suppliers' },
    { label: 'Stock movements', code: 'SM', path: '/inventory/stock-movements' },
    { label: 'Purchase orders', code: 'PO', path: '/inventory/purchase-orders' },
    { label: 'BOM templates', code: 'BM', path: '/inventory/bom-templates' },
    { label: 'Inventory reports', code: 'IR', path: '/inventory/reports' },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col rounded-3xl bg-white shadow-xl border border-emerald-100 py-6 px-4 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Workspace</p>
        <h2 className="mt-2 text-lg font-bold text-emerald-900">Inventory control</h2>
        <p className="mt-1 text-xs text-emerald-700/80">
          Focused tools for the controller: stock, movements and purchasing.
        </p>
      </div>

      <nav className="flex-1 space-y-2 text-sm">
        {items.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={
                baseItem +
                ' ' +
                (active
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-100 bg-white text-slate-800 hover:bg-emerald-50/60')
              }
            >
              <div className="flex items-center space-x-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-emerald-50 text-xs font-bold">
                  {item.code}
                </span>
                <span className="font-semibold truncate">{item.label}</span>
              </div>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
