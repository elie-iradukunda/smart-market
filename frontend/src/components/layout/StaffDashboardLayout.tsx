// @ts-nocheck
import React, { useState } from 'react';
import StaffTopNav from './StaffTopNav';
import StaffSidebar from './StaffSidebar';

interface StaffDashboardLayoutProps {
    children: React.ReactNode;
}

const StaffDashboardLayout: React.FC<StaffDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            <div className="flex flex-1">
                <StaffSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <main className="flex-1  pb-20 md:pb-0">
                    <StaffTopNav onMenuClick={() => setIsSidebarOpen(true)} />

                    <div className="p-4 sm:p-6 lg:p-8">
                       {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffDashboardLayout;