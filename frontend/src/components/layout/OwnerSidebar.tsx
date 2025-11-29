// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthUser, clearAuth } from '@/utils/apiClient'

const linkBase =
    'flex items-center space-x-3 p-3 transition duration-300 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 shadow-sm hover:shadow-md'

export default function OwnerSideNav() {
    const navigate = useNavigate()
    const user = getAuthUser()

    if (!user || user.role_id !== 1) return null

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <aside className="hidden md:flex w-64 flex-col rounded-3xl bg-white shadow-xl border border-slate-100 py-6 px-4 space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">Owner Control</h2>
            </div>

            <nav className="flex-1 space-y-1 text-sm">
                <Link to="/dashboard/owner" className={linkBase}>
                    <span className="inline-flex h-4 w-4 mr-1" aria-hidden="true">🏠</span>
                    Dashboard
                </Link>
                <Link to="/orders" className={linkBase}>
                    <span className="inline-flex h-4 w-4 mr-1" aria-hidden="true">📦</span>
                    Operations
                </Link>
                <Link to="/finance/reports" className={linkBase}>
                    <span className="inline-flex h-4 w-4 mr-1" aria-hidden="true">💰</span>
                    Finance
                </Link>
                <Link to="/crm/leads" className={linkBase}>
                    <span className="inline-flex h-4 w-4 mr-1" aria-hidden="true">👥</span>
                    Sales
                </Link>
                <Link to="/admin/users" className={linkBase}>
                    <span className="inline-flex h-4 w-4 mr-1" aria-hidden="true">👤</span>
                    Team
                </Link>
                <Link to="/admin/system-settings" className={linkBase}>
                    <span className="inline-flex h-4 w-4 mr-1" aria-hidden="true">⚙️</span>
                    Settings
                </Link>
            </nav>

            <button
                onClick={handleLogout}
                className="mt-auto inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-black transition"
            >
                Sign out
            </button>
        </aside>
    )
}
