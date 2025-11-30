// @ts-nocheck
import React, { useState } from 'react'
import ReceptionTopNav from './ReceptionTopNav'
import ReceptionSidebar from './ReceptionSidebar'

interface ReceptionDashboardLayoutProps {
    children: React.ReactNode
}

export default function ReceptionDashboardLayout({ children }: ReceptionDashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <ReceptionSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />


            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Navigation */}
                <ReceptionTopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/30">
                    {children}
                </main>
            </div>
        </div>
    )
}
