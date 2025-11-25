// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

const MARKETING_LINKS = [
  { path: '/dashboard/marketing', label: 'Overview' },
  { path: '/marketing/campaigns', label: 'Campaigns' },
  { path: '/marketing/ad-performance', label: 'Ad performance' },
  { path: '/crm/leads', label: 'Leads' },
  { path: '/finance/reports', label: 'Marketing ROI' },
  { path: '/ai/overview', label: 'AI insights' },
]

export default function MarketingTopNav() {
  const navigate = useNavigate()
  const user = getAuthUser()

  // Only for Marketing Officer role (4)
  if (!user || user.role_id !== 4) {
    return null
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="bg-fuchsia-900 text-fuchsia-50 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-400 text-xs font-bold text-fuchsia-950">
            MK
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.18em] text-fuchsia-200/80">Role</p>
            <p className="text-sm font-semibold">Marketing</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
          {MARKETING_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-1.5 rounded-full hover:bg-fuchsia-800 text-fuchsia-50"
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
