// @ts-nocheck
import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { 
  Menu, 
  Shield,
  Users,
  FileText,
  CreditCard,
  Receipt,
  LayoutDashboard
} from 'lucide-react'

const QUICK_LINKS = [
  { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/admin/users', label: 'Users', icon: Users },
  { path: '/dashboard/admin/finance/invoices', label: 'Invoices', icon: FileText },
  { path: '/dashboard/admin/finance/payments', label: 'Payments', icon: CreditCard },
  { path: '/dashboard/admin/pos/terminal', label: 'POS', icon: Receipt },
]

interface AdminTopNavProps {
  onMenuClick?: () => void
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getAuthUser()

  if (!user || ![1, 2].includes(user.role_id)) {
    return null
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-slate-800">
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Left: Mobile Menu + Branding */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <span className="font-bold hidden sm:inline-block tracking-tight text-lg">
              Admin<span className="font-light text-slate-400">Panel</span>
            </span>
          </div>
        </div>

        {/* Center: Visible Quick Links */}
        <nav className="hidden md:flex items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <link.icon size={14} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-xs font-bold">{user?.name || 'Administrator'}</span>
            <span className="text-[10px] text-slate-500 uppercase">Full Access</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold bg-red-600/10 text-red-500 border border-red-600/20 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}