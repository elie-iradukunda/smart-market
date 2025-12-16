// @ts-nocheck
import React from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { getAuthUser } from '@/utils/apiClient'

interface GlobalTopNavProps {
    onMenuClick: () => void
}

const GlobalTopNav: React.FC<GlobalTopNavProps> = ({ onMenuClick }) => {
    const user = getAuthUser()

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
            <button
                onClick={onMenuClick}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors lg:hidden"
            >
                <Menu size={20} />
            </button>

            <div className="flex flex-1 items-center gap-4">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            placeholder="Search..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>

                    <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-600">{user?.email || 'user@topdesign.com'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default GlobalTopNav




