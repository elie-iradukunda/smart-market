// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

const TECH_LINKS = [
  { path: '/dashboard/technician', label: 'Overview' },
  { path: '/production/work-orders', label: 'Work orders' },
  { path: '/orders', label: 'Orders' },
  { path: '/inventory/materials', label: 'Materials' },
]

export default function TechnicianTopNav() {
  const navigate = useNavigate()
  const user = getAuthUser()

  // Only for Technician role (5)
  if (!user || user.role_id !== 5) {
    return null
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="bg-sky-900 text-sky-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-400 text-xs font-bold text-sky-950">
            TE
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sky-200/80">Role</p>
            <p className="text-sm font-semibold">Technician</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          {TECH_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-1.5 rounded-full hover:bg-sky-800 text-sky-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="text-xs font-medium text-red-200 hover:text-white border border-red-400/60 bg-red-500/10 hover:bg-red-500/80 rounded-full px-3 py-1 transition"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
