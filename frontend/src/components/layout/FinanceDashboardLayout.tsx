// @ts-nocheck
import React, { useState } from 'react';
import FinanceSidebar from './FinanceSidebar';
import FinanceTopNav from './FinanceTopNav';
import { getAuthUser } from '@/utils/apiClient';
import { useNavigate } from 'react-router-dom';

interface FinanceDashboardLayoutProps {
    children: React.ReactNode;
}

const FinanceDashboardLayout: React.FC<FinanceDashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = getAuthUser();
    const navigate = useNavigate();

    // Only Accountant (role_id === 3) can access finance module
    if (!user || user.role_id !== 3) {
        navigate('/dashboard/owner');
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            <FinanceSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col">
                <FinanceTopNav onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default FinanceDashboardLayout;
