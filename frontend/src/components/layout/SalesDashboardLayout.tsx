// @ts-nocheck
import React, { useState } from 'react';
import SalesSidebar from './SalesSidebar';
import SalesTopNav from './SalesTopNav';

interface SalesDashboardLayoutProps {
    children: React.ReactNode;
}

const SalesDashboardLayout: React.FC<SalesDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <SalesSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            
            <div className="flex flex-col min-h-screen lg:pl-64">
               
                <SalesTopNav onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8 w-full max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SalesDashboardLayout;