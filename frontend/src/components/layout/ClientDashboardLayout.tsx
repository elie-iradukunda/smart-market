// @ts-nocheck
import React, { useState } from 'react';
import ClientSidebar from './ClientSidebar';
import ClientTopNav from './ClientTopNav';

interface ClientDashboardLayoutProps {
    children: React.ReactNode;
}

const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">

            <ClientSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex flex-col flex-1 min-w-0">
                <ClientTopNav onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ClientDashboardLayout;
