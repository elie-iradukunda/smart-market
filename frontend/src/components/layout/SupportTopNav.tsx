// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { Menu } from 'lucide-react'

const SUPPORT_LINKS = [
    { path: '/dashboard/support', label: 'Overview' },
    { path: '/communications', label: 'Inbox' },
    { path: '/crm/customers', label: 'Customers' },
]

interface SupportTopNavProps {
    onMenuClick?: () => void
}

export default function SupportTopNav({ onMenuClick }: SupportTopNavProps) {
    const navigate = useNavigate()
    const user = getAuthUser()

    // Only for Support Agent role (12)
    if (!user || user.role_id !== 12) {
        return null
    }

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <header className="bg-gradient-to-r from-teal-900 via-cyan-900 to-teal-900 text-white shadow-lg sticky top-0 z-30 backdrop-blur-sm border-b border-teal-800/50">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
                {/* Left: Mobile Menu + Role Badge */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-shrink-0">
                    <button
                        type="button"
                        className="md:hidden p-2 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={onMenuClick}
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-400/30 rounded-full blur-md"></div>
                            <span className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-xs sm:text-sm font-bold text-white shadow-lg ring-2 ring-white/20">
                                SA
                            </span>
                        </div>
                        <div className="leading-tight hidden sm:block">
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-teal-200/90 font-medium">Role</p>
                            <p className="text-xs sm:text-sm font-bold text-white">Support</p>
                        </div>
                    </div>
                </div>

                {/* Center: Navigation Links */}
                <nav className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center">
                    {SUPPORT_LINKS.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-full text-xs sm:text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
                        >
                            <span className="relative z-10">{link.label}</span>
                            <div className="absolute inset-0 rounded-lg sm:rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    ))}
                </nav>

                {/* Right: Logout Button */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="group relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white border border-red-400/60 bg-red-500/20 hover:bg-red-500/40 hover:border-red-400 rounded-lg sm:rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                    >
                        <span className="relative z-10">Logout</span>
                        <div className="absolute inset-0 rounded-lg sm:rounded-full bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </div>
            </div>
        </header>
    )
}
