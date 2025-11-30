// @ts-nocheck
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthUser } from '@/utils/apiClient'
import { Menu } from 'lucide-react'

const INVENTORY_LINKS = [
    { path: '/dashboard/inventory', label: 'Overview' },
    { path: '/inventory/materials', label: 'Materials' },
    { path: '/inventory/suppliers', label: 'Suppliers' },
    { path: '/inventory/purchase-orders', label: 'Purchase Orders' },
]

interface InventoryManagerTopNavProps {
    onMenuClick?: () => void
}

export default function InventoryManagerTopNav({ onMenuClick }: InventoryManagerTopNavProps) {
    const navigate = useNavigate()
    const user = getAuthUser()

    // Only for Inventory Manager role (8)
    if (!user || user.role_id !== 8) {
        return null
    }

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    return (
        <header className="bg-emerald-900 text-emerald-50 shadow-md sticky top-0 z-30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="md:hidden text-emerald-300 hover:text-white"
                        onClick={onMenuClick}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-emerald-950">
                            IM
                        </span>
                        <div className="leading-tight">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">Role</p>
                            <p className="text-sm font-semibold">Inventory</p>
                        </div>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-4 text-xs font-medium">
                    {INVENTORY_LINKS.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="px-3 py-1.5 rounded-full hover:bg-emerald-800 text-emerald-50"
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
