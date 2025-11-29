import React from 'react';
import { getAuthUser } from '@/utils/apiClient';
import OwnerDashboardLayout from './OwnerDashboardLayout';
import FinanceDashboardLayout from './FinanceDashboardLayout';
import POSDashboardLayout from './POSDashboardLayout';
import InventoryLayout from './InventoryLayout';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const user = getAuthUser();

    if (!user) {
        return <>{children}</>; // Or redirect to login
    }

    // Ensure role_id is treated as a number
    const roleId = Number(user.role_id);

    switch (roleId) {
        case 1: // Owner
        case 7: // Super Admin
            return <OwnerDashboardLayout>{children}</OwnerDashboardLayout>;
        case 3: // Accountant
            return <FinanceDashboardLayout>{children}</FinanceDashboardLayout>;
        case 9: // POS / Sales Rep
            return <POSDashboardLayout>{children}</POSDashboardLayout>;
        case 6: // Controller / Inventory
        case 8: // Manager
            return <InventoryLayout>{children}</InventoryLayout>;
        default:
            // Fallback: If the user is an Owner/Admin but role_id wasn't caught above
            if (roleId === 1 || roleId === 7) {
                return <OwnerDashboardLayout>{children}</OwnerDashboardLayout>;
            }
            // For other roles, we might want to return a default layout or just children
            // For now, returning children allows the page to render without a sidebar if no layout matches,
            // which is better than showing the WRONG sidebar.
            return <>{children}</>;
    }
};

export default DashboardLayout;
