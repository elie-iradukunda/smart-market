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
        <header className="bg-teal-900 text-teal-50 shadow-md sticky top-0 z-30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="md:hidden text-teal-300 hover:text-white"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-teal-950">
                            SA
                        </span>
                        <div className="leading-tight">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-teal-200/80">Role</p>
                            <p className="text-sm font-semibold">Support</p>
                        </div>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
                    {SUPPORT_LINKS.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="px-3 py-1.5 rounded-full hover:bg-teal-800 text-teal-50"
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
