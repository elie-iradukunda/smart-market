// @ts-nocheck
import React, { useState } from 'react'
import TechnicianTopNav from './TechnicianTopNav'
import TechnicianSidebar from './TechnicianSidebar'

interface TechnicianDashboardLayoutProps {
    children: React.ReactNode
}

export default function TechnicianDashboardLayout({ children }: TechnicianDashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <TechnicianSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Navigation */}
                <TechnicianTopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-sky-50/30 via-white to-cyan-50/30">
                    {children}
                </main>
            </div>
        </div>
    )
}
