// @ts-nocheck
import React from 'react'
import { Link } from 'react-router-dom'
import { getAuthUser } from '@/utils/apiClient'

const linkBase =
  'flex items-center space-x-3 p-3 transition duration-300 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 shadow-sm hover:shadow-md'

export default function OwnerSideNav() {
  const user = getAuthUser()
  if (!user || user.role_id !== 7) return null

  return (
    <aside className="hidden md:flex w-64 flex-col rounded-3xl bg-white shadow-xl border border-slate-100 py-6 px-4 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <h2 className="mt-2 text-lg font-bold text-slate-900">Owner Control</h2>
      </div>

      <nav className="flex-1 space-y-2 text-sm">
        <Link to="/dashboard/owner" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/90 text-slate-50 text-xs font-bold">D</span>
          <span className="text-slate-900 font-semibold">Dashboard</span>
        </Link>
        <Link to="/orders" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">Op</span>
          <span className="text-slate-900 font-semibold">Operations</span>
        </Link>
        <Link to="/finance/reports" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold">Fi</span>
          <span className="text-slate-900 font-semibold">Finance</span>
        </Link>
        <Link to="/crm/leads" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 text-xs font-bold">Sa</span>
          <span className="text-slate-900 font-semibold">Sales</span>
        </Link>
        <Link to="/admin/users" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-xs font-bold">Tm</span>
          <span className="text-slate-900 font-semibold">Team</span>
        </Link>
        <Link to="/admin/system-settings" className={linkBase}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">St</span>
          <span className="text-slate-900 font-semibold">Settings</span>
        </Link>
      </nav>
    </aside>
  )
}
