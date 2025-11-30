import React, { useState } from 'react';
import InventoryManagerSidebar from './InventoryManagerSidebar';
import InventoryManagerTopNav from './InventoryManagerTopNav';

interface InventoryManagerDashboardLayoutProps {
    children: React.ReactNode;
}

const InventoryManagerDashboardLayout: React.FC<InventoryManagerDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <InventoryManagerTopNav onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex flex-1">
                <InventoryManagerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default InventoryManagerDashboardLayout;
