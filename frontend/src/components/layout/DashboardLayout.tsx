import React from 'react';
import { getAuthUser } from '@/utils/apiClient';
import GlobalDashboardLayout from './GlobalDashboardLayout';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const user = getAuthUser();

    if (!user) {
        return <>{children}</>; // Or redirect to login
    }

    // Use Global Dashboard Layout for all users with unified sidebar
    return <GlobalDashboardLayout>{children}</GlobalDashboardLayout>;
};

export default DashboardLayout;
