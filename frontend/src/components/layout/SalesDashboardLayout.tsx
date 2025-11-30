import React, { useState } from 'react';
import SalesSidebar from './SalesSidebar';
import SalesTopNav from './SalesTopNav';

interface SalesDashboardLayoutProps {
    children: React.ReactNode;
}

const SalesDashboardLayout: React.FC<SalesDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // We can pass a prop to SalesTopNav to handle mobile menu toggle if we update SalesTopNav to support it.
    // For now, let's assume SalesTopNav might need an update or we wrap it.
    // Looking at SalesTopNav code, it doesn't seem to have a mobile menu button prop yet.
    // I should update SalesTopNav to accept onMenuClick.

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Pass onMenuClick if SalesTopNav supports it, otherwise we might need to add a wrapper or update SalesTopNav */}
            <SalesTopNav />
            <div className="flex flex-1">
                <SalesSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SalesDashboardLayout;
