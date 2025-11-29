import React, { useState } from 'react'
import POSSidebar from './POSSidebar'
import PosTopNav from './PosTopNav'

interface POSDashboardLayoutProps {
    children: React.ReactNode
}

const POSDashboardLayout: React.FC<POSDashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            <POSSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col lg:pl-0 transition-all duration-300">
                <PosTopNav onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default POSDashboardLayout
