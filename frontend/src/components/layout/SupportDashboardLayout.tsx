import React, { useState } from 'react';
import SupportSidebar from './SupportSidebar';
import SupportTopNav from './SupportTopNav';

interface SupportDashboardLayoutProps {
    children: React.ReactNode;
}

const SupportDashboardLayout: React.FC<SupportDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <SupportTopNav onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex flex-1">
                <SupportSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SupportDashboardLayout;
