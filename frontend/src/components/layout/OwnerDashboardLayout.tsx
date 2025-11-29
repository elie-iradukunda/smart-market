// @ts-nocheck
import React, { useState } from 'react';
import OwnerSidebar from './OwnerSidebar';
import OwnerTopNav from './OwnerTopNav';

interface OwnerDashboardLayoutProps {
    children: React.ReactNode;
}

const OwnerDashboardLayout: React.FC<OwnerDashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            <OwnerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col">
                <OwnerTopNav onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default OwnerDashboardLayout;
