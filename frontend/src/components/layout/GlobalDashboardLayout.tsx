// @ts-nocheck
import React, { useState } from 'react'
import GlobalSidebar from './GlobalSidebar'
import GlobalTopNav from './GlobalTopNav'

interface GlobalDashboardLayoutProps {
    children: React.ReactNode
}

const GlobalDashboardLayout: React.FC<GlobalDashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            <GlobalSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col lg:ml-0">
                <GlobalTopNav onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default GlobalDashboardLayout




