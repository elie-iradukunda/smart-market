import React, { useState } from 'react';
import ControllerSidebar from './ControllerSidebar';
import ControllerTopNav from './ControllerTopNav';

interface ControllerDashboardLayoutProps {
    children: React.ReactNode;
}

const ControllerDashboardLayout: React.FC<ControllerDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <ControllerTopNav onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex flex-1">
                <ControllerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ControllerDashboardLayout;
