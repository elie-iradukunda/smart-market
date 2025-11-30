// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { Menu } from 'lucide-react'

const ADMIN_LINKS = [
  { path: '/dashboard/admin', label: 'Overview' },
  { path: '/admin/users', label: 'Users & Access' },
  { path: '/admin/roles', label: 'Roles' },
  { path: '/admin/audit-logs', label: 'Audit logs' },
  { path: '/admin/system-settings', label: 'System settings' },
  { path: '/ai/overview', label: 'AI overview' },
]

interface AdminTopNavProps {
  onMenuClick?: () => void
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const navigate = useNavigate()
  const user = getAuthUser()

  // Show on Admin (2) or Owner (1)
  if (!user || ![1, 2].includes(user.role_id)) {
    return null
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900/95 text-slate-50 shadow-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden text-slate-300 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-400 text-xs font-bold text-slate-900">
              AD
            </span>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-200/80">Role</p>
              <p className="text-sm font-semibold">Admin</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs font-medium">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-slate-50"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/account/change-password"
            className="hidden sm:inline text-xs font-medium text-slate-100/80 hover:text-white underline underline-offset-2"
          >
            Change password
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-red-100 hover:text-white border border-red-300/70 bg-red-500/10 hover:bg-red-500/80 rounded-full px-3 py-1 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
