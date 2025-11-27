// @ts-nocheck
import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, ListOrdered } from 'lucide-react'
import { getAuthUser } from '@/utils/apiClient'

const linkBase =
  'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors'

export default function SalesTopNav() {
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
    <div className="w-full border-b border-blue-500/40 bg-gradient-to-r from-[#043b84] via-[#0555b0] to-[#0fb3ff] shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-50">
          Sales Workspace
        </p>
        <nav className="flex items-center gap-1.5 rounded-full bg-white/10 px-1.5 py-1 backdrop-blur-sm">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? 'bg-white text-[#043b84] shadow-sm'
                    : 'text-blue-50 hover:bg-white/15'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
