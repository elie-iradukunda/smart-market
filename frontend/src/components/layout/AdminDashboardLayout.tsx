import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopNav from './AdminTopNav';

interface AdminDashboardLayoutProps {
    children: React.ReactNode;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <AdminTopNav onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex flex-1">
                <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
