import React, { useState } from 'react';
import MarketingSidebar from './MarketingSidebar';
import MarketingTopNav from './MarketingTopNav';

interface MarketingDashboardLayoutProps {
    children: React.ReactNode;
}

const MarketingDashboardLayout: React.FC<MarketingDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <MarketingTopNav onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex flex-1">
                <MarketingSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MarketingDashboardLayout;
