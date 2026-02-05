// @ts-nocheck
import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import {
    Menu,
    User,
    LogOut,
    Bell
} from 'lucide-react'

interface ClientTopNavProps {
    onMenuClick?: () => void
}

export default function ClientTopNav({ onMenuClick }: ClientTopNavProps) {
    const navigate = useNavigate()
    const user = getAuthUser()

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-6">

                {/* Left: Mobile Menu + Branding */}
                <div className="flex items-center gap-4 shrink-0">
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-5 w-5 text-slate-600" />
                    </button>

                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <User size={18} />
                        </div>
                        <span className="font-bold tracking-tight text-slate-900">
                            SmartMarket
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell size={20} />
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold text-slate-900">{user?.name || 'Client'}</span>
                            <span className="text-[10px] text-slate-500 uppercase">Customer</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
