import React, { useState } from 'react';
import StaffSidebar from "../layout/StaffSidebar"
interface StaffDashboardLayoutProps {
    children: React.ReactNode;
}

const StaffDashboardLayout: React.FC<StaffDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="flex flex-1">
                <StaffSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default StaffDashboardLayout;