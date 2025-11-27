// @ts-nocheck
import React from 'react'
import { Link } from 'react-router-dom'
import { getAuthUser } from '@/utils/apiClient'

const linkBase =
  'flex items-center space-x-3 p-3 transition duration-300 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 shadow-sm hover:shadow-md'

export default function ControllerSideNav() {
  const user = getAuthUser()
  if (!user || user.role_id !== 6) return null

  return (
    <aside className="hidden md:flex w-64 flex-col rounded-3xl bg-white shadow-xl border border-slate-100 py-6 px-4 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <h2 className="mt-2 text-lg font-bold text-slate-900">Controller</h2>
      </div>

      <nav className="flex-1 space-y-2 text-sm">
        <Link to="/controller" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/90 text-slate-50 text-xs font-bold">D</span>
          <span className="text-slate-900 font-semibold">Dashboard</span>
        </Link>
        <Link to="/finance/reports" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold">Fi</span>
          <span className="text-slate-900 font-semibold">Finance</span>
        </Link>
        <Link to="/finance/invoices" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">Inv</span>
          <span className="text-slate-900 font-semibold">Invoices</span>
        </Link>
        <Link to="/finance/payments" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 text-xs font-bold">Pa</span>
          <span className="text-slate-900 font-semibold">Payments</span>
        </Link>
        <Link to="/inventory/materials" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-xs font-bold">St</span>
          <span className="text-slate-900 font-semibold">Stock</span>
        </Link>
        <Link to="/inventory/purchase-orders" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">PO</span>
          <span className="text-slate-900 font-semibold">Purchase orders</span>
        </Link>
      </nav>
    </aside>
  )
}
