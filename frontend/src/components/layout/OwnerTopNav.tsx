// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'

const NAV_LINKS = [
  { path: '/dashboard/owner', label: 'Dashboard' },
  { path: '/orders', label: 'Operations' },
  { path: '/finance/reports', label: 'Finance' },
  { path: '/crm/leads', label: 'Sales' },
  { path: '/admin/users', label: 'Team' },
  { path: '/admin/system-settings', label: 'Settings' },
]

export default function OwnerTopNav() {
  const navigate = useNavigate()

  const user = getAuthUser()
  // Only show the owner navbar if the logged-in user is the owner (role_id === 1)
  if (!user || user.role_id !== 1) {
    return null
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-900/95 backdrop-blur-sm shadow-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#67E8F9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20a6 6 0 0 0 0-12v12" />
              <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4" />
              <path d="M18 10a6 6 0 0 1 0 12" />
            </svg>
            <span className="text-2xl font-extrabold text-white tracking-wider">TOP</span>
            <span className="text-2xl font-light text-cyan-400">Design</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:text-cyan-400 font-medium py-2 px-1 border-b-2 border-transparent hover:border-cyan-400 transition duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: user label + change password + logout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-semibold text-blue-100/90">
              Business Owner
            </span>
            <Link
              to="/account/change-password"
              className="text-xs font-medium text-blue-100 hover:text-cyan-200 underline underline-offset-2"
            >
              Change password
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm font-medium text-red-100 hover:text-white rounded-full px-3 py-1 border border-red-200/60 bg-red-500/70 hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
